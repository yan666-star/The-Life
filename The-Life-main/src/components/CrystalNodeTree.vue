<template>
  <div class="crystal-node-tree" aria-hidden="true">
    <div class="crystal-breathe">
      <svg class="crystal-svg" viewBox="0 0 420 820" preserveAspectRatio="xMaxYMid meet">
        <defs>
          <linearGradient id="cry-prism" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.95" />
            <stop offset="40%" stop-color="#bae6fd" stop-opacity="0.9" />
            <stop offset="72%" stop-color="#c4b5fd" stop-opacity="0.88" />
            <stop offset="100%" stop-color="#a78bfa" stop-opacity="0.95" />
          </linearGradient>
          <linearGradient id="cry-shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="rgba(255,255,255,0)" />
            <stop offset="45%" stop-color="rgba(255,255,255,0.55)" />
            <stop offset="55%" stop-color="rgba(255,255,255,0.45)" />
            <stop offset="100%" stop-color="rgba(255,255,255,0)" />
          </linearGradient>
          <filter id="cry-soft-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g class="crystal-facets">
          <path
            class="facet"
            d="M 298 760 L 272 520 L 288 360 L 302 760 Z"
            fill="url(#cry-prism)"
            opacity="0.22"
          />
          <path
            class="facet facet-alt"
            d="M 302 760 L 318 540 L 292 340 L 278 760 Z"
            fill="url(#cry-prism)"
            opacity="0.18"
          />
          <path
            class="facet"
            d="M 285 420 L 220 300 L 260 280 L 292 400 Z"
            fill="url(#cry-prism)"
            opacity="0.2"
          />
          <path
            class="facet facet-alt"
            d="M 295 400 L 340 260 L 300 250 L 275 390 Z"
            fill="url(#cry-prism)"
            opacity="0.18"
          />
        </g>

        <path
          class="energy-path path-trunk"
          d="M 292 780 C 286 640 288 520 290 420"
          pathLength="100"
        />
        <path
          class="energy-path path-b1"
          d="M 290 560 C 240 520 180 480 118 398"
          pathLength="100"
        />
        <path
          class="energy-path path-b2"
          d="M 292 500 C 320 460 360 420 352 312"
          pathLength="100"
        />
        <path
          class="energy-path path-b3"
          d="M 288 620 C 220 580 150 540 92 468"
          pathLength="100"
        />
        <path
          class="energy-path path-b4"
          d="M 294 440 C 340 400 380 360 378 268"
          pathLength="100"
        />
        <path
          class="energy-path path-b5"
          d="M 290 680 C 250 640 210 600 168 528"
          pathLength="100"
        />

        <rect class="shimmer-sweep" x="0" y="0" width="120" height="820" fill="url(#cry-shimmer)" opacity="0.35" />

        <g v-for="(n, i) in nodes" :key="n.label" class="float-node" :style="floatDelay(i)">
          <rect
            :x="n.x - n.w / 2"
            :y="n.y - 14"
            :width="n.w"
            height="28"
            rx="14"
            class="node-glass"
          />
          <text :x="n.x" :y="n.y + 5" text-anchor="middle" class="node-label">{{ n.label }}</text>
        </g>
      </svg>

      <div class="dust">
        <span v-for="i in 18" :key="i" class="dust-bit" :style="dustStyle(i)" />
      </div>
    </div>
  </div>
</template>

<script setup>
const nodes = [
  { label: '继续学业', x: 118, y: 398, w: 88 },
  { label: '考公', x: 352, y: 312, w: 56 },
  { label: '创业', x: 92, y: 468, w: 56 },
  { label: '跳槽', x: 378, y: 268, w: 56 },
  { label: '深耕', x: 168, y: 528, w: 56 }
]

const floatDelay = (i) => ({
  animationDelay: `${i * 0.35}s`
})

const dustStyle = (i) => ({
  left: `${8 + (i * 47) % 84}%`,
  top: `${10 + (i * 23) % 80}%`,
  animationDelay: `${(i % 7) * 0.4}s`,
  animationDuration: `${8 + (i % 5)}s`
})
</script>

<style scoped>
.crystal-node-tree {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.crystal-breathe {
  position: absolute;
  right: -6%;
  bottom: -4%;
  width: min(52vw, 560px);
  height: 92%;
  animation: crystal-breathe 14s ease-in-out infinite;
}

@keyframes crystal-breathe {
  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.92;
  }
  50% {
    transform: translateY(-10px) scale(1.02);
    opacity: 1;
  }
}

.crystal-svg {
  width: 100%;
  height: 100%;
  display: block;
  filter: drop-shadow(0 0 24px rgba(56, 189, 248, 0.35));
}

.facet {
  animation: facet-shimmer 6s ease-in-out infinite;
}

.facet-alt {
  animation-duration: 7.5s;
  animation-direction: alternate-reverse;
}

@keyframes facet-shimmer {
  0%,
  100% {
    opacity: 0.16;
  }
  50% {
    opacity: 0.28;
  }
}

.energy-path {
  fill: none;
  stroke: url(#cry-prism);
  stroke-width: 2.4;
  stroke-linecap: round;
  filter: url(#cry-soft-glow);
  opacity: 0.85;
  stroke-dasharray: 14 18;
  animation: path-flow 5s linear infinite;
}

.path-trunk {
  stroke-width: 3.2;
  animation-duration: 4.2s;
}

.path-b2,
.path-b4 {
  animation-duration: 5.8s;
}

.path-b1,
.path-b3,
.path-b5 {
  animation-duration: 6.4s;
}

@keyframes path-flow {
  to {
    stroke-dashoffset: -220;
  }
}

.shimmer-sweep {
  mix-blend-mode: overlay;
  animation: sweep-x 9s ease-in-out infinite;
}

@keyframes sweep-x {
  0% {
    transform: translateX(-30%);
    opacity: 0.2;
  }
  40% {
    opacity: 0.45;
  }
  100% {
    transform: translateX(120%);
    opacity: 0.15;
  }
}

.node-glass {
  fill: rgba(255, 255, 255, 0.42);
  stroke: rgba(255, 255, 255, 0.65);
  stroke-width: 1.2;
  backdrop-filter: blur(8px);
  filter: drop-shadow(0 4px 14px rgba(56, 189, 248, 0.25));
}

.node-label {
  fill: #0f2744;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  paint-order: stroke fill;
  stroke: rgba(255, 255, 255, 0.55);
  stroke-width: 3px;
}

.float-node {
  animation: node-float 5s ease-in-out infinite;
}

@keyframes node-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

.dust {
  position: absolute;
  inset: 0;
}

.dust-bit {
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.95), rgba(56, 189, 248, 0.35));
  box-shadow: 0 0 8px rgba(125, 211, 252, 0.75);
  opacity: 0;
  animation-name: dust-rise;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

@keyframes dust-rise {
  0% {
    transform: translateY(12px) scale(0.6);
    opacity: 0;
  }
  20% {
    opacity: 0.85;
  }
  100% {
    transform: translateY(-80px) scale(1);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .crystal-breathe,
  .facet,
  .energy-path,
  .shimmer-sweep,
  .float-node,
  .dust-bit {
    animation: none !important;
  }
}
</style>
