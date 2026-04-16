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
  gap: clamp(1.25rem, 4vw, 2rem);
  padding: clamp(1rem, 3vw, 2rem);
}

.not-found__message {
  font-size: clamp(1rem, 3vw, 1.25rem);
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  max-width: clamp(18.75rem, 80vw, 31.25rem);
}

.not-found__btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.75rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: clamp(0.875rem, 2vw, 1rem);
  font-weight: 600;
  border-radius: clamp(1.25rem, 3vw, 1.875rem);
  border: 0.0625rem solid rgba(255, 255, 255, 0.2);
  text-decoration: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(0.625rem);
}

.not-found__btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-0.125rem);
  box-shadow: 0 0.5rem 1.5rem rgba(255, 255, 255, 0.1);
}

.not-found__btn svg {
  transition: transform 0.2s ease;
}

.not-found__btn:hover svg {
  transform: translateX(0.25rem);
}

.w-full {
  width: 100%;
}

.h-full {
  height: 100%;
}
</style>
