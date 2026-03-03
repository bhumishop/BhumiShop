<template>
  <div class="app-container">
    <header class="app-header">
      <div class="logo">
        <router-link to="/">
          <h1>BHUMI<span class="accent">SHOP</span></h1>
        </router-link>
      </div>
      <nav class="main-nav">
        <router-link to="/">Início</router-link>
        <router-link to="/produtos">Produtos</router-link>
        <router-link to="/videos">Vídeos</router-link>
        <router-link to="/sobre">Sobre</router-link>
      </nav>
      <div class="header-actions">
        <router-link v-if="authStore.isLoggedIn" to="/perfil" class="user-link" title="Minha Conta">
          👤
        </router-link>
        <router-link v-else to="/login" class="user-link" title="Login">
          👤
        </router-link>
        <router-link to="/carrinho" class="cart-icon">
          <span class="cart-count" v-if="cartCount > 0">{{ cartCount }}</span>
          🛒
        </router-link>
      </div>
    </header>
    
    <main class="app-main">
      <router-view />
    </main>
    
    <footer class="app-footer">
      <p>&copy; 2026 Bhumisparsha School. Todos os direitos reservados.</p>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from './stores/cart'
import { useAuthStore } from './stores/auth'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

const cartCount = computed(() => cartStore.items.length)

onMounted(() => {
  authStore.initialize()
})

async function handleLogout() {
  await authStore.signOut()
  router.push('/')
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: 
    linear-gradient(180deg, 
      rgba(26, 26, 46, 0.98) 0%, 
      rgba(18, 18, 31, 0.95) 100%
    );
  border-bottom: 2px solid var(--accent-purple);
  position: relative;
  z-index: 100;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
}

.app-header::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    var(--accent-purple) 20%, 
    var(--accent-green) 50%, 
    var(--accent-purple) 80%, 
    transparent 100%
  );
  box-shadow: 0 0 10px var(--accent-purple), 0 0 20px var(--accent-green-glow);
}

.logo h1 {
  font-family: var(--font-display);
  font-size: 1.8rem;
  margin: 0;
  color: var(--text-primary);
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  letter-spacing: 0.1em;
}

.logo .accent {
  color: #00FF41;
  text-shadow: 
    0 0 10px var(--accent-green),
    0 0 20px var(--accent-green),
    0 0 40px var(--accent-green-glow);
}

.main-nav {
  display: flex;
  gap: 2rem;
}

.main-nav a {
  color: var(--text-secondary);
  text-decoration: none;
  font-family: var(--font-body);
  transition: color 0.3s ease;
}

.main-nav a:hover,
.main-nav a.router-link-active {
  color: #00FF41;
}

.cart-icon {
  font-size: 1.5rem;
  cursor: pointer;
  position: relative;
  text-decoration: none;
}

.user-link, .logout-btn {
  font-size: 1.3rem;
  color: #9D4EDD;
  text-decoration: none;
  transition: color 0.3s ease;
  background: none;
  border: none;
  cursor: pointer;
}

.user-link:hover, .logout-btn:hover {
  color: #7B2CBF;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.config-icon {
  font-size: 1.3rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.3s ease;
}

.config-icon:hover {
  color: var(--accent-purple);
}

.cart-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--accent-purple);
  color: #00FF41;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 50%;
}

.app-main {
  flex: 1;
}

.app-footer {
  padding: 1rem 2rem;
  text-align: center;
  background: var(--bg-secondary);
  border-top: 1px solid var(--accent-purple-dark);
  color: var(--text-secondary);
  font-family: var(--font-body);
}
</style>
