import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

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
      path: '/produtos/:id',
      name: 'product-detail',
      component: () => import('../views/ProductDetailView.vue')
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

  // Only initialize auth when actually needed (protected routes, guest routes, or admin)
  // Skip auth check for purely public routes like home and products
  const needsAuthCheck = to.meta.requiresAuth || to.meta.requiresAdmin || to.meta.guest

  if (needsAuthCheck && !authStore.initialized) {
    await authStore.initialize()
  }

  // Handle OAuth callback (Supabase returns with hash params)
  // Must check before guest/authenticated redirects to process the callback properly
  if (to.hash && (to.hash.includes('access_token') || to.hash.includes('error'))) {
    // Let the auth component handle the OAuth callback
    return
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
    return { name: 'home', replace: true }
  }
})

export default router
