/**
 * Supabase Edge Function: manage-admins
 *
 * Admin management - promote/demote users, list admins, add new admins.
 * Only super_admins can manage other admins.
 *
 * Endpoints:
 *   GET    /manage-admins              - List all admins
 *   POST   /manage-admins/promote      - Promote user to admin
 *   POST   /manage-admins/demote       - Demote admin to regular user
 *   POST   /manage-admins/remove       - Remove admin completely
 *   POST   /manage-admins/add          - Add new admin by email
 *   PATCH  /manage-admins/:id/role     - Update admin role
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { jwtVerify } from 'https://esm.sh/jose@5.2.0'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://ponvsicrfwafuxyqpoti.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const JWT_SECRET = Deno.env.get('JWT_SECRET') || SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

function corsHeaders(origin?: string): Record<string, string> {
  const allowedOrigins = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').filter(Boolean)
  const defaultOrigins = ['https://bhumishop.github.io', 'https://ponvsicrfwafuxyqpoti.supabase.co']
  const allOrigins = [...allowedOrigins, ...defaultOrigins].filter(Boolean)
  const allowOrigin = allOrigins.includes(origin || '') ? origin : (allOrigins[0] || '*')
  return {
    'Access-Control-Allow-Origin': allowOrigin ?? '*',
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info, x-bhumi-admin',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  }
}

/**
 * Verify admin token and check if they are super_admin
 */
async function verifySuperAdmin(req: Request): Promise<{ valid: boolean; admin?: Record<string, unknown>; error?: string; status?: number }> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'No token provided', status: 401 }
  }

  const token = authHeader.substring(7)
  
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET),
      { algorithms: ['HS256'] }
    )
    
    const adminUuid = (payload as any).admin_uuid
    const role = (payload as any).role
    
    if (!adminUuid) {
      return { valid: false, error: 'Invalid token: missing admin_uuid', status: 401 }
    }
    
    // Only super_admins can manage admins
    if (role !== 'super_admin') {
      return { valid: false, error: 'Insufficient permissions: super_admin required', status: 403 }
    }
    
    // Fetch full admin info
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('admin_uuid, email, name, role, is_allowed')
      .eq('admin_uuid', adminUuid)
      .single()
    
    if (error || !admin) {
      return { valid: false, error: 'Admin not found', status: 404 }
    }
    
    // Security: Verify role in database matches JWT claim
    if (admin.role !== role) {
      console.error(`Role mismatch: JWT claims '${role}' but DB has '${admin.role}' for ${adminUuid}`)
      return { valid: false, error: 'Role mismatch: token may be tampered', status: 403 }
    }
    
    // Security: Double-check is_allowed flag
    if (!admin.is_allowed) {
      return { valid: false, error: 'Admin account has been disabled', status: 403 }
    }
    
    return { valid: true, admin }
  } catch {
    return { valid: false, error: 'Invalid or expired token', status: 401 }
  }
}

serve(async (req) => {
  const origin = req.headers.get('origin') || undefined
  const cors = corsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors })
  }

  const url = new URL(req.url)
  const pathParts = url.pathname.split('/').filter(Boolean)
  const lastPart = pathParts[pathParts.length - 1]

  try {
    // ============================================
    // GET /manage-admins - List all admins
    // ============================================
    if (req.method === 'GET' && lastPart === 'manage-admins') {
      const auth = await verifySuperAdmin(req)
      if (!auth.valid) {
        return new Response(JSON.stringify({ error: auth.error }), {
          status: auth.status,
          headers: { ...cors, 'Content-Type': 'application/json' }
        })
      }

      const { data: admins, error } = await supabase
        .from('admin_users')
        .select('admin_uuid, email, name, role, is_allowed, last_login, created_at')
        .order('created_at', { ascending: false })

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...cors, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ data: admins }), {
        status: 200,
        headers: { ...cors, 'Content-Type': 'application/json' }
      })
    }

    // ============================================
    // POST /manage-admins/promote - Promote user to admin
    // ============================================
    if (req.method === 'POST' && lastPart === 'promote') {
      const auth = await verifySuperAdmin(req)
      if (!auth.valid) {
        return new Response(JSON.stringify({ error: auth.error }), {
          status: auth.status,
          headers: { ...cors, 'Content-Type': 'application/json' }
        })
      }

      const body = await req.json()
      const { email, role = 'admin' } = body

      if (!email) {
        return new Response(JSON.stringify({ error: 'email is required' }), {
          status: 400,
          headers: { ...cors, 'Content-Type': 'application/json' }
        })
      }

      // Check if already an admin
      const { data: existing } = await supabase
        .from('admin_users')
        .select('admin_uuid, email, role')
        .eq('email', email.toLowerCase())
        .single()

      if (existing) {
        // Update existing admin role
        const { data: updated, error } = await supabase
          .from('admin_users')
          .update({ role, is_allowed: true, updated_at: new Date().toISOString() })
          .eq('email', email.toLowerCase())
          .select('admin_uuid, email, name, role, is_allowed')
          .single()

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...cors, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ data: updated, action: 'updated' }), {
          status: 200,
          headers: { ...cors, 'Content-Type': 'application/json' }
        })
      }

      // Create new admin user
      const { data: newAdmin, error } = await supabase
        .from('admin_users')
        .insert({
          email: email.toLowerCase(),
          role,
          is_allowed: true,
          name: body.name || email.split('@')[0],
        })
        .select('admin_uuid, email, name, role, is_allowed')
        .single()

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...cors, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ data: newAdmin, action: 'created' }), {
        status: 201,
        headers: { ...cors, 'Content-Type': 'application/json' }
      })
    }

    // ============================================
    // POST /manage-admins/demote - Demote admin to regular user
    // ============================================
    if (req.method === 'POST' && lastPart === 'demote') {
      const auth = await verifySuperAdmin(req)
      if (!auth.valid) {
        return new Response(JSON.stringify({ error: auth.error }), {
          status: auth.status,
          headers: { ...cors, 'Content-Type': 'application/json' }
        })
      }

      const body = await req.json()
      const { admin_uuid, email } = body

      if (!admin_uuid && !email) {
        return new Response(JSON.stringify({ error: 'admin_uuid or email is required' }), {
          status: 400,
          headers: { ...cors, 'Content-Type': 'application/json' }
        })
      }

      // Prevent self-demotion
      if (admin_uuid && admin_uuid === (auth.admin as any).admin_uuid) {
        return new Response(JSON.stringify({ error: 'Cannot demote yourself' }), {
          status: 400,
          headers: { ...cors, 'Content-Type': 'application/json' }
        })
      }

      const query = supabase
        .from('admin_users')
        .update({ role: 'admin', is_allowed: false, updated_at: new Date().toISOString() })

      if (admin_uuid) {
        query.eq('admin_uuid', admin_uuid)
      } else {
        query.eq('email', email.toLowerCase())
      }

      const { data, error } = await query.select('admin_uuid, email, name, role, is_allowed').single()

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...cors, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ data, action: 'demoted' }), {
        status: 200,
        headers: { ...cors, 'Content-Type': 'application/json' }
      })
    }

    // ============================================
    // POST /manage-admins/remove - Remove admin completely
    // ============================================
    if (req.method === 'POST' && lastPart === 'remove') {
      const auth = await verifySuperAdmin(req)
      if (!auth.valid) {
        return new Response(JSON.stringify({ error: auth.error }), {
          status: auth.status,
          headers: { ...cors, 'Content-Type': 'application/json' }
        })
      }

      const body = await req.json()
      const { admin_uuid, email } = body

      if (!admin_uuid && !email) {
        return new Response(JSON.stringify({ error: 'admin_uuid or email is required' }), {
          status: 400,
          headers: { ...cors, 'Content-Type': 'application/json' }
        })
      }

      // Prevent self-removal
      if (admin_uuid && admin_uuid === (auth.admin as any).admin_uuid) {
        return new Response(JSON.stringify({ error: 'Cannot remove yourself' }), {
          status: 400,
          headers: { ...cors, 'Content-Type': 'application/json' }
        })
      }

      const query = supabase.from('admin_users').delete()

      if (admin_uuid) {
        query.eq('admin_uuid', admin_uuid)
      } else {
        query.eq('email', email.toLowerCase())
      }

      const { error } = await query

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...cors, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ message: 'Admin removed successfully' }), {
        status: 200,
        headers: { ...cors, 'Content-Type': 'application/json' }
      })
    }

    // ============================================
    // PATCH /manage-admins/:id/role - Update admin role
    // ============================================
    if (req.method === 'PATCH' && lastPart === 'role') {
      const auth = await verifySuperAdmin(req)
      if (!auth.valid) {
        return new Response(JSON.stringify({ error: auth.error }), {
          status: auth.status,
          headers: { ...cors, 'Content-Type': 'application/json' }
        })
      }

      const adminId = pathParts[pathParts.length - 2]
      const body = await req.json()
      const { role } = body

      if (!role || !['admin', 'super_admin'].includes(role)) {
        return new Response(JSON.stringify({ error: 'Invalid role. Must be admin or super_admin' }), {
          status: 400,
          headers: { ...cors, 'Content-Type': 'application/json' }
        })
      }

      const { data: updated, error } = await supabase
        .from('admin_users')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('admin_uuid', adminId)
        .select('admin_uuid, email, name, role, is_allowed')
        .single()

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...cors, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ data: updated }), {
        status: 200,
        headers: { ...cors, 'Content-Type': 'application/json' }
      })
    }

    // ============================================
    // Not found
    // ============================================
    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...cors, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('manage-admins error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
    )
  }
})
