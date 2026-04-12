<template>
  <div class="stepper">
    <div
      v-for="(step, index) in steps"
      :key="index"
      :class="[
        'stepper__step',
        { 'stepper__step--active': index === current, 'stepper__step--done': index < current }
      ]"
    >
      <div class="stepper__circle">
        <svg v-if="index < current" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        <span v-else>{{ index + 1 }}</span>
      </div>
      <span class="stepper__label">{{ step }}</span>
      <div v-if="index < steps.length - 1" class="stepper__line" :class="{ 'stepper__line--done': index < current }"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  steps: { type: Array, required: true },
  current: { type: Number, default: 0 }
})
</script>

<style scoped>
.stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  padding: clamp(1rem, 2.5vh, 1.5rem) 0;
}

.stepper__step {
  display: flex;
  align-items: center;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
  position: relative;
}

.stepper__circle {
  width: clamp(2rem, 4.5vw, 2.25rem);
  height: clamp(2rem, 4.5vw, 2.25rem);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(0.7rem, 1.2vw, 0.8rem);
  font-weight: 600;
  border: 2px solid var(--border);
  color: var(--text-muted);
  background: var(--surface-0);
  transition: all var(--transition-base);
  flex-shrink: 0;
}

.stepper__step--active .stepper__circle {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
  box-shadow: var(--glow-accent);
}

.stepper__step--done .stepper__circle {
  border-color: var(--success);
  background: var(--success);
  color: white;
  box-shadow: 0 0 clamp(0.5rem, 1.5vw, 0.75rem) var(--success-light);
}

.stepper__label {
  font-size: clamp(0.7rem, 1.2vw, 0.8rem);
  font-weight: 500;
  color: var(--text-muted);
  white-space: nowrap;
}

.stepper__step--active .stepper__label {
  color: var(--accent);
  font-weight: 600;
}

.stepper__step--done .stepper__label {
  color: var(--success);
}

.stepper__line {
  width: clamp(1.5rem, 4vw, 2.5rem);
  height: 2px;
  background: var(--border);
  margin: 0 clamp(0.375rem, 0.75vw, 0.5rem);
  transition: background var(--transition-base);
  border-radius: var(--radius-full);
}

.stepper__line--done {
  background: var(--success);
}

@media (max-width: 640px) {
  .stepper__label {
    display: none;
  }

  .stepper__line {
    width: clamp(1rem, 3vw, 1.5rem);
  }
}
</style>
