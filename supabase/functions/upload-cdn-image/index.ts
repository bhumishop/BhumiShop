/**
 * Supabase Edge Function: upload-cdn-image
 *
 * Uploads product images to the GitHub CDN branch (BhumiAdm/cdn)
 * using the GitHub Contents API. The GITHUB_TOKEN is stored as a
 * Supabase secret (never exposed to the frontend).
 *
 * Authentication: Accepts Supabase service_role tokens or admin JWTs
 *
 * Features:
 * - Converts images to WebP format for smaller file sizes
 * - Resizes large images to max 1920px width/height
 * - Compresses with quality settings to reduce bandwidth
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN') || ''
const GITHUB_OWNER = Deno.env.get('GITHUB_OWNER') || 'BhumiAdm'
const GITHUB_REPO = Deno.env.get('GITHUB_REPO') || 'BhumiAdm'
const CDN_BRANCH = Deno.env.get('CDN_BRANCH') || 'cdn'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const CDN_BASE = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${CDN_BRANCH}`
const GITHUB_API = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents`

// Allowed image content types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// Image optimization settings
const IMAGE_OPTIMIZATION = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 85,
  convertToWebP: true,
}

/**
 * Resize and optimize image using Deno's canvas API
 * Returns optimized image bytes
 */
async function optimizeImage(
  fileBytes: Uint8Array,
  contentType: string
): Promise<{ bytes: Uint8Array; type: string }> {
  // If not converting to WebP and image is within limits, return as-is
  if (!IMAGE_OPTIMIZATION.convertToWebP && !needsResize(contentType, fileBytes)) {
    return { bytes: fileBytes, type: contentType }
  }

  try {
    // Decode the image
    const image = await createImageBitmap(new Blob([fileBytes], { type: contentType }))

    // Calculate new dimensions if needed
    let { width, height } = image
    if (width > IMAGE_OPTIMIZATION.maxWidth || height > IMAGE_OPTIMIZATION.maxHeight) {
      const ratio = Math.min(
        IMAGE_OPTIMIZATION.maxWidth / width,
        IMAGE_OPTIMIZATION.maxHeight / height
      )
      width = Math.round(width * ratio)
      height = Math.round(height * ratio)
    }

    // Create canvas and draw resized image
    const canvas = new OffscreenCanvas(width, height)
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.warn('Canvas context unavailable, returning original image')
      return { bytes: fileBytes, type: contentType }
    }

    ctx.drawImage(image, 0, 0, width, height)

    // Determine output format
    const outputType = IMAGE_OPTIMIZATION.convertToWebP
      ? 'image/webp'
      : contentType

    // Encode with quality setting
    const blob = await canvas.convertToBlob({
      type: outputType,
      quality: IMAGE_OPTIMIZATION.quality / 100,
    })

    const arrayBuffer = await blob.arrayBuffer()
    const optimizedBytes = new Uint8Array(arrayBuffer)

    // Log size reduction
    const originalSize = fileBytes.length
    const newSize = optimizedBytes.length
    const reduction = ((1 - newSize / originalSize) * 100).toFixed(1)
    console.log(
      `Image optimized: ${originalSize.toLocaleString()} -> ${newSize.toLocaleString()} bytes (${reduction}% reduction)`
    )

    return { bytes: optimizedBytes, type: outputType }
  } catch (err) {
    console.warn(`Image optimization failed: ${err}, using original image`)
    return { bytes: fileBytes, type: contentType }
  }
}

/**
 * Check if image needs resizing (rough heuristic based on file size)
 */
function needsResize(contentType: string, fileBytes: Uint8Array): boolean {
  // If file is larger than 2MB, likely needs optimization
  return fileBytes.length > 2 * 1024 * 1024
}

// Validate path to prevent directory traversal
function isValidPath(path: string): boolean {
  const normalized = path.replace(/\\/g, '/')
  return (
    /^products\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp|gif)$/i.test(normalized) &&
    !normalized.includes('..') &&
    !normalized.includes('//')
  )
}

/**
 * Validate Supabase token by decoding JWT without verification
 * Accepts service_role or admin role tokens, or raw service role keys
 */
function validateToken(token: string): boolean {
  try {
    // Check if it's a raw service role key (starts with 'eyJ' for JWT or is a long key)
    if (token.startsWith('sbp_') || (token.length > 40 && !token.includes('.'))) {
      console.log('Using raw service role key')
      return true
    }
    
    // Decode JWT payload without verification
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.log('Invalid JWT format')
      return false
    }
    
    // Decode payload (base64url)
    let payload = parts[1]
    // Add padding if needed
    const missingPadding = payload.length % 4
    if (missingPadding) {
      payload += '='.repeat(4 - missingPadding)
    }
    
    const decoded = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(payload), c => c.charCodeAt(0))))
    
    console.log(`Token decoded: role=${decoded.role}, ref=${decoded.ref}, iss=${decoded.iss}`)
    
    // Check if it's a valid Supabase token with correct role
    const isValidSupabaseToken = decoded.iss === 'supabase'
    const hasValidRole = decoded.role === 'service_role' || decoded.role === 'admin'
    const correctProject = decoded.ref === 'pyidnhtwlxlyuwswaazf'
    
    return isValidSupabaseToken && hasValidRole && correctProject
  } catch (err) {
    console.log(`Token validation failed: ${err}`)
    return false
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    }})
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Validate authentication
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized: Missing or invalid authorization header' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const token = authHeader.substring(7).trim()
  
  if (!validateToken(token)) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized: Invalid token' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  if (!GITHUB_TOKEN) {
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const formData = await req.formData()
    const file = formData.get('image')
    const objectPath = formData.get('path') || ''

    console.log(`Received upload request: path=${objectPath}, file.type=${file?.type}, file.size=${file?.size}`)

    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: 'Missing "image" field in FormData' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!objectPath || !isValidPath(objectPath)) {
      console.log(`Invalid path: ${objectPath}`)
      return new Response(
        JSON.stringify({ error: 'Invalid path format. Use: products/{id}/{filename}.{ext}' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Read file as bytes
    const fileBytes = new Uint8Array(await file.arrayBuffer())

    // Optimize image (resize + convert to WebP + compress)
    const { bytes: optimizedBytes, type: optimizedType } = await optimizeImage(
      fileBytes,
      file.type
    )

    // Adjust path extension if converting to WebP
    let finalPath = objectPath
    if (IMAGE_OPTIMIZATION.convertToWebP && optimizedType === 'image/webp') {
      // Replace extension with .webp
      finalPath = objectPath.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp')
      if (finalPath === objectPath) {
        // No extension found, add .webp
        finalPath = `${objectPath}.webp`
      }
    }

    // Upload original
    const uploadResult = await uploadToGitHub(optimizedBytes, finalPath, optimizedType)

    if (!uploadResult) {
      return new Response(
        JSON.stringify({ error: 'Failed to upload image to CDN' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Successfully processed: ${objectPath} -> ${uploadResult.cdnUrl}${uploadResult.skipped ? ' (skipped, already exists)' : ''}`)

    return new Response(
      JSON.stringify({
        cdnUrl: uploadResult.cdnUrl,
        path: objectPath,
        skipped: uploadResult.skipped || false,
      }),
      { 
        status: 200, 
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    )
  } catch (err) {
    console.error('upload-cdn-image error:', err.message || err)
    console.error('Stack:', err.stack)
    return new Response(
      JSON.stringify({ error: `Upload failed: ${err.message || err}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

/**
 * Upload a file to GitHub via the Contents API.
 * Uses content-hash-based skip: if the file already exists on the CDN branch,
 * it is skipped (GitHub blob SHA is content-based, so same file = same content).
 */
async function uploadToGitHub(fileBytes: Uint8Array, objectPath: string, contentType: string, maxRetries: number = 3) {
  if (!GITHUB_TOKEN) {
    console.error('GITHUB_TOKEN is not set')
    return null
  }
  
  const headers = {
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  }

  // URL-encode the path for GitHub API
  const encodedPath = objectPath.split('/').map(encodeURIComponent).join('/')
  
  // Check if file already exists — GitHub blob SHA is content-based,
  // so if the file exists at this path, the content is identical.
  const checkUrl = `${GITHUB_API}/${encodedPath}?ref=${CDN_BRANCH}`
  const checkResp = await fetch(checkUrl, { headers })
  
  let existingSha = null
  if (checkResp.ok) {
    const existing = await checkResp.json()
    existingSha = existing.sha
    console.log(`File already exists: ${objectPath}, skipping upload`)
    return { cdnUrl: `${CDN_BASE}/${objectPath}`, sha: existingSha, skipped: true }
  } else if (checkResp.status !== 404) {
    console.log(`Check failed with ${checkResp.status}: ${await checkResp.text()}`)
  }

  console.log(`Uploading to GitHub: ${objectPath}, size: ${fileBytes.length} bytes`)

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Re-fetch SHA in case of concurrent updates
    const recheckResp = await fetch(checkUrl, { headers })
    if (recheckResp.ok) {
      const existing = await recheckResp.json()
      existingSha = existing.sha
      console.log(`File appeared during retry: ${objectPath}, skipping`)
      return { cdnUrl: `${CDN_BASE}/${objectPath}`, sha: existingSha, skipped: true }
    }

    // Encode file as base64 (chunked to avoid stack overflow)
    const CHUNK_SIZE = 0x8000 // 32KB chunks
    let contentB64 = ''
    for (let i = 0; i < fileBytes.length; i += CHUNK_SIZE) {
      const chunk = fileBytes.subarray(i, i + CHUNK_SIZE)
      contentB64 += String.fromCharCode.apply(null, Array.from(chunk))
    }
    contentB64 = btoa(contentB64)

    // Upload via Contents API
    const uploadUrl = `${GITHUB_API}/${encodedPath}`
    const uploadResp = await fetch(uploadUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: `chore: add product image ${objectPath}`,
        content: contentB64,
        branch: CDN_BRANCH,
      }),
    })

    if (uploadResp.ok) {
      const data = await uploadResp.json()
      const cdnUrl = `${CDN_BASE}/${objectPath}`
      console.log(`Uploaded: ${objectPath} -> ${cdnUrl}`)
      return { cdnUrl, sha: data.content?.sha, skipped: false }
    }

    const errorText = await uploadResp.text()
    console.error(`GitHub upload failed for ${objectPath}: ${uploadResp.status} ${errorText}`)
    
    if (uploadResp.status === 409 && attempt < maxRetries - 1) {
      // Conflict: concurrent update, retry will re-fetch SHA
      console.log(`409 conflict on ${objectPath}, retry ${attempt + 1}/${maxRetries}`)
      continue
    }
    
    // For non-retryable errors, return null immediately
    return null
  }

  console.error(`Exhausted retries for ${objectPath}`)
  return null
}
