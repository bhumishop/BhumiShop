<template>
  <div class="profile-page container">
    <h1 class="profile-page__title">{{ $t('profile.title') }}</h1>

    <div v-if="authStore.loading" class="profile-page__loading">
      <BaseSkeleton variant="text" width="50%" />
      <BaseSkeleton variant="text" />
    </div>

    <div v-else-if="authStore.user" class="profile-card">
      <div class="profile-card__header">
        <div class="profile-card__avatar">
          {{ authStore.userName.charAt(0).toUpperCase() }}
        </div>
        <div>
          <h2 class="profile-card__name">{{ authStore.userName }}</h2>
          <p class="profile-card__email">{{ authStore.userEmail }}</p>
        </div>
        <BaseBadge v-if="authStore.adminRole" variant="accent" size="sm">{{ $t('profile.admin') }}</BaseBadge>
      </div>

      <div class="profile-card__actions">
        <BaseButton variant="secondary" @click="$router.push('/minhas-compras')">
          {{ $t('profile.myOrders') }}
        </BaseButton>
        <BaseButton variant="ghost" @click="handleLogout">
          {{ $t('profile.logout') }}
        </BaseButton>
      </div>
    </div>

    <div v-else class="profile-page__empty">
      <p>{{ $t('profile.empty') }}</p>
      <BaseButton variant="primary" @click="$router.push('/login')">{{ $t('profile.login') }}</BaseButton>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'
import BaseButton from '../components/common/BaseButton.vue'
import BaseBadge from '../components/common/BaseBadge.vue'
import BaseSkeleton from '../components/common/BaseSkeleton.vue'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToastStore()
const { t } = useI18n()

async function handleLogout() {
  try {
    await authStore.signOut()
    toast.info(t('profile.toast.logoutSuccess'))
    router.push('/')
  } catch (err) {
    toast.error(t('profile.toast.logoutError'))
  }
}
</script>

<style scoped>
.profile-page {
  padding: clamp(1.5rem, 4vh, 2rem) clamp(1rem, 3vw, 1.5rem) clamp(2.5rem, 6vh, 4rem);
  max-width: min(40rem, 90vw);
  margin: 0 auto;
}

.profile-page__title {
  font-size: clamp(1.375rem, 3.5vw, 1.75rem);
  font-weight: 700;
  margin-bottom: clamp(1.25rem, 3vh, 2rem);
}

.profile-page__loading {
  display: flex;
  flex-direction: column;
  gap: clamp(0.625rem, 1.5vh, 1rem);
}

.profile-card {
  background: var(--surface-0);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  animation: scale-in 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.profile-card__header {
  display: flex;
  align-items: center;
  gap: clamp(0.75rem, 1.5vw, 1rem);
  padding: clamp(1rem, 2.5vw, 1.5rem);
  border-bottom: 1px solid var(--surface-2);
}

.profile-card__avatar {
  width: clamp(3rem, 6vw, 3.5rem);
  height: clamp(3rem, 6vw, 3.5rem);
  border-radius: 50%;
  background: var(--accent-light);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(1.125rem, 2.5vw, 1.25rem);
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: var(--glow-accent);
}

.profile-card__name {
  font-size: clamp(0.9rem, 1.6vw, 1rem);
  font-weight: 600;
}

.profile-card__email {
  font-size: clamp(0.75rem, 1.3vw, 0.85rem);
  color: var(--text-secondary);
}

.profile-card__actions {
  display: flex;
  gap: clamp(0.5rem, 1.2vw, 0.75rem);
  padding: clamp(1rem, 2.5vw, 1.5rem);
}

.profile-page__empty {
  text-align: center;
  padding: clamp(2.5rem, 8vh, 4rem) 0;
  color: var(--text-muted);
}

.profile-page__empty p {
  margin-bottom: clamp(0.625rem, 1.5vh, 1rem);
}
</style>
