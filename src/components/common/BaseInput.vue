<template>
  <div class="input-group" :class="{ 'input-group--error': error }">
    <label v-if="label" :for="inputId" class="input-group__label">{{ label }}</label>
    <div class="input-group__wrapper">
      <input
        :id="inputId"
        ref="inputRef"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :maxlength="maxlength"
        :class="['input-field', { 'input-field--error': error }]"
        @input="onInput"
        @blur="$emit('blur', $event)"
      />
    </div>
    <p v-if="error" class="input-group__error">{{ error }}</p>
    <p v-if="hint && !error" class="input-group__hint">{{ hint }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: String,
  placeholder: String,
  type: { type: String, default: 'text' },
  disabled: Boolean,
  required: Boolean,
  error: String,
  hint: String,
  maxlength: [String, Number]
})

const emit = defineEmits(['update:modelValue', 'blur'])
const inputRef = ref(null)
const inputId = computed(() => `input-${Math.random().toString(36).substring(2, 9)}`)

function onInput(event) {
  emit('update:modelValue', event.target.value)
}

function focus() {
  inputRef.value?.focus()
}

defineExpose({ focus })
</script>

<style scoped>
.input-group {
  display: flex;
  flex-direction: column;
  gap: clamp(0.25rem, 0.5vh, 0.375rem);
}

.input-group__label {
  font-size: clamp(0.7rem, 1.1vw, 0.8rem);
  font-weight: 500;
  color: var(--text-primary);
  transition: color var(--transition-smooth);
}

.input-field {
  width: 100%;
  padding: clamp(0.5rem, 1vw, 0.625rem) clamp(0.75rem, 1.5vw, 0.875rem);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: clamp(0.8rem, 1.3vw, 0.875rem);
  color: var(--text-primary);
  background: var(--surface-0);
  transition: all var(--transition-fast);
  outline: none;
}

.input-field::placeholder {
  color: var(--text-muted);
}

.input-field:hover:not(:disabled):not(:focus) {
  border-color: var(--surface-3);
}

.input-field:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 clamp(0.125rem, 0.4vw, 0.25rem) var(--accent-light);
}

.input-field:disabled {
  background: var(--surface-2);
  color: var(--text-muted);
  cursor: not-allowed;
}

.input-field--error {
  border-color: var(--danger);
}

.input-field--error:focus {
  box-shadow: 0 0 0 clamp(0.125rem, 0.4vw, 0.25rem) var(--danger-light);
}

.input-group__error {
  font-size: clamp(0.65rem, 1vw, 0.75rem);
  color: var(--danger);
}

.input-group__hint {
  font-size: clamp(0.65rem, 1vw, 0.75rem);
  color: var(--text-muted);
}
</style>
