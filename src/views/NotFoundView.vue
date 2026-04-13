<template>
  <div class="not-found-page">
    <div class="not-found__background">
      <Lightning
        :hue="230"
        :x-offset="0"
        :speed="1"
        :intensity="1"
        :size="1"
        class="w-full h-full"
      />
    </div>

    <div class="not-found__content">
      <FuzzyText
        :font-size="140"
        :font-weight="900"
        color="#fff"
        :enable-hover="true"
        :base-intensity="0.18"
        :hover-intensity="0.5"
      >
        404
      </FuzzyText>

      <p class="not-found__message">
        {{ $t('notFound.message') || 'The page you are looking for does not exist.' }}
      </p>

      <router-link to="/" class="not-found__btn">
        <span>{{ $t('notFound.returnHome') || 'Return to Home' }}</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue'
import FuzzyText from '../components/common/FuzzyText.vue'
import Lightning from '../components/common/Lightning.vue'

// Ensure proper cleanup of WebGL context on unmount
onUnmounted(() => {
  // Lightning component handles its own cleanup
  // This is here for future-proofing and clarity
})
</script>

<style scoped>
.not-found-page {
  position: relative;
  min-height: calc(100vh - var(--header-height));
  min-height: calc(100dvh - var(--header-height));
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #000;
}

.not-found__background {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.not-found__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
}

.not-found__message {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  max-width: 500px;
}

.not-found__btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 14px 28px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-decoration: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.not-found__btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 255, 255, 0.1);
}

.not-found__btn svg {
  transition: transform 0.2s ease;
}

.not-found__btn:hover svg {
  transform: translateX(4px);
}

.w-full {
  width: 100%;
}

.h-full {
  height: 100%;
}
</style>
