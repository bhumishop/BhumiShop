import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProductsView from '../views/ProductsView.vue'
import ProductDetailView from '../views/ProductDetailView.vue'
import CartView from '../views/CartView.vue'
import AboutView from '../views/AboutView.vue'
import VideosView from '../views/VideosView.vue'
import AuthView from '../views/AuthView.vue'
import MyOrdersView from '../views/MyOrdersView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/produtos',
      name: 'products',
      component: ProductsView
    },
    {
      path: '/produtos/:id',
      name: 'product-detail',
      component: ProductDetailView
    },
    {
      path: '/carrinho',
      name: 'cart',
      component: CartView
    },
    {
      path: '/sobre',
      name: 'about',
      component: AboutView
    },
    {
      path: '/videos',
      name: 'videos',
      component: VideosView
    },
    {
      path: '/login',
      name: 'login',
      component: AuthView
    },
    {
      path: '/minhas-compras',
      name: 'my-orders',
      component: MyOrdersView
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router
