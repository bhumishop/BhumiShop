<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-card__header">
        <router-link to="/" class="auth-card__logo">
          <span class="auth-card__logo-text">Bhumi</span><span class="auth-card__logo-accent">Shop</span>
        </router-link>
        <h2 class="auth-card__title">{{ isLogin ? $t('auth.login') : $t('auth.register') }}</h2>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <BaseInput
          v-if="!isLogin"
          v-model="form.fullName"
          :label="$t('auth.fullName')"
          :placeholder="$t('auth.placeholders.name')"
          :error="errors.fullName"
        />
        <BaseInput
          v-model="form.email"
          :label="$t('auth.email')"
          type="email"
          :placeholder="$t('auth.placeholders.email')"
          required
          :error="errors.email"
        />
        <BaseInput
          v-model="form.password"
          :label="$t('auth.password')"
          type="password"
          :placeholder="$t('auth.placeholders.password')"
          required
          :error="errors.password"
        />

        <BaseButton variant="primary" full :loading="authStore.loading" type="submit">
          {{ isLogin ? $t('auth.login') : $t('auth.register') }}
        </BaseButton>

        <div v-if="generalError" class="auth-form__error">{{ generalError }}</div>
      </form>

      <div class="auth-card__divider">
        <span>{{ $t('auth.divider') }}</span>
      </div>

      <div class="auth-social-buttons">
        <BaseButton variant="secondary" full @click="handleGoogleLogin" class="auth-social-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          {{ $t('auth.google') }}
        </BaseButton>

        <BaseButton variant="secondary" full @click="handleWechatLogin" class="auth-social-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.438 1.703-1.407 3.882-1.986 6.3-1.626-.424-3.592-4.311-6.397-8.843-6.397zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.046c.133 0 .241-.11.241-.245 0-.06-.023-.118-.038-.177l-.326-1.233a.492.492 0 0 1 .177-.554C23.028 18.572 24 16.89 24 14.916c0-3.257-3.095-6.034-7.062-6.058zM14.87 13.3c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982z"/></svg>
          {{ $t('auth.wechat') }}
        </BaseButton>

        <BaseButton variant="secondary" full @click="handlePhoneLogin" class="auth-social-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
          {{ $t('auth.sms') }}
        </BaseButton>
      </div>

      <!-- Phone login form (shown when SMS is selected) -->
      <form v-if="showPhoneForm" class="auth-form auth-phone-form" @submit.prevent="handlePhoneSubmit">
        <BaseInput
          v-model="phoneForm.phone"
          :label="$t('auth.phone')"
          type="tel"
          :placeholder="$t('auth.phonePlaceholder')"
          required
          :error="errors.phone"
        />
        <BaseButton variant="primary" full :loading="authStore.loading" type="submit">
          {{ $t('auth.sendSmsCode') }}
        </BaseButton>
        <div v-if="phoneSuccess" class="auth-form__success">
          {{ $t('auth.codeSent') }}
        </div>
      </form>

      <p class="auth-card__switch">
        <button v-if="isLogin" @click="isLogin = false" class="auth-card__link">{{ $t('auth.switchToRegister') }}</button>
        <button v-else @click="isLogin = true" class="auth-card__link">{{ $t('auth.switchToLogin') }}</button>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'
import BaseButton from '../components/common/BaseButton.vue'
import BaseInput from '../components/common/BaseInput.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toast = useToastStore()
const { t } = useI18n()

const isLogin = ref(true)
const generalError = ref('')
const showPhoneForm = ref(false)
const phoneSuccess = ref(false)

const form = reactive({
  fullName: '',
  email: '',
  password: ''
})

const phoneForm = reactive({
  phone: ''
})

const errors = reactive({
  fullName: '',
  email: '',
  password: '',
  phone: ''
})

function validate() {
  errors.fullName = ''
  errors.email = ''
  errors.password = ''

  if (!isLogin.value && !form.fullName.trim()) {
    errors.fullName = t('auth.validation.nameRequired')
  }
  if (!form.email.trim()) {
    errors.email = t('auth.validation.emailRequired')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = t('auth.validation.emailInvalid')
  }
  if (!form.password) {
    errors.password = t('auth.validation.passwordRequired')
  } else if (form.password.length < 6) {
    errors.password = t('auth.validation.passwordMinLength')
  }

  return !errors.fullName && !errors.email && !errors.password
}

async function handleSubmit() {
  generalError.value = ''
  if (!validate()) return

  try {
    if (isLogin.value) {
      await authStore.signIn(form.email, form.password)
    } else {
      await authStore.signUp(form.email, form.password, form.fullName)
    }
    toast.success(isLogin.value ? t('auth.toast.loginSuccess') : t('auth.toast.registerSuccess'))
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (err) {
    generalError.value = err.message || t('auth.errors.processRequest')
  }
}

async function handleGoogleLogin() {
  try {
    await authStore.signInWithGoogle()
  } catch (err) {
    toast.error(t('auth.errors.processRequest'))
  }
}

async function handleWechatLogin() {
  try {
    await authStore.signInWithWechat()
  } catch (err) {
    toast.error(t('auth.errors.wechatLogin'))
  }
}

function handlePhoneLogin() {
  showPhoneForm.value = !showPhoneForm.value
  phoneSuccess.value = false
}

async function handlePhoneSubmit() {
  errors.phone = ''
  if (!phoneForm.phone.trim()) {
    errors.phone = t('auth.errors.phoneRequired')
    return
  }

  try {
    await authStore.signInWithPhone(phoneForm.phone)
    phoneSuccess.value = true
    toast.success(t('auth.toast.smsCodeSent'))
  } catch (err) {
    errors.phone = err.message || t('auth.errors.smsCode')
  }
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - var(--header-height));
  min-height: calc(100dvh - var(--header-height));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1.5rem, 4vh, 2rem) clamp(0.75rem, 2vw, 1rem);
  background: var(--surface-1);
}

.auth-card {
  width: 100%;
  max-width: min(26.25rem, 90vw);
  background: var(--surface-0);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: clamp(1.5rem, 4vw, 2rem);
  box-shadow: var(--shadow-md);
  animation: scale-in 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.auth-card__header {
  text-align: center;
  margin-bottom: clamp(1.25rem, 3vh, 2rem);
}

.auth-card__logo {
  font-size: clamp(1.125rem, 2.5vw, 1.25rem);
  font-weight: 700;
  text-decoration: none;
}

.auth-card__logo-text { color: var(--text-primary); }
.auth-card__logo-accent {
  color: var(--accent);
  text-shadow: 0 0 clamp(0.5rem, 1.5vw, 0.75rem) var(--accent-light);
}

.auth-card__title {
  font-size: clamp(1.125rem, 2.5vw, 1.25rem);
  font-weight: 600;
  margin-top: clamp(0.5rem, 1.2vh, 0.75rem);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 1.5vh, 1rem);
}

.auth-form__error {
  padding: clamp(0.5rem, 1.2vw, 0.75rem) clamp(0.625rem, 1.2vw, 1rem);
  background: var(--danger-light);
  color: var(--danger);
  border-radius: var(--radius-md);
  font-size: clamp(0.75rem, 1.3vw, 0.85rem);
}

.auth-form__success {
  padding: clamp(0.5rem, 1.2vw, 0.75rem) clamp(0.625rem, 1.2vw, 1rem);
  background: var(--success-light);
  color: var(--success);
  border-radius: var(--radius-md);
  font-size: clamp(0.75rem, 1.3vw, 0.85rem);
}

.auth-phone-form {
  margin-top: clamp(0.75rem, 2vh, 1rem);
}

.auth-card__divider {
  text-align: center;
  margin: clamp(1rem, 2.5vh, 1.5rem) 0;
  position: relative;
}

.auth-card__divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--border);
}

.auth-card__divider span {
  position: relative;
  padding: 0 clamp(0.625rem, 1.5vw, 1rem);
  background: var(--surface-0);
  font-size: clamp(0.7rem, 1.2vw, 0.8rem);
  color: var(--text-muted);
}

.auth-social-buttons {
  display: flex;
  flex-direction: column;
  gap: clamp(0.5rem, 1.2vh, 0.75rem);
}

.auth-social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
}

.auth-card__switch {
  text-align: center;
  margin-top: clamp(1rem, 2.5vh, 1.5rem);
  font-size: clamp(0.75rem, 1.3vw, 0.85rem);
  color: var(--text-secondary);
}

.auth-card__link {
  color: var(--accent);
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  font-size: clamp(0.75rem, 1.3vw, 0.85rem);
}

.auth-card__link:hover {
  text-decoration: underline;
}
</style>
