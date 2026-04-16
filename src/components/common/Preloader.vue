<template>
  <div
    v-if="visible"
    class="preloader"
    :class="{ 'preloader-exit': exiting }"
    aria-label="Loading"
    role="status"
  >
    <!-- Glitch layers -->
    <div class="glitch-scanlines" aria-hidden="true"></div>
    <div class="glitch-noise" aria-hidden="true"></div>

    <div class="preloader-content">
      <!-- Logo with glitch effect -->
      <div class="logo-wrapper">
        <div class="logo-glitch logo-glitch-1" aria-hidden="true">
          <svg viewBox="0 0 100 100" class="logo-svg">
            <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" stroke="#8b5cf6" stroke-width="2" fill="none" />
            <path d="M35 50 L45 60 L65 40" stroke="#8b5cf6" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <div class="logo-glitch logo-glitch-2" aria-hidden="true">
          <svg viewBox="0 0 100 100" class="logo-svg">
            <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" stroke="#22c55e" stroke-width="2" fill="none" />
            <path d="M35 50 L45 60 L65 40" stroke="#22c55e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <div class="logo-main">
          <svg viewBox="0 0 100 100" class="logo-svg">
            <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" stroke="#fafafa" stroke-width="2.5" fill="none" class="logo-hex" />
            <path d="M35 50 L45 60 L65 40" stroke="#fafafa" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="logo-check" />
          </svg>
        </div>
      </div>

      <!-- Brand with glitch text -->
      <div class="brand-wrapper">
        <span class="brand-text" data-text="BhumiShop">BhumiShop</span>
      </div>

      <!-- Five dots loading -->
      <div class="loading-dots" aria-label="Loading">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const visible = ref(true)
const exiting = ref(false)
const MIN_ANIMATION_TIME = 2500

onMounted(() => {
  // Wait for minimum animation time
  const minTimer = setTimeout(() => {
    // Check if page is fully loaded
    if (document.readyState === 'complete') {
      hide()
    } else {
      window.addEventListener('load', hide, { once: true })
      // Fallback: hide after 2 more seconds
      setTimeout(hide, 2000)
    }
  }, MIN_ANIMATION_TIME)

  // Absolute fallback: hide after 5s no matter what
  setTimeout(hide, 5000)
})

function hide() {
  if (exiting.value) return
  exiting.value = true
  setTimeout(() => {
    visible.value = false
  }, 500)
}
</script>

<style scoped>
.preloader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  animation: preloader-in 0.3s ease both;
}

.preloader-exit {
  animation: preloader-out 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes preloader-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes preloader-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.02);
    filter: blur(0.125rem);
  }
  100% {
    opacity: 0;
    transform: scale(1.05);
    filter: blur(0.5rem);
  }
}

/* Scanlines overlay */
.glitch-scanlines {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 0.125rem,
    rgba(0, 0, 0, 0.15) 0.125rem,
    rgba(0, 0, 0, 0.15) 0.25rem
  );
  animation: scanlines-drift 0.1s linear infinite;
}

@keyframes scanlines-drift {
  0% { transform: translateY(0); }
  100% { transform: translateY(0.25rem); }
}

/* Noise overlay */
.glitch-noise {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
  background-size: clamp(10rem, 20vw, 12.5rem) clamp(10rem, 20vw, 12.5rem);
  animation: noise-shift 0.5s steps(5) infinite;
}

@keyframes noise-shift {
  0% { transform: translate(0, 0); }
  20% { transform: translate(-5%, -5%); }
  40% { transform: translate(5%, 5%); }
  60% { transform: translate(-2%, 3%); }
  80% { transform: translate(3%, -2%); }
  100% { transform: translate(0, 0); }
}

/* Content */
.preloader-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  animation: content-glitch-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes content-glitch-in {
  0% {
    opacity: 0;
    transform: scale(1.1) skewX(-5deg);
    filter: blur(0.625rem);
  }
  50% {
    opacity: 1;
    transform: scale(0.98) skewX(2deg);
    filter: blur(0.125rem);
  }
  100% {
    opacity: 1;
    transform: scale(1) skewX(0);
    filter: blur(0);
  }
}

/* Logo container */
.logo-wrapper {
  position: relative;
  width: clamp(5rem, 12vw, 6.25rem);
  height: clamp(5rem, 12vw, 6.25rem);
}

.logo-main,
.logo-glitch {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-svg {
  width: 100%;
  height: 100%;
}

/* Main logo draw animation */
.logo-hex {
  stroke-dasharray: 360;
  stroke-dashoffset: 360;
  animation: hex-draw 1s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
}

.logo-check {
  stroke-dasharray: 50;
  stroke-dashoffset: 50;
  animation: check-draw 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.8s both;
}

@keyframes hex-draw {
  to { stroke-dashoffset: 0; }
}

@keyframes check-draw {
  to { stroke-dashoffset: 0; }
}

/* Glitch layers */
.logo-glitch-1,
.logo-glitch-2 {
  opacity: 0;
  animation: glitch-layers 3s infinite;
}

.logo-glitch-1 {
  clip-path: inset(0 0 60% 0);
}

.logo-glitch-2 {
  clip-path: inset(60% 0 0 0);
}

@keyframes glitch-layers {
  0%, 90%, 100% {
    opacity: 0;
    transform: translate(0);
  }
  91% {
    opacity: 0.8;
    transform: translate(-0.1875rem, -0.125rem);
  }
  92% {
    opacity: 0;
  }
  93% {
    opacity: 0.8;
    transform: translate(0.1875rem, 0.125rem);
  }
  94%, 89% {
    opacity: 0;
  }
}

/* Brand text with glitch */
.brand-wrapper {
  position: relative;
  overflow: hidden;
  height: 2rem;
}

.brand-text {
  position: relative;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: #fafafa;
  display: block;
  animation: text-glitch 4s infinite;
}

.brand-text::before,
.brand-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
}

.brand-text::before {
  color: #8b5cf6;
  animation: glitch-text-purple 3s infinite;
}

.brand-text::after {
  color: #22c55e;
  animation: glitch-text-green 3s infinite;
}

@keyframes text-glitch {
  0%, 88%, 100% {
    transform: translate(0);
    text-shadow: none;
  }
  89% {
    transform: translate(-0.125rem, 0.0625rem);
    text-shadow: 0.125rem 0 #8b5cf6, -0.125rem 0 #22c55e;
  }
  90% {
    transform: translate(0.125rem, -0.0625rem);
    text-shadow: -0.125rem 0 #8b5cf6, 0.125rem 0 #22c55e;
  }
  91% {
    transform: translate(0);
    text-shadow: none;
  }
}

@keyframes glitch-text-purple {
  0%, 85%, 100% { opacity: 0; transform: translate(0); }
  86% { opacity: 0.7; transform: translate(-0.1875rem, -0.0625rem); }
  87% { opacity: 0; }
  88% { opacity: 0.7; transform: translate(0.125rem, 0.0625rem); }
  89%, 100% { opacity: 0; }
}

@keyframes glitch-text-green {
  0%, 87%, 100% { opacity: 0; transform: translate(0); }
  88% { opacity: 0.7; transform: translate(0.1875rem, 0.0625rem); }
  89% { opacity: 0; }
  90% { opacity: 0.7; transform: translate(-0.125rem, -0.0625rem); }
  91%, 100% { opacity: 0; }
}

/* Five dots loading animation */
.loading-dots {
  display: flex;
  gap: clamp(0.5rem, 1.5vw, 0.75rem);
  align-items: center;
}

.dot {
  width: clamp(0.5rem, 1vw, 0.625rem);
  height: clamp(0.5rem, 1vw, 0.625rem);
  border-radius: 50%;
  background: #8b5cf6;
  display: block;
  animation: dot-sequence 1.4s ease-in-out infinite;
}

.dot:nth-child(1) {
  animation-delay: 0s;
}

.dot:nth-child(2) {
  animation-delay: 0.1s;
  background: #9d6eff;
}

.dot:nth-child(3) {
  animation-delay: 0.2s;
  background: #22c55e;
}

.dot:nth-child(4) {
  animation-delay: 0.3s;
  background: #4ade80;
}

.dot:nth-child(5) {
  animation-delay: 0.4s;
  background: #8b5cf6;
}

@keyframes dot-sequence {
  0%, 100% {
    transform: scale(0.4) translateY(0);
    opacity: 0.3;
    filter: blur(0.125rem);
  }
  20% {
    transform: scale(1.2) translateY(-0.5rem);
    opacity: 1;
    filter: blur(0);
    box-shadow: 0 0 0.75rem currentColor, 0 0 1.5rem currentColor;
  }
  40% {
    transform: scale(0.8) translateY(0);
    opacity: 0.6;
    filter: blur(0.0625rem);
  }
  60% {
    transform: scale(0.4) translateY(0);
    opacity: 0.3;
    filter: blur(0.125rem);
  }
}

/* Horizontal glitch lines */
.preloader-content::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 0.125rem;
  background: linear-gradient(90deg, transparent, #8b5cf6, transparent);
  opacity: 0;
  animation: glitch-line 2.5s infinite;
  pointer-events: none;
}

@keyframes glitch-line {
  0%, 89%, 100% {
    opacity: 0;
    top: 50%;
  }
  90% {
    opacity: 0.6;
    top: 30%;
  }
  91% {
    opacity: 0;
  }
  92% {
    opacity: 0.6;
    top: 70%;
  }
  93%, 100% {
    opacity: 0;
  }
}

/* RGB split effect on content */
.preloader-content::after {
  content: '';
  position: absolute;
  inset: -1.25rem;
  background: transparent;
  opacity: 0;
  animation: rgb-split 3s infinite;
  pointer-events: none;
  box-shadow:
    -0.125rem 0 0 rgba(139, 92, 246, 0.3),
    0.125rem 0 0 rgba(34, 197, 94, 0.3);
}

@keyframes rgb-split {
  0%, 92%, 100% {
    opacity: 0;
    transform: translate(0);
  }
  93% {
    opacity: 1;
    transform: translate(-0.1875rem, 0);
  }
  94% {
    opacity: 0;
  }
  95% {
    opacity: 1;
    transform: translate(0.1875rem, 0);
  }
  96%, 100% {
    opacity: 0;
    transform: translate(0);
  }
}
</style>
