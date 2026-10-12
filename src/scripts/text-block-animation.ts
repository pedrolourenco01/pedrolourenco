import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText, ScrollTrigger);
}

export interface BlockAnimationOptions {
  blockColor?: string;
  duration?: number;
  stagger?: number;
  delay?: number;
  trigger?: string | Element;
  start?: string;
  animateOnScroll?: boolean;
}

export function initTextBlockReveal(
  target: string | HTMLElement | (string | HTMLElement)[],
  options: BlockAnimationOptions = {}
) {
  if (typeof window === "undefined") return;

  const {
    blockColor = "#ffffff",
    duration = 0.6,
    stagger = 0.08,
    delay = 0,
    start = "top 85%",
    animateOnScroll = true,
  } = options;

  const elements = typeof target === "string"
    ? Array.from(document.querySelectorAll(target))
    : Array.isArray(target) ? target : [target];

  elements.forEach((container) => {
    const el = typeof container === "string" ? document.querySelector(container) : container;
    if (!el || (el as any).__hasBlockReveal) return;
    (el as any).__hasBlockReveal = true;

    // Check if element already has designated line children
    let lines: HTMLElement[] = [];
    const preExistingLines = el.querySelectorAll<HTMLElement>(
      ".headline-line-inner, .eyebrow-line"
    );

    if (preExistingLines.length > 0) {
      lines = Array.from(preExistingLines);
    } else {
      const split = new SplitText(el, {
        type: "lines",
        linesClass: "block-line-parent",
      });
      lines = split.lines as HTMLElement[];
    }

    const blocks: HTMLDivElement[] = [];

    lines.forEach((line) => {
      // Force line to hug text width
      line.style.display = "inline-block";
      line.style.width = "fit-content";
      line.style.maxWidth = "100%";
      line.style.verticalAlign = "top";

      // Wrapper around the line - hugs the exact text boundary
      const wrapper = document.createElement("div");
      wrapper.className = "block-revealer-wrapper";
      wrapper.style.position = "relative";
      wrapper.style.display = "block";
      wrapper.style.width = "fit-content";
      wrapper.style.maxWidth = "100%";
      wrapper.style.overflow = "hidden";
      wrapper.style.verticalAlign = "top";

      // The sliding revealer block
      const block = document.createElement("div");
      block.className = "block-revealer-element";
      block.style.position = "absolute";
      block.style.top = "0";
      block.style.left = "0";
      block.style.width = "100%";
      block.style.height = "100%";
      block.style.backgroundColor = blockColor;
      block.style.zIndex = "2";
      block.style.transform = "scaleX(0)";
      block.style.transformOrigin = "left center";

      if (line.parentNode) {
        line.parentNode.insertBefore(wrapper, line);
        wrapper.appendChild(line);
        wrapper.appendChild(block);
      }

      // Initial state: line invisible and reset transform
      gsap.set(line, { opacity: 0, y: 0 });
      blocks.push(block);
    });

    // Make container visible now that child lines are safely hidden at opacity 0
    gsap.set(el, { opacity: 1 });

    const tl = gsap.timeline({
      scrollTrigger: animateOnScroll ? {
        trigger: options.trigger || el,
        start,
        toggleActions: "play none none reverse",
      } : null,
      delay,
    });

    // Build the animation sequence per line:
    // Text remains 100% invisible until block fully covers it, and is revealed only as the block pulls away!
    blocks.forEach((block, index) => {
      const line = lines[index];
      const lineTl = gsap.timeline();

      // Step A: Scale Block 0 -> 1 (Left to Right), text is 100% invisible
      lineTl.to(block, {
        scaleX: 1,
        duration: duration,
        ease: "expo.inOut",
        transformOrigin: "left center",
      })
      // Step B: The exact moment block is 100% covering text (scaleX: 1), make line opaque behind it
      .set(line, {
        opacity: 1,
      })
      // Step C: Scale Block 1 -> 0 (Left to Right, shrinking toward right), revealing the text
      .to(block, {
        scaleX: 0,
        duration: duration,
        ease: "expo.inOut",
        transformOrigin: "right center",
      });

      tl.add(lineTl, index * stagger);
    });
  });
}
