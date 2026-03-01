<template>
  <div class="profile-page container">
    <h1 class="page-title">Minha Conta</h1>

    <div v-if="loading" class="loading">
      <p>Carregando...</p>
    </div>

    <div v-else-if="!authStore.isLoggedIn" class="not-logged">
      <p>Faça login para acessar sua conta</p>
      <router-link to="/login" class="btn-primary">
        Fazer Login
      </router-link>
    </div>

    <div v-else class="profile-content">
      <div class="profile-card">
        <div class="user-avatar">
          {{ userInitials }}
        </div>
        <div class="user-info">
          <h2>{{ authStore.user?.email }}</h2>
          <p class="member-since">Membro desde {{ memberSince }}</p>
        </div>
      </div>

      <div class="profile-menu">
        <router-link to="/minhas-compras" class="menu-item">
          <span class="menu-icon">📦</span>
          <span class="menu-text">Meus Pedidos</span>
          <span class="menu-arrow">›</span>
        </router-link>

        <button @click="handleLogout" class="menu-item logout">
          <span class="menu-icon">🚪</span>
          <span class="menu-text">Sair</span>
          <span class="menu-arrow">›</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)

const userInitials = computed(() => {
  const email = authStore.user?.email || ''
  return email.charAt(0).toUpperCase()
})

const memberSince = computed(() => {
  if (authStore.user?.created_at) {
    return new Date(authStore.user.created_at).toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    })
  }
  return 'janeiro de 2024'
})

onMounted(async () => {
  await authStore.initialize()
  loading.value = false
})

async function handleLogout() {
  await authStore.signOut()
  router.push('/')
}
</script>

<style scoped>
.profile-page {
  padding: 3rem 1rem;
  min-height: 60vh;
}

.page-title {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 3rem;
}

.loading, .not-logged {
  text-align: center;
  padding: 4rem;
}

.not-logged p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.btn-primary {
  display: inline-block;
  background: var(--accent-purple);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
}

.profile-content {
  max-width: 600px;
  margin: 0 auto;
}

.profile-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--accent-purple);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  color: white;
}

.user-info h2 {
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
  word-break: break-all;
}

.member-since {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.profile-menu {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  color: var(--text-primary);
  cursor: pointer;
  transition: background 0.3s ease;
  text-decoration: none;
  border-bottom: 1px solid var(--border-color);
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background: var(--bg-secondary);
}

.menu-icon {
  font-size: 1.25rem;
}

.menu-text {
  flex: 1;
  font-size: 1rem;
}

.menu-arrow {
  color: var(--text-muted);
  font-size: 1.5rem;
}

.menu-item.logout {
  color: #ff6b6b;
}

.menu-item.logout:hover {
  background: rgba(255, 107, 107, 0.1);
}
</style>
