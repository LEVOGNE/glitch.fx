interface GlitchOptions {
  playMode?: "always" | "hover" | "click";
  createContainers?: boolean;
  hideOverflow?: boolean;
  timing?: {
    duration: number;
    iterations: number;
  };
  glitchTimeSpan?: {
    start: number;
    end: number;
  };
  shake?: {
    velocity: number;
    amplitudeX: number;
    amplitudeY: number;
  };
  slice?: {
    count: number;
    velocity: number;
    minHeight: number;
    maxHeight: number;
    hueRotate: boolean;
  };
  pulse?:
    | {
        scale: number;
      }
    | false;
  html?: string;
}

const getDefaultOptions = (
  playMode: "always" | "hover" | "click" = "always"
): GlitchOptions => ({
  playMode,
  createContainers: true,
  hideOverflow: false,
  timing:
    playMode === "always"
      ? { duration: 2000, iterations: Infinity }
      : { duration: 250, iterations: 1 },
  glitchTimeSpan:
    playMode === "always" ? { start: 0.5, end: 0.7 } : { start: 0, end: 1 },
  shake: {
    velocity: 15,
    amplitudeX: 0.2,
    amplitudeY: 0.2,
  },
  slice:
    playMode === "click"
      ? {
          count: 15,
          velocity: 20,
          minHeight: 0.02,
          maxHeight: 0.15,
          hueRotate: true,
        }
      : {
          count: 6,
          velocity: 15,
          minHeight: 0.02,
          maxHeight: 0.15,
          hueRotate: true,
        },
  pulse: false,
});

const mergeOptions = (...objects: Partial<GlitchOptions>[]): GlitchOptions => {
  const isObject = (item: any): item is object =>
    item && typeof item === "object";

  return objects.reduce((result, current) => {
    Object.keys(current).forEach((key) => {
      const resultValue = result[key as keyof GlitchOptions];
      const currentValue = current[key as keyof GlitchOptions];

      if (isObject(resultValue) && isObject(currentValue)) {
        result[key as keyof GlitchOptions] = mergeOptions(
          resultValue,
          currentValue
        );
      } else if (currentValue !== undefined) {
        result[key as keyof GlitchOptions] = currentValue;
      }
    });

    return result;
  }, {}) as GlitchOptions;
};

const getGlitchFactor = (options: GlitchOptions, progress: number): number => {
  if (!options.glitchTimeSpan) return 1;
  const { start, end } = options.glitchTimeSpan;
  if (progress < start || progress > end) return 0;
  const mid = start + (end - start) / 2;
  return progress < mid
    ? (progress - start) / (mid - start)
    : (end - progress) / (end - mid);
};

const randomGlitchFactor = (options: GlitchOptions, progress: number): number =>
  (Math.random() - 0.5) * 2 * getGlitchFactor(options, progress);

const generateClipPath = ({
  minHeight,
  maxHeight,
  minWidth,
  maxWidth,
}: {
  minHeight: number;
  maxHeight: number;
  minWidth: number;
  maxWidth: number;
}): string => {
  const height =
    Math.floor(Math.random() * ((maxHeight - minHeight) * 100 + 1)) +
    minHeight * 100;
  const width =
    Math.floor(Math.random() * ((maxWidth - minWidth) * 100 + 1)) +
    minWidth * 100;
  const top = Math.floor(Math.random() * (100 - height));
  const left = Math.floor(Math.random() * (100 - width));

  const topLeft = `${left + width}% ${top}%`;
  const topRight = `${left + width}% ${top + height}%`;
  const bottomRight = `${left}% ${top + height}%`;
  const bottomLeft = `${left}% ${top}%`;

  return `polygon(${topLeft}, ${topRight}, ${bottomRight}, ${bottomLeft})`;
};

const generateSliceEffect = (options: GlitchOptions) => {
  const steps =
    Math.floor((options.slice!.velocity * options.timing!.duration) / 1000) + 1;
  const keyframes = [];

  for (let i = 0; i < steps; ++i) {
    if (getGlitchFactor(options, i / steps) === 0) {
      keyframes.push({ opacity: "0", transform: "none", clipPath: "unset" });
      continue;
    }

    const translateX = randomGlitchFactor(options, i / steps) * 30;
    const keyframe: any = {
      opacity: "1",
      transform: `translate3d(${translateX}%, 0, 0)`,
      clipPath: generateClipPath({
        minHeight: options.slice!.minHeight,
        maxHeight: options.slice!.maxHeight,
        minWidth: 1,
        maxWidth: 1,
      }),
    };

    if (options.slice!.hueRotate) {
      const randomHue = Math.floor(Math.random() * 360);
      keyframe.filter = `hue-rotate(${randomHue}deg)`;
    }

    keyframes.push(keyframe);
  }

  return {
    steps: keyframes,
    timing: {
      ...options.timing,
      easing: `steps(${steps}, jump-start)`,
      delay: Math.random() * 100, // Zufällige Verzögerung zwischen 0 und 100ms
    },
  };
};

const generatePulseEffect = (options: GlitchOptions) => {
  if (!options.pulse) return null;

  return {
    steps: [
      { transform: "scale(1)", opacity: "1" },
      { transform: `scale(${options.pulse.scale})`, opacity: "0" },
    ],
    timing: {
      ...options.timing,
      delay:
        (options.glitchTimeSpan ? options.glitchTimeSpan.start : 0) *
        options.timing!.duration,
      easing: "ease-in-out",
    },
  };
};

const generateShakeEffect = (options: GlitchOptions) => {
  if (!options.shake) return { steps: [], timing: {} };

  const steps =
    Math.floor((options.shake.velocity * options.timing!.duration) / 1000) + 1;
  const keyframes = [];

  const randomAmplitudeX = options.shake!.amplitudeX * (0.5 + Math.random());
  const randomAmplitudeY = options.shake!.amplitudeY * (0.5 + Math.random());

  for (let i = 0; i < steps; ++i) {
    const translateX =
      randomGlitchFactor(options, i / steps) * randomAmplitudeX * 100;
    const translateY =
      randomGlitchFactor(options, i / steps) * randomAmplitudeY * 100;

    keyframes.push({
      transform: `translate3d(${translateX}%, ${translateY}%, 0)`,
    });
  }

  return {
    steps: keyframes,
    timing: { ...options.timing, easing: `steps(${steps}, jump-start)` },
  };
};

const generateLayers = (options: GlitchOptions) => {
  const randomSliceCount =
    Math.floor(Math.random() * (options.slice!.count - 2)) + 2; // Mindestens 2 Slices
  return [
    generateShakeEffect(options),
    generatePulseEffect(options),
    ...Array.from({ length: randomSliceCount }).map(() =>
      generateSliceEffect(options)
    ),
  ].filter((effect) => effect !== null);
};

const setupGlitchContainers = (
  element: HTMLElement,
  options: GlitchOptions
) => {
  if (!options.createContainers) {
    return {
      container: element,
      layersContainer: element,
      glitched: element.firstElementChild as HTMLElement,
    };
  }

  if (!element.dataset.glitched) {
    const layersContainer = document.createElement("div");
    const container = document.createElement("div");

    if (
      getComputedStyle(element)
        .getPropertyValue("display")
        .match(/^inline/)
    ) {
      container.style.display = "inline-block";
    }

    container.appendChild(layersContainer);
    element.parentElement?.insertBefore(container, element);
    layersContainer.prepend(element);

    return { container, layersContainer, glitched: element };
  }

  const layersContainer = element.parentElement!;
  const container = layersContainer.parentElement;

  while (layersContainer.children.length > 1) {
    layersContainer.removeChild(layersContainer.children[1]);
  }

  layersContainer
    .firstElementChild!.getAnimations()
    .forEach((animation) => animation.cancel());

  return { container, layersContainer, glitched: element };
};

const applyGlitchEffect = (element: HTMLElement, options: GlitchOptions) => {
  const { glitched, container, layersContainer } = setupGlitchContainers(
    element,
    options
  );

  layersContainer.style.display = "grid";
  if (options.hideOverflow) {
    container!.style.overflow = "hidden";
  }
  if (options.html) {
    glitched.innerHTML = options.html;
  }

  glitched.style.gridArea = "1/1/-1/-1";

  const clonedElement = glitched.cloneNode(true) as HTMLElement;
  clonedElement.style.gridArea = "1/1/-1/-1";
  clonedElement.style.userSelect = "none";
  clonedElement.style.pointerEvents = "none";
  clonedElement.style.opacity = "0";

  const randomizedOptions = {
    ...options,
    glitchTimeSpan: options.glitchTimeSpan
      ? {
          start: options.glitchTimeSpan.start * (0.9 + Math.random() * 0.2),
          end: options.glitchTimeSpan.end * (0.9 + Math.random() * 0.2),
        }
      : undefined,
  };

  const generateNewLayers = () => generateLayers(randomizedOptions);

  let currentLayers = generateNewLayers();

  for (let i = 0; i < currentLayers.length - 1; ++i) {
    const clone = clonedElement.cloneNode(true) as HTMLElement;
    layersContainer.appendChild(clone);
  }

  const isLinkActive = () => {
    const link = element.querySelector("a");
    return (
      link &&
      (link.classList.contains("router-link-active") ||
        link.classList.contains("router-link-exact-active"))
    );
  };

  const startGlitch = () => {
    if (!isLinkActive()) {
      // Generiere neue Layers bei jedem Start des Glitch-Effekts
      currentLayers = generateNewLayers();
      currentLayers.forEach((layer, index) => {
        const child = layersContainer.children[index] as HTMLElement;
        if (child) {
          child.animate(layer.steps, layer.timing);
        }
      });
    }
  };

  const stopGlitch = () => {
    layersContainer.childNodes.forEach((child) => {
      if (child instanceof HTMLElement) {
        child.getAnimations().forEach((animation) => {
          animation.cancel();
        });
      }
    });
  };

  const updateGlitchState = () => {
    if (isLinkActive()) {
      stopGlitch();
    } else if (options.playMode === "always") {
      startGlitch();
    }
  };

  updateGlitchState();

  container!.onmouseenter = null;
  container!.onmouseleave = null;
  container!.onclick = null;

  switch (options.playMode) {
    case "always":
      startGlitch();
      break;
    case "hover":
      container!.onmouseenter = startGlitch;
      container!.onmouseleave = stopGlitch;
      break;
    case "click":
      container!.onclick = () => {
        if (getComputedStyle(element).pointerEvents !== "none") {
          stopGlitch();
          startGlitch();
        } else {
          stopGlitch();
        }
      };
      break;
  }

  element.dataset.glitched = "1";

  // MutationObserver für Klassenänderungen
  const observer = new MutationObserver((mutations) => {
    if (
      mutations.some(
        (mutation) =>
          mutation.type === "attributes" && mutation.attributeName === "class"
      )
    ) {
      updateGlitchState();
    }
  });

  const linkElement = element.querySelector("a");
  if (linkElement) {
    observer.observe(linkElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  // Event-Listener für verschiedene Playmodes
  switch (options.playMode) {
    case "always":
      // Bereits durch updateGlitchState abgedeckt
      break;
    case "hover":
      layersContainer.onmouseenter = startGlitch;
      layersContainer.onmouseleave = stopGlitch;
      break;
    case "click":
      layersContainer.onclick = (event) => {
        if (!isLinkActive()) {
          stopGlitch();
          startGlitch();
        }
      };
      break;
  }

  return { container, startGlitch, stopGlitch, updateGlitchState };
};

const glitch = (
  selector: string | NodeListOf<Element> | HTMLElement[] | HTMLElement,
  options: Partial<GlitchOptions> = {}
): {
  containers: HTMLElement[];
  startGlitch: () => void;
  stopGlitch: () => void;
  updateGlitchState: () => void;
} => {
  const mergedOptions = mergeOptions(
    getDefaultOptions(options.playMode),
    options
  );
  let elements: HTMLElement[] = [];

  if (typeof selector === "string") {
    elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
  } else if (selector instanceof NodeList) {
    elements = Array.from(selector) as HTMLElement[];
  } else if (Array.isArray(selector)) {
    elements = selector;
  } else if (selector instanceof HTMLElement) {
    elements = [selector];
  }

  const glitchInstances = elements.map((element) =>
    applyGlitchEffect(element, mergedOptions)
  );

  const checkPointerEvents = (element: HTMLElement) => {
    return getComputedStyle(element).pointerEvents !== "none";
  };

  const startGlitch = () => {
    glitchInstances.forEach((instance, index) => {
      if (!elements[index].closest("a.router-link-active")) {
        instance.startGlitch();
      }
    });
  };

  const stopGlitch = () => {
    glitchInstances.forEach((instance) => instance.stopGlitch());
  };

  const updateGlitchState = () => {
    glitchInstances.forEach((instance) => instance.updateGlitchState());
  };

  // Beobachter für Änderungen der pointer-events Eigenschaft
  elements.forEach((element, index) => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "style"
        ) {
          if (checkPointerEvents(element)) {
            glitchInstances[index].startGlitch();
          } else {
            glitchInstances[index].stopGlitch();
          }
        }
      });
    });

    observer.observe(element, { attributes: true, attributeFilter: ["style"] });
  });

  return {
    containers: glitchInstances.map((instance) => instance.container!),
    startGlitch,
    stopGlitch,
    updateGlitchState,
  };
};

export const PowerGlitch = {
  glitch,
  generateLayers,
  getDefaultOptions,
};
