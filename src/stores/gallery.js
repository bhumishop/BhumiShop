import { defineStore } from 'pinia';

/**
 * Pinia store for CircularGallery state management.
 * Manages gallery items, scroll state, and configuration.
 * High-frequency scroll values are kept minimal to avoid reactivity overhead.
 */
export const useGalleryStore = defineStore('gallery', {
  state: () => ({
    /** Gallery items (images only, no text) */
    items: [],

    /** Whether the gallery is currently visible in viewport */
    isVisible: true,

    /** Scroll target position */
    scrollTarget: 0,

    /** Configuration */
    config: {
      bend: 3,
      borderRadius: 0.05,
      scrollSpeed: 2,
      scrollEase: 0.05,
      momentumFactor: 1.2,
    },

    /** Precomputed bend constants (updated on resize/config change) */
    bendPrecomputed: {
      radius: 0,
      absBend: 0,
    },

    /** Viewport dimensions (cached) */
    viewport: {
      width: 0,
      height: 0
    },

    /** Screen dimensions (cached) */
    screen: {
      width: 0,
      height: 0
    }
  }),

  getters: {
    /** Doubled items array for infinite scroll */
    infiniteItems: (state) => {
      if (state.items.length === 0) return [];
      return [...state.items, ...state.items];
    },

    /** Whether bend is active */
    hasBend: (state) => state.config.bend !== 0,
  },

  actions: {
    /**
     * Set gallery items
     */
    setItems(newItems) {
      this.items = newItems || [];
    },

    /**
     * Update configuration and recompute bend constants
     */
    setConfig(config) {
      this.config = { ...this.config, ...config };
      this._precomputeBend();
    },

    /**
     * Precompute bend constants to avoid per-frame sqrt calculations.
     * R = (H^2 + B^2) / (2*B) where H = viewport half-width, B = bend value.
     */
    _precomputeBend() {
      const B_abs = Math.abs(this.config.bend);
      if (B_abs === 0) {
        this.bendPrecomputed = { radius: 0, absBend: 0 };
        return;
      }

      const H = this.viewport.width / 2;
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);

      this.bendPrecomputed = {
        radius: R,
        absBend: B_abs
      };
    },

    /**
     * Update viewport dimensions (called on resize)
     */
    setViewport(dimensions) {
      this.viewport = dimensions;
      this._precomputeBend();
    },

    /**
     * Update screen dimensions (called on resize)
     */
    setScreen(dimensions) {
      this.screen = dimensions;
    },

    /**
     * Update scroll target
     */
    setScrollTarget(target) {
      this.scrollTarget = target;
    },

    /**
     * Apply momentum to scroll target for smoother deceleration
     */
    setScrollTargetWithMomentum(target, velocity) {
      const momentum = velocity * this.config.momentumFactor;
      this.scrollTarget = target + momentum;
    },

    /**
     * Set visibility state (from IntersectionObserver)
     */
    setVisibility(visible) {
      this.isVisible = visible;
    },

    /**
     * Reset scroll to initial state
     */
    resetScroll() {
      this.scrollTarget = 0;
    }
  }
});
