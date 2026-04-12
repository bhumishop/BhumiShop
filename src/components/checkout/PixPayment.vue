<template>
  <div class="pix-payment">
    <div class="pix-payment__card">
      <h3 class="pix-payment__title">{{ $t('pixPayment.title') }}</h3>

      <div v-if="loading" class="pix-payment__loading">
        <div class="pix-payment__spinner"></div>
        <p>{{ $t('pixPayment.generating') }}</p>
      </div>

      <div v-else-if="pixData" class="pix-payment__content">
        <div class="pix-payment__qr">
          <img
            v-if="pixData.qrCode"
            :src="pixData.qrCode"
            alt="QR Code PIX"
            class="pix-payment__qr-img"
          />
          <div v-else class="pix-payment__qr-fallback">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
          </div>
        </div>

        <div class="pix-payment__copy">
          <p class="pix-payment__instruction">{{ $t('pixPayment.instructions') }}</p>
          <div class="pix-payment__code-wrap">
            <input
              :value="pixData.pixCode || pixData.payload || ''"
              type="text"
              readonly
              class="pix-payment__code"
            />
            <BaseButton variant="secondary" size="sm" @click="copyCode">
              {{ copied ? $t('pixPayment.copied') : $t('pixPayment.copy') }}
            </BaseButton>
          </div>
        </div>

        <div class="pix-payment__status">
          <p v-if="checking" class="pix-payment__checking">{{ $t('pixPayment.verifying') }}</p>
          <p v-else-if="paid" class="pix-payment__paid">{{ $t('pixPayment.confirmed') }}</p>
          <p v-else class="pix-payment__waiting">{{ $t('pixPayment.waiting') }}</p>

          <BaseButton
            variant="primary"
            size="sm"
            :loading="checking"
            @click="checkPayment"
          >
            {{ $t('pixPayment.paid') }}
          </BaseButton>
        </div>
      </div>

      <div v-else-if="error" class="pix-payment__error">
        <p>{{ error }}</p>
        <BaseButton variant="secondary" size="sm" @click="$emit('retry')">
          {{ $t('pixPayment.tryAgain') }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BaseButton from '../common/BaseButton.vue'

const props = defineProps({
  pixData: Object,
  loading: Boolean,
  checking: Boolean,
  paid: Boolean,
  error: String
})

const emit = defineEmits(['check', 'retry'])

const copied = ref(false)

function copyCode() {
  const code = props.pixData?.pixCode || props.pixData?.payload || ''
  if (!code) return
  navigator.clipboard.writeText(code).then(() => {
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  })
}

function checkPayment() {
  emit('check')
}
</script>

<style scoped>
.pix-payment__card {
  max-width: min(30rem, 90vw);
  margin: 0 auto;
  background: var(--surface-0);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: clamp(1.25rem, 3vw, 2rem);
  text-align: center;
  animation: scale-in 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.pix-payment__title {
  font-size: clamp(1rem, 2vw, 1.125rem);
  font-weight: 600;
  margin-bottom: clamp(1rem, 2.5vh, 1.5rem);
}

.pix-payment__loading {
  padding: clamp(2rem, 5vh, 3rem) 0;
  color: var(--text-secondary);
}

.pix-payment__spinner {
  width: clamp(2.25rem, 5vw, 2.5rem);
  height: clamp(2.25rem, 5vw, 2.5rem);
  border: 3px solid var(--surface-2);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  margin: 0 auto clamp(0.625rem, 1.5vh, 1rem);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.pix-payment__qr {
  width: clamp(10rem, 30vw, 12.5rem);
  height: clamp(10rem, 30vw, 12.5rem);
  margin: 0 auto clamp(1rem, 2.5vh, 1.5rem);
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--surface-0);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pix-payment__qr-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.pix-payment__qr-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
}

.pix-payment__copy {
  margin-bottom: clamp(1rem, 2.5vh, 1.5rem);
}

.pix-payment__instruction {
  font-size: clamp(0.75rem, 1.3vw, 0.85rem);
  color: var(--text-secondary);
  margin-bottom: clamp(0.5rem, 1.2vh, 0.75rem);
}

.pix-payment__code-wrap {
  display: flex;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
}

.pix-payment__code {
  flex: 1;
  padding: clamp(0.375rem, 0.75vw, 0.5rem) clamp(0.5rem, 1vw, 0.75rem);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: clamp(0.65rem, 1.1vw, 0.75rem);
  font-family: var(--font-mono);
  background: var(--surface-1);
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pix-payment__status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(0.625rem, 1.5vh, 1rem);
}

.pix-payment__checking {
  font-size: clamp(0.75rem, 1.3vw, 0.85rem);
  color: var(--info);
}

.pix-payment__paid {
  font-size: clamp(0.8rem, 1.4vw, 0.9rem);
  font-weight: 600;
  color: var(--success);
}

.pix-payment__waiting {
  font-size: clamp(0.75rem, 1.3vw, 0.85rem);
  color: var(--text-secondary);
}

.pix-payment__error {
  padding: clamp(1.25rem, 4vh, 2rem) 0;
  color: var(--danger);
}
</style>
