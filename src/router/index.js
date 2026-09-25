import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useProductStore } from '../stores/products'
import { findProductBySlug } from '../utils/slug'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/produtos',
      name: 'products',
      component: () => import('../views/ProductsView.vue')
    },
    {
      path: '/produtos/:slug',
      name: 'product-detail',
      component: () => import('../views/ProductDetailView.vue'),
      beforeEnter: async (to) => {
        // Ensure products are loaded before resolving route
        const productStore = useProductStore()
        if (productStore.products.length === 0) {
          await productStore.fetchProducts()
        }
        const product = findProductBySlug(productStore.products, to.params.slug)
        if (!product) {
          return { name: 'not-found', replace: true }
        }
      }
    },
    {
      path: '/carrinho',
      name: 'cart',
      component: () => import('../views/CartView.vue')
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('../views/CheckoutView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/AuthView.vue'),
      meta: { guest: true }
    },
    {
      path: '/minhas-compras',
      name: 'my-orders',
      component: () => import('../views/MyOrdersView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/perfil',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    // Institutional pages
    {
      path: '/sobre-nos',
      name: 'about-us',
      component: () => import('../views/AboutUsView.vue')
    },
    {
      path: '/contato',
      name: 'contact',
      component: () => import('../views/ContactView.vue')
    },
    {
      path: '/faq',
      name: 'faq',
      component: () => import('../views/FaqView.vue')
    },
    {
      path: '/privacidade',
      name: 'privacy',
      component: () => import('../views/PrivacyView.vue')
    },
    {
      path: '/termos',
      name: 'terms',
      component: () => import('../views/TermsView.vue')
    },
    {
      path: '/trocas',
      name: 'returns',
      component: () => import('../views/ReturnsView.vue')
    },
    {
      path: '/envio',
      name: 'shipping-policy',
      component: () => import('../views/ShippingPolicyView.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue')
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

router.beforeEach(async (to, from) => {
  const authStore = useAuthStore()

  // Handle OAuth callback (Supabase implicit flow returns tokens/errors in the URL hash)
  // Must check before guest/authenticated redirects to process the callback properly
  const hash = to.hash || ''
  const hasOAuthCallback = hash.includes('access_token=') || hash.includes('error=')

  // Initialize auth for OAuth callbacks, protected routes, guest routes, or admin
  const needsAuthCheck = to.meta.requiresAuth || to.meta.requiresAdmin || to.meta.guest || hasOAuthCallback

  if (needsAuthCheck && !authStore.initialized) {
    await authStore.initialize()
  }

  const resolvePostLoginTarget = () => {
    const savedRedirect = authStore.consumePostLoginRedirect()
    const rawRedirect = to.query.redirect || savedRedirect || '/'
    return typeof rawRedirect === 'string' && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//')
      ? rawRedirect
      : '/'
  }

  // If this is an OAuth callback and user is now authenticated, redirect to the saved/redirect URL
  if (hasOAuthCallback && authStore.isLoggedIn) {
    return { path: resolvePostLoginTarget(), replace: true }
  }

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath }, replace: true }
  }

  if (to.meta.requiresAdmin) {
    const isAdmin = await authStore.checkAdminRole()
    if (!isAdmin) {
      return { name: 'home', replace: true }
    }
  }

  if (to.meta.guest && authStore.isLoggedIn) {
    return { path: resolvePostLoginTarget(), replace: true }
  }
})

export default router
