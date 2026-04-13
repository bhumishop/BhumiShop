<template>
  <div class="stepper" v-bind="$attrs">
    <!-- Step indicators -->
    <div class="stepper__indicators" :class="{ 'stepper__indicators--disabled': disableStepIndicators }">
      <template v-for="(_, index) in stepsArray" :key="index + 1">
        <button
          type="button"
          class="stepper__dot"
          :class="getStepStatusClass(index + 1)"
          :disabled="!canNavigateToStep(index + 1)"
          @click="handleStepClick(index + 1)"
          :aria-label="`Step ${index + 1}`"
        >
          <!-- Animate step number transitions -->
          <AnimatePresence mode="out-in">
            <Motion
              v-if="getStepStatus(index + 1) === 'complete'"
              as="svg"
              key="check"
              class="stepper__check"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              :initial="{ scale: 0.3, opacity: 0 }"
              :animate="{ scale: 1, opacity: 1 }"
              :exit="{ scale: 0.3, opacity: 0 }"
              :transition="{ type: 'spring', stiffness: 400, damping: 25 }"
            >
              <Motion
                as="path"
                d="M5 13l4 4L19 7"
                :initial="{ pathLength: 0 }"
                :animate="{ pathLength: 1 }"
                :transition="{ duration: 0.3, ease: 'easeOut', delay: 0.05 }"
              />
            </Motion>
            <Motion
              v-else-if="getStepStatus(index + 1) === 'active'"
              as="span"
              key="active"
              class="stepper__dot-inner"
              :initial="{ scale: 0, opacity: 0 }"
              :animate="{ scale: 1, opacity: 1 }"
              :exit="{ scale: 0, opacity: 0 }"
              :transition="{ type: 'spring', stiffness: 400, damping: 25 }"
            />
            <Motion
              v-else
              as="span"
              key="number"
              class="stepper__dot-number"
              :initial="{ y: -8, opacity: 0 }"
              :animate="{ y: 0, opacity: 1 }"
              :exit="{ y: 8, opacity: 0 }"
              :transition="{ type: 'spring', stiffness: 400, damping: 25 }"
            >
              {{ index + 1 }}
            </Motion>
          </AnimatePresence>
        </button>

        <!-- Connector line -->
        <Motion
          v-if="index < totalSteps - 1"
          as="div"
          :key="`conn-${index}`"
          class="stepper__connector"
          :initial="{ scaleX: 0.01, opacity: 0 }"
          :animate="{ scaleX: 1, opacity: 1 }"
          :transition="{ type: 'spring', stiffness: 300, damping: 25 }"
        >
          <Motion
            class="stepper__connector-fill"
            :initial="{ scaleX: 0 }"
            :animate="{ scaleX: getConnectorProgress(index) }"
            :transition="{ type: 'spring', stiffness: 200, damping: 20 }"
          />
        </Motion>
      </template>
    </div>

    <!-- Step content with animated height -->
    <div class="stepper__content" :style="{ height: contentHeight + 'px' }">
      <AnimatePresence mode="out-in" :initial="false">
        <Motion
          :key="currentStep"
          class="stepper__step"
          :initial="{ x: direction > 0 ? 50 : -50, opacity: 0 }"
          :animate="{ x: 0, opacity: 1 }"
          :exit="{ x: direction > 0 ? -50 : 50, opacity: 0 }"
          :transition="{ type: 'tween', duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }"
        >
          <div ref="stepContentRef">
            <template v-if="slots.default && elementSlots[currentStep - 1]">
              <component :is="elementSlots[currentStep - 1]" />
            </template>
          </div>
        </Motion>
      </AnimatePresence>
    </div>

    <!-- Navigation buttons -->
    <div class="stepper__footer">
      <button
        v-if="currentStep > 1"
        type="button"
        class="stepper__btn-back"
        :disabled="internalLoading"
        @click="handleBack"
      >
        {{ backButtonText }}
      </button>

      <button
        type="button"
        class="stepper__btn-next"
        :class="{
          'stepper__btn-next--loading': internalLoading
        }"
        :disabled="!canProceedComputed || internalLoading"
        @click="handleNext"
      >
        <span v-if="internalLoading" class="stepper__spinner"></span>
        <span v-else>{{ isLastStep ? completeButtonText : nextButtonText }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useSlots, watch, onMounted, nextTick, Fragment, type VNode } from 'vue'
import { Motion, AnimatePresence } from 'motion-v'

interface StepConfig {
  id: string
  label?: string
}

interface StepperProps {
  steps?: StepConfig[]
  initialStep?: number
  backButtonText?: string
  nextButtonText?: string
  completeButtonText?: string
  disableStepIndicators?: boolean
  onComplete?: () => void | Promise<void>
  onStepChange?: (step: number) => void
  loading?: boolean
}

const props = withDefaults(defineProps<StepperProps>(), {
  steps: () => [],
  initialStep: 1,
  backButtonText: 'Back',
  nextButtonText: 'Continue',
  completeButtonText: 'Complete',
  disableStepIndicators: false,
  onComplete: () => {},
  onStepChange: () => {},
  loading: false
})

const slots = useSlots()
const currentStep = ref(props.initialStep)
const direction = ref(0)
const completedSteps = ref<Set<number>>(new Set())
const validSteps = ref<Set<number>>(new Set())
const contentRef = ref<HTMLElement | null>(null)
const stepContentRef = ref<HTMLElement | null>(null)
const internalLoading = ref(false)
const contentHeight = ref(0)

// Measure and set content height
async function updateContentHeight() {
  await nextTick()
  // Wait for AnimatePresence exit animation to start
  await new Promise(r => setTimeout(r, 50))
  if (stepContentRef.value) {
    contentHeight.value = stepContentRef.value.scrollHeight
  }
}

// Recursively unwrap Fragments and collect only element VNodes (not text/comment)
function flattenVNodes(vnodes: VNode[]): VNode[] {
  const result: VNode[] = []
  for (const vnode of vnodes) {
    if (vnode.type === Fragment) {
      // Unwrap fragment children
      if (vnode.children && Array.isArray(vnode.children)) {
        result.push(...flattenVNodes(vnode.children as VNode[]))
      }
    } else if (typeof vnode.type === 'string') {
      // Actual HTML element (div, span, etc.) - keep it
      result.push(vnode)
    } else if (typeof vnode.type === 'object' || typeof vnode.type === 'function') {
      // Component vnode - keep it
      result.push(vnode)
    }
    // Skip comment and text vnodes
  }
  return result
}

const elementSlots = computed(() => {
  const defaultSlots = slots.default?.() || []
  return flattenVNodes(defaultSlots)
})

const stepsArray = computed(() => {
  if (props.steps.length > 0) return props.steps
  return elementSlots.value.map((_, i) => ({
    id: `step-${i + 1}`,
    label: ''
  }))
})

const totalSteps = computed(() => stepsArray.value.length)
const isLastStep = computed(() => currentStep.value === totalSteps.value)

// Sequential navigation
function canNavigateToStep(step: number): boolean {
  if (props.disableStepIndicators) return false
  if (step === 1) return true
  return completedSteps.value.has(step - 1) || completedSteps.value.has(step)
}

// Can proceed if current step is marked valid
const canProceedComputed = computed(() => {
  return validSteps.value.has(currentStep.value)
})

function getStepStatus(step: number): 'inactive' | 'active' | 'complete' {
  if (completedSteps.value.has(step)) return 'complete'
  if (currentStep.value === step) return 'active'
  return 'inactive'
}

function getStepStatusClass(step: number): string {
  return `stepper__dot--${getStepStatus(step)}`
}

function getConnectorProgress(index: number): number {
  const stepNumber = index + 1
  return completedSteps.value.has(stepNumber) ? 1 : 0
}

function markStepValid(step: number) {
  validSteps.value.add(step)
}

function markStepInvalid(step: number) {
  validSteps.value.delete(step)
}

function goToStep(step: number) {
  if (step < 1 || step > totalSteps.value) return
  if (!canNavigateToStep(step)) return

  direction.value = step > currentStep.value ? 1 : -1
  currentStep.value = step
  props.onStepChange(step)
}

function handleStepClick(step: number) {
  goToStep(step)
}

function handleBack() {
  if (currentStep.value > 1) {
    goToStep(currentStep.value - 1)
  }
}

async function handleNext() {
  if (!canProceedComputed.value) return

  if (isLastStep.value) {
    internalLoading.value = true
    try {
      await props.onComplete?.()
    } finally {
      internalLoading.value = false
    }
    return
  }

  completedSteps.value.add(currentStep.value)
  direction.value = 1
  currentStep.value++
  props.onStepChange(currentStep.value)
}

defineExpose({
  markStepValid,
  markStepInvalid,
  goToStep,
  currentStep,
  completedSteps,
  validSteps
})

watch(() => props.loading, (val) => {
  internalLoading.value = val
})

// Watch step changes and animate height
watch(currentStep, async () => {
  await updateContentHeight()
})

onMounted(async () => {
  validSteps.value.add(1)
  await updateContentHeight()
})
</script>

<style scoped>
.stepper {
  width: 100%;
}

/* Step indicators */
.stepper__indicators {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.75rem;
  min-height: 2rem;
}

.stepper__indicators--disabled .stepper__dot {
  pointer-events: none;
  cursor: default;
}

.stepper__dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;
  outline: none;
  flex-shrink: 0;
  font-family: inherit;
  overflow: hidden;
}

.stepper__dot:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.stepper__dot--inactive {
  background: var(--surface-2, #2a2a2a);
  color: var(--text-muted, #71717a);
}

.stepper__dot--inactive:not(:disabled):hover {
  background: var(--surface-1, #3f3f46);
}

.stepper__dot--active {
  background: var(--accent, #22c55e);
  color: var(--accent-foreground, #000);
  box-shadow: 0 0 14px var(--accent-light, rgba(34, 197, 94, 0.35));
}

.stepper__dot--complete {
  background: var(--accent, #22c55e);
  color: var(--accent-foreground, #000);
}

.stepper__dot-inner {
  display: block;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: currentColor;
}

.stepper__dot-number {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
}

.stepper__check {
  display: block;
  width: 1rem;
  height: 1rem;
}

/* Connector lines */
.stepper__connector {
  position: relative;
  width: 2rem;
  height: 2px;
  background: var(--border, #3f3f46);
  margin: 0 0.375rem;
  border-radius: 1px;
  overflow: hidden;
  flex-shrink: 0;
}

.stepper__connector-fill {
  position: absolute;
  inset: 0;
  background: var(--accent, #22c55e);
  transform-origin: left center;
}

/* Content area with animated height */
.stepper__content {
  overflow: hidden;
  transition: height 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.stepper__step {
  width: 100%;
}

/* Footer / buttons */
.stepper__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  min-height: 2.5rem;
}

.stepper__btn-back {
  padding: 0.6rem 1.2rem;
  background: transparent;
  color: var(--text-secondary, #a1a1aa);
  border: 1px solid var(--border, #3f3f46);
  border-radius: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.stepper__btn-back:hover:not(:disabled) {
  color: var(--text-primary, #fafafa);
  border-color: var(--text-secondary, #71717a);
}

.stepper__btn-back:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.stepper__btn-next {
  padding: 0.65rem 1.5rem;
  background: var(--accent, #22c55e);
  color: var(--accent-foreground, #000);
  border: none;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: inherit;
}

.stepper__btn-next:hover:not(:disabled) {
  background: var(--accent-hover, #16a34a);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--accent-light, rgba(34, 197, 94, 0.3));
}

.stepper__btn-next:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.stepper__btn-next--loading {
  pointer-events: none;
}

.stepper__spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 9999px;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 480px) {
  .stepper__connector {
    width: 1.25rem;
    margin: 0 0.25rem;
  }

  .stepper__dot {
    width: 1.75rem;
    height: 1.75rem;
  }
}
</style>
