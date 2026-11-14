"use client";

import { LazyMotion, m, useInView, type Transition as AnimationOptions } from "motion/react";

const loadMotionFeatures = () =>
  import("motion/react").then((mod) => mod.domAnimation);
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

interface SlideUpTextProps {
  children?: React.ReactNode;
  text?: string;
  split?: "words" | "characters" | "lines";
  delay?: number;
  stagger?: number;
  from?: "first" | "last" | "center";
  transition?: AnimationOptions;
  className?: string;
  wordClass?: string;
  charClass?: string;
  autoStart?: boolean;
  onStart?: () => void;
  onComplete?: () => void;
  inView?: boolean;
  once?: boolean;
  hoverRoll?: boolean;
  triggerEvent?: string;
  resetEvent?: string;
  triggerSelector?: string;
}

export interface SlideUpTextRef {
  startAnimation: () => void;
  reset: () => void;
}

interface WordObject {
  characters: string[];
  needsSpace: boolean;
}

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function extractText(node: any): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!node) return "";
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (typeof node === "object") {
    // Astro StaticHtml slot: props.value
    if (typeof node.props?.value === "string") {
      return decodeEntities(node.props.value.replace(/<[^>]*>?/gm, "").trim());
    }
    // Astro StaticHtml slot: dangerouslySetInnerHTML
    if (typeof node.props?.dangerouslySetInnerHTML?.__html === "string") {
      return decodeEntities(node.props.dangerouslySetInnerHTML.__html.replace(/<[^>]*>?/gm, "").trim());
    }
    // Standard React children
    if (node.props?.children) {
      return extractText(node.props.children);
    }
    if (typeof node.value === "string") {
      return decodeEntities(node.value.replace(/<[^>]*>?/gm, "").trim());
    }
  }
  return "";
}

const SlideUpText = forwardRef<SlideUpTextRef, SlideUpTextProps>(
  (
    {
      children,
      text: textProp,
      split = "words",
      delay = 0,
      stagger = 0.1,
      from = "first",
      transition = {
        type: "tween",
        ease: [0.625, 0.05, 0, 1],
        duration: 0.5,
      },
      className,
      wordClass,
      charClass,
      autoStart = true,
      onStart,
      onComplete,
      inView = false,
      once = true,
      hoverRoll = false,
      triggerEvent,
      resetEvent,
      triggerSelector,
      ...props
    },
    ref,
  ) => {
    const rawText = textProp || (typeof children === "string" ? children : extractText(children));
    const text = decodeEntities(rawText);
    const [isAnimating, setIsAnimating] = useState(false);

    const splitIntoCharacters = (text: string): string[] => {
      if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
        const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
        return Array.from(segmenter.segment(text), ({ segment }) => segment);
      }
      return Array.from(text);
    };

    const elements = useMemo(() => {
      const words = text.split(" ");
      if (split === "characters") {
        return words.map((word, i) => ({
          characters: splitIntoCharacters(word),
          needsSpace: i !== words.length - 1,
        }));
      }
      return split === "words" ? text.split(" ") : text.split("\n");
    }, [text, split]);

    const getStaggerDelay = useCallback(
      (index: number) => {
        const total =
          split === "characters"
            ? elements.reduce(
                (acc, word) =>
                  acc +
                  (typeof word === "string"
                    ? 1
                    : word.characters.length + (word.needsSpace ? 1 : 0)),
                0,
              )
            : elements.length;

        if (from === "first") return index * stagger;
        if (from === "last") return (total - 1 - index) * stagger;
        if (from === "center") {
          const center = Math.floor(total / 2);
          return Math.abs(center - index) * stagger;
        }
        return index * stagger;
      },
      [elements, from, stagger, split],
    );

    const startAnimation = useCallback(() => {
      setIsAnimating(true);
      onStart?.();
    }, [onStart]);

    useImperativeHandle(ref, () => ({
      startAnimation,
      reset: () => setIsAnimating(false),
    }));

    const containerRef = useRef<HTMLSpanElement>(null);
    const isInView = useInView(containerRef, { once, amount: 0.15 });

    useEffect(() => {
      if (triggerEvent) return;
      if (inView && isInView) {
        startAnimation();
      }
    }, [triggerEvent, inView, isInView, startAnimation]);

    useEffect(() => {
      if (triggerEvent) return;
      if (autoStart && !inView) {
        startAnimation();
      }
    }, [triggerEvent, autoStart, inView, startAnimation]);

    useEffect(() => {
      if (!triggerEvent) return;
      const onReveal = () => {
        setIsAnimating(true);
        onStart?.();
      };
      const onHide = () => {
        if (!once) {
          setIsAnimating(false);
        }
      };
      window.addEventListener(triggerEvent, onReveal);
      if (resetEvent) {
        window.addEventListener(resetEvent, onHide);
      }
      if (triggerSelector && typeof document !== "undefined") {
        if (document.querySelector(triggerSelector)?.classList.contains("is-revealed")) {
          onReveal();
        }
      }
      return () => {
        window.removeEventListener(triggerEvent, onReveal);
        if (resetEvent) {
          window.removeEventListener(resetEvent, onHide);
        }
      };
    }, [triggerEvent, resetEvent, triggerSelector, once, onStart]);

    const variants = {
      hidden: { y: "135%" },
      visible: (i: number) => ({
        y: 0,
        transition: {
          ...transition,
          delay:
            delay + ((transition?.delay as number) || 0) + getStaggerDelay(i),
        },
      }),
    };

    return (
      <LazyMotion features={loadMotionFeatures}>
        <m.span
          ref={containerRef}
          suppressHydrationWarning
          className={cn(
            className,
            "flex flex-wrap whitespace-pre-wrap",
            split === "lines" && "flex-col",
          )}
          initial="hidden"
          whileInView={triggerEvent ? undefined : inView ? "visible" : undefined}
          animate={triggerEvent ? (isAnimating ? "visible" : "hidden") : inView ? undefined : isAnimating ? "visible" : "hidden"}
          viewport={{ once }}
          onAnimationStart={() => {
            if (inView) {
              setIsAnimating(true);
              onStart?.();
            }
          }}
          {...props}
        >
          <span className="sr-only" suppressHydrationWarning>{text}</span>

          {(split === "characters"
            ? (elements as WordObject[])
            : (elements as string[]).map((el, i, arr) => ({
                characters: [el],
                needsSpace: split === "words" && i !== arr.length - 1,
              }))
          ).map((wordObj, wordIndex, array) => {
            const previousCharsCount = array
              .slice(0, wordIndex)
              .reduce((sum, word) => sum + word.characters.length, 0);

            return (
              <span
                key={wordIndex}
                aria-hidden="true"
                className={cn("inline-flex overflow-x-visible overflow-y-clip py-[0.25em] -my-[0.25em] px-[0.2em] -mx-[0.2em]", wordClass)}
              >
                {wordObj.characters.map((char, charIndex) => (
                  <span
                    className={cn(
                      charClass,
                      "whitespace-pre-wrap relative py-[0.25em] -my-[0.25em] px-[0.15em] -mx-[0.15em]",
                      split === "characters" ? "overflow-x-visible overflow-y-clip" : "overflow-visible"
                    )}
                    key={charIndex}
                  >
                    <m.span
                      custom={previousCharsCount + charIndex}
                      initial="hidden"
                      animate={isAnimating ? "visible" : "hidden"}
                      variants={variants}
                      onAnimationComplete={
                        wordIndex === array.length - 1 &&
                        charIndex === wordObj.characters.length - 1
                          ? onComplete
                          : undefined
                      }
                      className="inline-block"
                    >
                      {char}
                    </m.span>
                  </span>
                ))}
                {wordObj.needsSpace && (
                  <span className="relative overflow-x-visible overflow-y-clip whitespace-pre py-[0.25em] -my-[0.25em]">
                    <m.span
                      custom={previousCharsCount + wordObj.characters.length}
                      initial="hidden"
                      animate={isAnimating ? "visible" : "hidden"}
                      variants={variants}
                      className="inline-block"
                    >
                      {"\u00A0"}
                    </m.span>
                  </span>
                )}
              </span>
            );
          })}
        </m.span>
      </LazyMotion>
    );
  },
);

SlideUpText.displayName = "SlideUpText";

export { SlideUpText };
export type { SlideUpTextProps };

export default SlideUpText;
