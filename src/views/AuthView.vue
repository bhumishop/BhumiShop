<template>
  <div class="auth-page">
    <div class="auth-box">
      <div class="auth-header">
        <h1>BHUMI <span class="accent">SHOP</span></h1>
        <p>{{ isLogin ? 'Entre com sua conta' : 'Crie sua conta' }}</p>
      </div>

      <div class="social-login">
        <button @click="handleGoogleLogin" class="btn-social google" :disabled="loading">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar com Google
        </button>
      </div>

      <div class="divider">
        <span>ou</span>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group">
          <label>Email</label>
          <input 
            v-model="email" 
            type="email" 
            placeholder="seu@email.com"
            required
          >
        </div>

        <div class="form-group">
          <label>Senha</label>
          <input 
            v-model="password" 
            type="password" 
            placeholder="••••••••"
            required
            minlength="6"
          >
        </div>

        <div v-if="!isLogin" class="form-group">
          <label>Confirmar Senha</label>
          <input 
            v-model="confirmPassword" 
            type="password" 
            placeholder="••••••••"
            required
            minlength="6"
          >
        </div>

        <div v-if="error" class="error-msg">{{ error }}</div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Cadastrar') }}
        </button>
      </form>

      <div class="auth-footer">
        <p v-if="isLogin">
          Não tem conta? 
          <a @click="toggleMode" href="#">Cadastrar</a>
        </p>
        <p v-else>
          Já tem conta? 
          <a @click="toggleMode" href="#">Entrar</a>
        </p>
        <p v-if="isLogin" class="forgot-password">
          <a @click="handleForgotPassword" href="#">Esqueci minha senha</a>
        </p>
      </div>

      <div class="guest-checkout">
        <router-link to="/" class="btn-secondary">
          Voltar para Loja
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  error.value = ''
  
  if (!isLogin.value && password.value !== confirmPassword.value) {
    error.value = 'As senhas não coincidem'
    return
  }

  loading.value = true
  
  try {
    if (isLogin.value) {
      await authStore.signIn(email.value, password.value)
      router.push('/minhas-compras')
    } else {
      await authStore.signUp(email.value, password.value)
      alert('Cadastro realizado! Verifique seu email para confirmar.')
      isLogin.value = true
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function handleGoogleLogin() {
  loading.value = true
  error.value = ''
  try {
    await authStore.signInWithGoogle()
  } catch (e) {
    error.value = e.message
    loading.value = false
  }
}

function toggleMode() {
  error.value = ''
  isLogin.value = !isLogin.value
}

async function handleForgotPassword() {
  if (!email.value) {
    error.value = 'Digite seu email para recuperar a senha'
    return
  }
  try {
    await authStore.resetPassword(email.value)
    alert('Email de recuperação enviado!')
  } catch (e) {
    error.value = e.message
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: 
    linear-gradient(180deg, 
      rgba(10, 10, 10, 0.9) 0%, 
      rgba(26, 26, 46, 0.8) 100%
    );
}

.auth-box {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h1 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.auth-header .accent {
  color: var(--accent-green);
}

.auth-header p {
  color: var(--text-secondary);
}

.social-login {
  margin-bottom: 1.5rem;
}

.btn-social {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.875rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-social:hover:not(:disabled) {
  border-color: var(--accent-purple);
}

.btn-social:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-social svg {
  flex-shrink: 0;
}

.divider {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-color);
}

.divider span {
  padding: 0 1rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.875rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: 6px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent-purple);
}

.btn-primary {
  width: 100%;
  padding: 1rem;
  background: var(--accent-purple);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent-purple-light);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed
}

.btn-secondary {
  display: block;
  width: 100%;
  padding: 1rem;
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  border-color: var(--accent-purple);
  color: var(--text-primary);
}

.error-msg {
  color: #ff4444;
  background: rgba(255, 68, 68, 0.1);
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.auth-footer {
  text-align: center;
  margin-top: 1.5rem;
  color: var(--text-secondary);
}

.auth-footer a {
  color: var(--accent-purple);
  cursor: pointer;
  text-decoration: none;
}

.auth-footer a:hover {
  color: var(--accent-green);
}

.forgot-password {
  margin-top: 0.75rem;
  font-size: 0.9rem;
}

.guest-checkout {
  margin-top: 2rem;
  text-align: center;
}

.guest-checkout p {
  color: var(--text-muted);
  margin-bottom: 1rem;
}
</style>
