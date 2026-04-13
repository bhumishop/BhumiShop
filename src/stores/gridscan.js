import { defineStore } from 'pinia';

/**
 * Pinia store for GridScan state management.
 * Provides centralized sensitivity control without redundant calculations.
 * High-frequency uniform updates are handled internally by the component.
 */
export const useGridScanStore = defineStore('gridscan', {
  state: () => ({
    /** Sensitivity setting (0-1, controls responsiveness) */
    sensitivity: 0.55,
  }),

  actions: {
    /**
     * Set sensitivity (0-1)
     */
    setSensitivity(val) {
      this.sensitivity = Math.max(0, Math.min(1, val));
    },

    /**
     * Reset store to initial state
     */
    reset() {
      this.sensitivity = 0.55;
    }
  }
});
