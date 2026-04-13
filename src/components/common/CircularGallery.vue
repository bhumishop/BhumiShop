<template>
  <div ref="containerRef" class="circular-gallery-container relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing">
    <!-- Fallback for non-WebGL -->
    <div v-if="!webglSupported" class="w-full h-full overflow-y-auto p-4 md:p-8">
      <div class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 md:gap-6">
        <div v-for="(item, index) in displayItems" :key="index" class="rounded-lg overflow-hidden bg-gray-500/10 transition-transform hover:scale-[1.02]">
          <img :src="item.image" alt="" loading="lazy" class="w-full h-[150px] md:h-[200px] object-cover block" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch, useTemplateRef, ref, computed } from 'vue';
import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';
import { useGalleryStore } from '../../stores/gallery';

interface CircularGalleryProps {
  items?: { image: string; text?: string }[];
  bend?: number;
  borderRadius?: number;
  scrollSpeed?: number;
  scrollEase?: number;
}

const props = withDefaults(defineProps<CircularGalleryProps>(), {
  bend: 3,
  borderRadius: 0.05,
  scrollSpeed: 2,
  scrollEase: 0.05
});

const containerRef = useTemplateRef<HTMLDivElement>('containerRef');
const webglSupported = ref(true);
const galleryStore = useGalleryStore();
let app: App | null = null;
let hasInitialized = false;

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2')) ||
           !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
  } catch (e) {
    return false;
  }
}

const displayItems = computed(() => {
  const defaultItems = [
    { image: 'https://picsum.photos/seed/1/800/600?grayscale' },
    { image: 'https://picsum.photos/seed/2/800/600?grayscale' },
    { image: 'https://picsum.photos/seed/3/800/600?grayscale' },
    { image: 'https://picsum.photos/seed/4/800/600?grayscale' },
    { image: 'https://picsum.photos/seed/5/800/600?grayscale' },
    { image: 'https://picsum.photos/seed/16/800/600?grayscale' },
    { image: 'https://picsum.photos/seed/17/800/600?grayscale' },
    { image: 'https://picsum.photos/seed/8/800/600?grayscale' },
    { image: 'https://picsum.photos/seed/9/800/600?grayscale' },
    { image: 'https://picsum.photos/seed/10/800/600?grayscale' },
    { image: 'https://picsum.photos/seed/21/800/600?grayscale' },
    { image: 'https://picsum.photos/seed/12/800/600?grayscale' }
  ];
  return props.items && props.items.length
    ? props.items.map(item => ({ image: item.image }))
    : defaultItems;
});

type GL = Renderer['gl'];

function debounce<T extends (...args: unknown[]) => void>(func: T, wait: number) {
  let timeout: number;
  return function (this: unknown, ...args: Parameters<T>) {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Cubic ease-out using direct multiplication (faster than Math.pow)
 */
function easeOutCubic(t: number): number {
  const mt = 1 - t;
  return 1 - mt * mt * mt;
}

/**
 * Smooth scroll interpolation with velocity-aware easing.
 * Uses direct cubic multiplication instead of Math.pow for performance.
 */
function smoothLerp(current: number, target: number, baseEase: number, velocity: number = 0): number {
  const distance = Math.abs(target - current);
  const dynamicEase = Math.min(baseEase + (distance / 5000) * 0.05, 0.15);
  const t = dynamicEase * 10;
  const mt = 1 - t;
  const easedT = 1 - mt * mt * mt;
  return current + (target - current) * easedT;
}

function autoBind<T extends object>(instance: T): void {
  const proto = Object.getPrototypeOf(instance) as Record<string, unknown> | null;
  if (!proto) return;
  Object.getOwnPropertyNames(proto).forEach(key => {
    if (key !== 'constructor') {
      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (desc && typeof desc.value === 'function') {
        const fn = desc.value as (...args: unknown[]) => unknown;
        (instance as Record<string, unknown>)[key] = fn.bind(instance);
      }
    }
  });
}

interface ScreenSize {
  width: number;
  height: number;
}

interface Viewport {
  width: number;
  height: number;
}

interface MediaProps {
  geometry: Plane;
  gl: GL;
  image: string;
  index: number;
  length: number;
  renderer: Renderer;
  scene: Transform;
  screen: ScreenSize;
  viewport: Viewport;
  bend: number;
  borderRadius?: number;
}

class Media {
  extra: number = 0;
  geometry: Plane;
  gl: GL;
  image: string;
  index: number;
  length: number;
  renderer: Renderer;
  scene: Transform;
  screen: ScreenSize;
  viewport: Viewport;
  bend: number;
  borderRadius: number;
  program!: Program;
  plane!: Mesh;
  scale!: number;
  padding!: number;
  width!: number;
  widthTotal!: number;
  x!: number;
  speed: number = 0;
  isBefore: boolean = false;
  isAfter: boolean = false;

  // Precomputed bend values (per Media instance, updated on resize)
  bendR: number = 0;
  bendSign: number = 0;

  constructor({
    geometry,
    gl,
    image,
    index,
    length,
    renderer,
    scene,
    screen,
    viewport,
    bend,
    borderRadius = 0
  }: MediaProps) {
    this.geometry = geometry;
    this.gl = gl;
    this.image = image;
    this.index = index;
    this.length = length;
    this.renderer = renderer;
    this.scene = scene;
    this.screen = screen;
    this.viewport = viewport;
    this.bend = bend;
    this.borderRadius = borderRadius;
    this.createShader();
    this.createMesh();
    this.onResize();
  }

  createShader() {
    const texture = new Texture(this.gl, { generateMipmaps: false });
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          // Lightweight breathing effect - only sin, no cos
          p.z = sin(p.x * 3.14159 + uSpeed * 2.0) * 0.05 * min(uSpeed * 2.0, 1.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;

        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }

        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 color = texture2D(tMap, uv);

          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          if(d > 0.0) {
            discard;
          }

          gl_FragColor = vec4(color.rgb, 1.0);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uSpeed: { value: 0 },
        uBorderRadius: { value: this.borderRadius }
      },
      transparent: true
    });
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = this.image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
    };
  }

  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program
    });
    this.plane.setParent(this.scene);
  }

  update(scroll: { current: number; last: number; velocity: number }, direction: 'right' | 'left', bendPrecomputed: { radius: number; absBend: number }) {
    this.plane.position.x = this.x - scroll.current - this.extra;

    const x = this.plane.position.x;
    const H = this.viewport.width / 2;

    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const R = bendPrecomputed.radius;
      const effectiveX = Math.min(Math.abs(x), H);
      const R2_minus_x2 = R * R - effectiveX * effectiveX;

      // Guard against floating point errors
      const sqrtVal = R2_minus_x2 > 0 ? Math.sqrt(R2_minus_x2) : 0;
      const arc = R - sqrtVal;

      // Single velocity damp computation, reused for both y and rotation
      const velocityDamp = 1 - Math.min(Math.abs(scroll.velocity) * 0.02, 0.15);

      if (this.bend > 0) {
        this.plane.position.y = -arc * velocityDamp;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R) * velocityDamp;
      } else {
        this.plane.position.y = arc * velocityDamp;
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R) * velocityDamp;
      }
    }

    // Smooth speed calculation with velocity averaging
    const rawSpeed = scroll.current - scroll.last;
    this.speed = rawSpeed * 0.7 + this.speed * 0.3;
    this.program.uniforms.uSpeed.value = Math.min(Math.abs(this.speed) * 0.5, 1.0);

    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
    if (direction === 'right' && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === 'left' && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
  }

  onResize({ screen, viewport }: { screen?: ScreenSize; viewport?: Viewport } = {}) {
    if (screen) this.screen = screen;
    if (viewport) {
      this.viewport = viewport;
    }
    if (!this.screen || !this.screen.height) return;
    this.scale = this.screen.height / 1500;
    this.plane.scale.y = (this.viewport.height * (900 * this.scale)) / this.screen.height;
    this.plane.scale.x = (this.viewport.width * (700 * this.scale)) / this.screen.width;

    if (this.program && this.program.uniforms && this.program.uniforms.uPlaneSizes) {
      this.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    }

    this.padding = 2;
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
}

interface AppConfig {
  items?: { image: string; text?: string }[];
  bend?: number;
  borderRadius?: number;
  scrollSpeed?: number;
  scrollEase?: number;
}

class App {
  container: HTMLElement;
  scrollSpeed: number;
  scroll: {
    ease: number;
    current: number;
    target: number;
    last: number;
    position?: number;
    velocity: number;
  };
  onCheckDebounce: (...args: unknown[]) => void;
  renderer!: Renderer;
  gl!: GL;
  camera!: Camera;
  scene!: Transform;
  planeGeometry!: Plane;
  medias: Media[] = [];
  mediasImages: { image: string }[] = [];
  screen!: { width: number; height: number };
  viewport!: { width: number; height: number };
  raf: number = 0;

  // Precomputed bend values (updated when bend or viewport changes)
  bendPrecomputed: { radius: number; absBend: number } = { radius: 0, absBend: 0 };

  boundOnResize!: () => void;
  boundOnTouchDown!: (e: MouseEvent | TouchEvent) => void;
  boundOnTouchMove!: (e: MouseEvent | TouchEvent) => void;
  boundOnTouchUp!: () => void;

  isDown: boolean = false;
  start: number = 0;

  // IntersectionObserver for visibility-based rendering
  observer: IntersectionObserver | null = null;
  isVisible: boolean = true;

  constructor(
    container: HTMLElement,
    {
      items,
      bend = 1,
      borderRadius = 0,
      scrollSpeed = 2,
      scrollEase = 0.05
    }: AppConfig
  ) {
    document.documentElement.classList.remove('no-js');
    this.container = container;
    this.scrollSpeed = scrollSpeed;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0, velocity: 0 };
    this.onCheckDebounce = debounce(this.onCheck.bind(this), 200);

    // Sync to Pinia store
    galleryStore.setConfig({ bend, borderRadius, scrollSpeed, scrollEase });
    galleryStore.setItems((items || []).map(item => ({ image: item.image })));

    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.createGeometry();
    this.createMedias(items, bend, borderRadius);
    // Now that medias exist and canvas is in DOM, do final resize with correct dimensions
    this.onResize();
    this._computeBendPrecomputed();
    this.setupIntersectionObserver();
    this.update();
    this.addEventListeners();
  }

  createRenderer() {
    this.renderer = new Renderer({ alpha: true, antialias: false });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    const canvas = this.renderer.gl.canvas as HTMLCanvasElement;
    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 400;
    this.renderer.setSize(width, height);
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '1';
    canvas.style.pointerEvents = 'auto';
    canvas.style.touchAction = 'none';
    this.container.appendChild(canvas);
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }

  createScene() {
    this.scene = new Transform();
  }

  createGeometry() {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 50,
      widthSegments: 100
    });
  }

  createMedias(
    items: { image: string; text?: string }[] | undefined,
    bend: number = 1,
    borderRadius: number
  ) {
    const defaultItems = [
      { image: `https://picsum.photos/seed/1/800/600?grayscale` },
      { image: `https://picsum.photos/seed/2/800/600?grayscale` },
      { image: `https://picsum.photos/seed/3/800/600?grayscale` },
      { image: `https://picsum.photos/seed/4/800/600?grayscale` },
      { image: `https://picsum.photos/seed/5/800/600?grayscale` },
      { image: `https://picsum.photos/seed/16/800/600?grayscale` },
      { image: `https://picsum.photos/seed/17/800/600?grayscale` },
      { image: `https://picsum.photos/seed/8/800/600?grayscale` },
      { image: `https://picsum.photos/seed/9/800/600?grayscale` },
      { image: `https://picsum.photos/seed/10/800/600?grayscale` },
      { image: `https://picsum.photos/seed/21/800/600?grayscale` },
      { image: `https://picsum.photos/seed/12/800/600?grayscale` }
    ];
    const galleryItems = items && items.length ? items : defaultItems;
    this.mediasImages = galleryItems.concat(galleryItems);
    this.medias = this.mediasImages.map((data, index) => {
      return new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        image: data.image,
        index,
        length: this.mediasImages.length,
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        viewport: this.viewport,
        bend,
        borderRadius
      });
    });

    // Store item count in Pinia
    galleryStore.setItems(galleryItems.map(item => ({ image: item.image })));
  }

  setupIntersectionObserver() {
    // Start visible - observer will update if it goes out of view
    this.isVisible = true;
    this.observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          this.isVisible = entry.isIntersecting;
          galleryStore.setVisibility(entry.isIntersecting);
        }
      },
      { threshold: 0.01, rootMargin: '50px' }
    );
    this.observer.observe(this.container);
  }

  onTouchDown(e: MouseEvent | TouchEvent) {
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    // Prevent page scroll while dragging gallery
    if ('touches' in e) {
      (e as TouchEvent).preventDefault();
    }
    this.start = 'touches' in e ? e.touches[0].clientX : e.clientX;
  }

  onTouchMove(e: MouseEvent | TouchEvent) {
    if (!this.isDown) return;
    // Prevent page scroll while dragging
    if ('touches' in e) {
      (e as TouchEvent).preventDefault();
    }
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const distance = (this.start - x) * (this.scrollSpeed * 0.025);
    this.scroll.target = (this.scroll.position ?? 0) + distance;

    // Calculate velocity for momentum tracking
    const velocity = (this.scroll.target - this.scroll.current) * 0.1;
    galleryStore.setScrollTargetWithMomentum(this.scroll.target, velocity);
  }

  onTouchUp() {
    if (!this.isDown) return;
    this.isDown = false;

    // Add momentum-based inertia on release
    const currentVelocity = this.scroll.velocity;
    const momentumOffset = currentVelocity * this.scrollSpeed * 0.8;
    this.scroll.target += momentumOffset;
    galleryStore.setScrollTarget(this.scroll.target);

    this.onCheck();
  }

  onCheck() {
    if (!this.medias || !this.medias[0]) return;
    const width = this.medias[0].width;
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
    const item = width * itemIndex;
    this.scroll.target = this.scroll.target < 0 ? -item : item;
    galleryStore.setScrollTarget(this.scroll.target);
  }

  onResize() {
    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 400;
    this.screen = { width, height };
    this.renderer.setSize(width, height);
    this.camera.perspective({
      aspect: width / height
    });
    const fov = (this.camera.fov * Math.PI) / 180;
    const viewHeight = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const viewWidth = viewHeight * this.camera.aspect;
    this.viewport = { width: viewWidth, height: viewHeight };

    // Update Pinia
    galleryStore.setScreen(this.screen);
    galleryStore.setViewport(this.viewport);

    // Recompute bend constants
    this._computeBendPrecomputed();

    if (this.medias && this.medias.length > 0) {
      this.medias.forEach(media => media.onResize({ screen: this.screen, viewport: this.viewport }));
    }
  }

  _computeBendPrecomputed() {
    const bendVal = this.medias && this.medias[0] ? this.medias[0].bend : 0;
    const B = Math.abs(bendVal);
    const H = this.viewport.width / 2;
    if (B === 0) {
      this.bendPrecomputed = { radius: 0, absBend: 0 };
    } else {
      this.bendPrecomputed = {
        radius: (H * H + B * B) / (2 * B),
        absBend: B
      };
    }
  }

  update() {
    // Skip rendering if not visible (IntersectionObserver)
    if (!this.isVisible) {
      this.raf = window.requestAnimationFrame(this.update.bind(this));
      return;
    }

    // Use smooth lerp with velocity-aware easing for smoother scrolling
    this.scroll.current = smoothLerp(this.scroll.current, this.scroll.target, this.scroll.ease, this.scroll.velocity);

    // Calculate velocity with improved dampening for smoother deceleration
    const rawVelocity = this.scroll.current - this.scroll.last;
    this.scroll.velocity = rawVelocity * 0.75 + this.scroll.velocity * 0.25;

    const direction = this.scroll.current > this.scroll.last ? 'right' : 'left';

    if (this.medias && this.medias.length > 0) {
      this.medias.forEach(media => media.update(this.scroll, direction, this.bendPrecomputed));
    }
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;

    this.raf = window.requestAnimationFrame(this.update.bind(this));
  }

  addEventListeners() {
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnTouchDown = this.onTouchDown.bind(this);
    this.boundOnTouchMove = this.onTouchMove.bind(this);
    this.boundOnTouchUp = this.onTouchUp.bind(this);

    window.addEventListener('resize', this.boundOnResize);

    // Touch/mouse drag only - no wheel scroll to prevent page scroll conflict
    this.container.addEventListener('mousedown', this.boundOnTouchDown);
    this.container.addEventListener('touchstart', this.boundOnTouchDown, { passive: false });

    window.addEventListener('mousemove', this.boundOnTouchMove, { passive: false });
    window.addEventListener('mouseup', this.boundOnTouchUp);
    window.addEventListener('touchmove', this.boundOnTouchMove, { passive: false });
    window.addEventListener('touchend', this.boundOnTouchUp);
  }

  destroy() {
    window.cancelAnimationFrame(this.raf);

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    window.removeEventListener('resize', this.boundOnResize);
    window.removeEventListener('mousemove', this.boundOnTouchMove);
    window.removeEventListener('mouseup', this.boundOnTouchUp);
    window.removeEventListener('touchmove', this.boundOnTouchMove);
    window.removeEventListener('touchend', this.boundOnTouchUp);

    this.container.removeEventListener('mousedown', this.boundOnTouchDown);
    this.container.removeEventListener('touchstart', this.boundOnTouchDown);

    // Dispose media textures first
    if (this.medias) {
      this.medias.forEach(media => {
        if (media.img && media.img.texture) {
          media.img.texture.dispose()
        }
        if (media.img) {
          media.img.src = ''
        }
      })
      this.medias = [];
    }

    // Remove canvas and lose context
    if (this.renderer && this.renderer.gl) {
      const gl = this.renderer.gl
      // Dispose all geometries and programs if available
      try {
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      } catch {}
      const canvas = gl.canvas
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }

    // Clear renderer reference
    this.renderer = null
  }
}

onMounted(() => {
  hasInitialized = true;

  if (!containerRef.value) return;

  if (!isWebGLAvailable()) {
    webglSupported.value = false;
    return;
  }

  const initApp = () => {
    if (!containerRef.value || containerRef.value.clientWidth === 0 || containerRef.value.clientHeight === 0) {
      requestAnimationFrame(initApp);
      return;
    }

    app = new App(containerRef.value, {
      items: displayItems.value,
      bend: props.bend,
      borderRadius: props.borderRadius,
      scrollSpeed: props.scrollSpeed,
      scrollEase: props.scrollEase
    });
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(initApp);
  });
});

onUnmounted(() => {
  if (app) {
    app.destroy();
    app = null;
  }
});

// Watch items for rebuild when products load/change
watch(
  () => displayItems.value,
  (newItems, oldItems) => {
    // Skip the initial watch trigger (before app is created)
    if (!hasInitialized) return;
    if (!app || !newItems || newItems.length === 0) return;

    // Avoid rebuild if items haven't actually changed
    if (oldItems && JSON.stringify(newItems) === JSON.stringify(oldItems)) return;

    app.destroy();
    if (containerRef.value && isWebGLAvailable()) {
      app = new App(containerRef.value, {
        items: newItems,
        bend: props.bend,
        borderRadius: props.borderRadius,
        scrollSpeed: props.scrollSpeed,
        scrollEase: props.scrollEase
      });
    }
  },
  { deep: true }
);
</script>

<style scoped>
/* Circular gallery container */
.circular-gallery-container {
  touch-action: pan-y;
  -webkit-tap-highlight-color: transparent;
}

/* Ensure WebGL canvas doesn't block interactions outside container */
:deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  pointer-events: auto;
  touch-action: none;
}

/* Mobile adjustments for fallback grid */
@media (max-width: 768px) {
  :deep(.grid) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
    gap: 0.75rem !important;
  }

  :deep(img) {
    height: 120px !important;
  }
}

@media (max-width: 480px) {
  :deep(.grid) {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)) !important;
    gap: 0.5rem !important;
  }

  :deep(img) {
    height: 100px !important;
  }
}
</style>
