# glitch.fx

A revised version of Powerglitch 2.3.2 has been rewritten in TypeScript and adapted for Nuxt3/4. Additionally, it can be turned off by clicking and has multiple random effects so that the effect doesn't always look the same.

## Import and Usage in Nuxt3/4

<script setup lang="ts">
import { PowerGlitch } from "@/utils/glitch.fx";
const logoRef = ref<HTMLImageElement | null>(null);
onMounted(() => {
  PowerGlitch.glitch(".logo_con", { playMode: "hover" });
});
</script>

<template>
  <div class="logo_con">
    <NuxtLink to="/">
      <img
        ref="logoRef"
        src="~/assets/YOURIMAGE.png"
      />
    </NuxtLink>
  </div>
</template>

<style scoped lang="scss">
a.router-link-active {
  pointer-events: none;
  opacity: 1;
  scale: (0.9);
}

img {
  height: 37px;
  width: auto;
  object-fit: contain;
}

.logo_con {
  position: relative;
  overflow: hidden;
}
</style>

## PowerGlitch

PowerGlitch is a TypeScript library that provides a customizable glitch effect for HTML elements.

### Installation

[Add installation instructions here, e.g., via npm or yarn]

### Usage

Import PowerGlitch into your file:

import { PowerGlitch } from './path/to/glitch.fx';

Apply the glitch effect to an element:

PowerGlitch.glitch('.my-element', options);

### Modes

PowerGlitch supports three different modes:

1. always: The glitch effect is applied continuously.
2. hover: The glitch effect is activated when the user hovers over the element.
3. click: The glitch effect is activated when the user clicks on the element.

Example:

PowerGlitch.glitch('.my-element', { playMode: 'hover' });

### Options

You can customize various options, including:

- createContainers: Creates container elements for the effect (default: true)
- hideOverflow: Hides overflow (default: false)
- timing: Duration and iterations of the effect
- glitchTimeSpan: Start and end time of the glitch effect
- shake: Speed and amplitude of the shake effect
- slice: Number, speed, height, and color rotation of the slice effects
- pulse: Scaling for the pulse effect

### Turning Off the Effect on Click

To turn off the effect after a click, add the CSS class router-link-active or router-link-exact-active to the link element within the glitch element. Additionally, set pointer-events: none; on the element.

Example:

<div class="glitch-element">
  <a class="router-link-active" href="#">Link Text</a>
</div>

.glitch-element a.router-link-active {
  pointer-events: none;
}

With these classes and CSS properties, the glitch effect will automatically deactivate when the link is active.

### Renewing the Effect

The glitch effect is regenerated on each hover event, providing more variation to the effect.

### Example

PowerGlitch.glitch('.logo', {
  playMode: 'hover',
  createContainers: true,
  hideOverflow: true,
  timing: { duration: 250, iterations: 1 },
  glitchTimeSpan: { start: 0, end: 1 },
  shake: { velocity: 15, amplitudeX: 0.2, amplitudeY: 0.2 },
  slice: {
    count: 6,
    velocity: 15,
    minHeight: 0.02,
    maxHeight: 0.15,
    hueRotate: true,
  },
});

This example applies a hover-activated glitch effect to all elements with the class logo.
