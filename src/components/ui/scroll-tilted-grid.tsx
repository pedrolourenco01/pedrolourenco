"use client";

import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
  cubicBezier,
} from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Curated editorial portrait set used as the default `images` for {@link ScrollTiltedGrid}.
 * Hosted on Pinterest's CDN — fine for demos and prototypes; swap to your own assets in production.
 */
export const DEFAULT_GRID_IMAGES: readonly string[] = [
  "https://cdn.21st.dev/assets/mirror/ca/ca595f685bfb222a57503ebb61768567a157e08ce2aeea4d9528d2eac6adba42.jpg",
  "https://cdn.21st.dev/assets/mirror/18/18a9508cb4d32bafcca0bcb61fd6377ae17e603e748683546245c9756029a1e4.jpg",
  "https://cdn.21st.dev/assets/mirror/00/0063cd8bdc9df137611a4126f1ea57fef6f7e689a26b9d2f7f7b6baeece0f929.jpg",
  "https://cdn.21st.dev/assets/mirror/6b/6bb0dd6bfa58566d75298f31dc7a06140cfecee3784915da8ed92116adb7a700.jpg",
  "https://cdn.21st.dev/assets/mirror/b5/b53bbdc85e9458dabb5076ba25d910f8605c6c12a0393412b3a5fdd83e608f3f.jpg",
  "https://cdn.21st.dev/assets/mirror/24/24bd8fd0fd7d1e7b4457451023aad6417e5b3af08b08ae4a6741ce2f7eba8894.jpg",
  "https://cdn.21st.dev/assets/mirror/1f/1f1b64b7ee7cf78f43e97d94879cab2b33ae2763afa50300c5d173823230762d.jpg",
  "https://cdn.21st.dev/assets/mirror/0d/0d1ab8243c66be4455c3b1d771d9639436fcd8aa33610bb179db85f6d688273f.jpg",
  "https://cdn.21st.dev/assets/mirror/ea/ea5c745f8119ead4428ea1dbdb53abd753683866f82db7325bd71fe7192fee40.jpg",
  "https://cdn.21st.dev/assets/mirror/dc/dc5a186a48cc8e1ac3aae31209f059b257a5e500f415c5af83d2a4ca3242fa1e.jpg",
  "https://cdn.21st.dev/assets/mirror/1b/1b8bad321bcda541188a2d55d4f85d3faec98d1b4adadca98f2c6dd486994a1a.jpg",
  "https://cdn.21st.dev/assets/mirror/a8/a89c4fa85bcc2cc20063c24a8e5790ca414d59cda0995f83eef4c9808f386855.jpg",
];

const easeIntoFocus = cubicBezier(0.22, 1, 0.36, 1);
const easeOutOfFocus = cubicBezier(0, 0, 0.58, 1);
const focusEase: [typeof easeIntoFocus, typeof easeOutOfFocus] = [
  easeIntoFocus,
  easeOutOfFocus,
];

export type MaxWidthToken =
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "none";

export type GapToken = 4 | 6 | 8 | 10 | 12 | 14;

const MAX_WIDTH_CLASS: Record<MaxWidthToken, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  none: "",
};

const GAP_CLASS: Record<GapToken, string> = {
  4: "gap-4",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
  14: "gap-14",
};

export type Side = "L" | "R";

export type TileConfig = {
  aspectRatio: string;
  perspective: number;
  maxTilt: number;
  maxBlur: number;
  rounded: string;
};

export function Tile({
  src,
  side,
  config,
  className = "",
  alt = "",
  variant = "editorial",
}: {
  src: string;
  side: Side;
  config: TileConfig;
  className?: string;
  alt?: string;
  variant?: "editorial" | "demo";
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const reduce = useReducedMotion();
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  useEffect(() => {
    const check = () => {
      const isTouchOrSmall = window.matchMedia(
        "(max-width: 1200px), (max-width: 1280px) and (orientation: portrait), (hover: none)"
      ).matches;
      setIsMobileOrTablet(isTouchOrSmall);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const sign = side === "L" ? -1 : 1;
  const { aspectRatio, perspective, maxTilt, maxBlur, rounded } = config;

  // Visual optical filters: in editorial mode, ensure natural lighting (never 0/pitch black)
  const isDemo = variant === "demo";
  const blur = useTransform(p, [0, 0.5, 1], [maxBlur, 0, maxBlur], { ease: focusEase });
  const bright = useTransform(
    p,
    [0, 0.5, 1],
    isDemo ? [0, 1, 0] : [0.85, 1, 0.85],
    { ease: focusEase }
  );
  const contrast = useTransform(
    p,
    [0, 0.5, 1],
    isDemo ? [4, 1, 4] : [1.15, 1, 1.15],
    { ease: focusEase }
  );
  const opacity = useTransform(
    p,
    [0, 0.35, 0.5, 0.85, 1],
    isDemo ? [0, 0.8, 1, 0.8, 0] : [0.75, 0.95, 1, 0.95, 0.75],
    { ease: focusEase }
  );

  // 3D & 2D spatial transformations
  const ty = useTransform(
    p,
    [0, 0.5, 1],
    isDemo ? ["100%", "0%", "-100%"] : ["12%", "0%", "-12%"],
    { ease: focusEase }
  );
  const tz = useTransform(
    p,
    [0, 0.5, 1],
    isDemo ? [300, 0, 300] : [120, 0, 120],
    { ease: focusEase }
  );
  const rx = useTransform(p, [0, 0.5, 1], [maxTilt, 0, -maxTilt], { ease: focusEase });

  const tx = useTransform(
    p,
    [0, 0.5, 1],
    isDemo ? [`${sign * 40}%`, "0%", `${sign * 40}%`] : [`${sign * 6}%`, "0%", `${sign * 6}%`],
    { ease: focusEase }
  );
  const rot = useTransform(
    p,
    [0, 0.5, 1],
    isDemo ? [-sign * 5, 0, sign * 5] : [-sign * 2.5, 0, sign * 2.5],
    { ease: focusEase }
  );
  const sk = useTransform(
    p,
    [0, 0.5, 1],
    isDemo ? [sign * 20, 0, -sign * 20] : [sign * 4, 0, -sign * 4],
    { ease: focusEase }
  );

  const innerSY = useTransform(
    p,
    [0, 0.5, 1],
    isDemo ? [1.8, 1, 1.8] : [1.12, 1, 1.12],
    { ease: focusEase }
  );

  const filter = useMotionTemplate`blur(${blur}px) brightness(${bright}) contrast(${contrast})`;

  if (reduce || isMobileOrTablet) {
    return (
      <figure ref={ref} className={`relative z-10 m-0 w-full ${className}`} aria-label={alt}>
        <div
          className="relative w-full overflow-hidden"
          style={{ aspectRatio, borderRadius: rounded }}
        >
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover block select-none pointer-events-none"
            loading="lazy"
          />
        </div>
      </figure>
    );
  }

  return (
    <motion.figure
      ref={ref}
      className={`relative z-10 m-0 w-full group cursor-pointer ${className}`}
      style={{ perspective, willChange: "transform" }}
      aria-label={alt}
    >
      <motion.div
        className="relative w-full overflow-hidden will-change-[filter,transform]"
        style={{
          aspectRatio,
          borderRadius: rounded,
          filter,
          opacity,
          x: tx,
          y: ty,
          z: tz,
          rotate: rot,
          rotateX: rx,
          skewX: sk,
          boxShadow: "none",
          backgroundColor: "#dfded8",
        }}
        whileHover={{
          boxShadow: "none",
          transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
        }}
      >
        <motion.div
          className="w-full h-full will-change-transform"
          style={{
            scaleY: innerSY,
            backfaceVisibility: "hidden",
          }}
        >
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover block select-none pointer-events-none transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        </motion.div>
      </motion.div>
    </motion.figure>
  );
}

export interface ScrollTiltedTileProps {
  src: string;
  side?: Side;
  aspectRatio?: string;
  perspective?: number;
  maxTilt?: number;
  maxBlur?: number;
  rounded?: string;
  className?: string;
  alt?: string;
  variant?: "editorial" | "demo";
}

export function ScrollTiltedTile({
  src,
  side = "L",
  aspectRatio = "16/10",
  perspective = 900,
  maxTilt = 32,
  maxBlur = 4,
  rounded = "12px",
  className = "",
  alt,
  variant = "editorial",
}: ScrollTiltedTileProps) {
  const config = useMemo<TileConfig>(
    () => ({ aspectRatio, perspective, maxTilt, maxBlur, rounded }),
    [aspectRatio, perspective, maxTilt, maxBlur, rounded]
  );
  return (
    <Tile
      src={src}
      side={side}
      config={config}
      className={className}
      alt={alt}
      variant={variant}
    />
  );
}

export type ScrollTiltedGridProps = {
  /** Image URLs to render. Falls back to {@link DEFAULT_GRID_IMAGES}. */
  images?: readonly string[];
  /**
   * Cycle the source list and append more pairs as the user nears the bottom —
   * a perceptually infinite scroll. Default `false`.
   */
  loop?: boolean;
  /** Initial number of cycles to render when `loop` is on. Default `3`. */
  initialCycles?: number;
  /** CSS `aspect-ratio` value for each tile, e.g. `"3/4"`, `"2/3"`. Default `"3/4"`. */
  aspectRatio?: string;
  /** Tailwind `max-w-*` token controlling the column width. Default `"lg"`. */
  maxWidth?: MaxWidthToken;
  /** Tailwind `gap-*` token between tiles. Default `10`. */
  gap?: GapToken;
  /** CSS `perspective` in pixels applied to each tile. Default `900`. */
  perspective?: number;
  /**
   * Maximum `rotateX` tilt magnitude (in degrees) at the entry and exit poses.
   * Symmetric — entry tilts forward `+maxTilt`, exit tilts back `-maxTilt`.
   * Default `70`.
   */
  maxTilt?: number;
  /** Maximum blur (px) at the entry and exit poses. Default `8`. */
  maxBlur?: number;
  /**
   * CSS `border-radius` for the tile clipping mask. Accepts any CSS length value
   * (`"0.375rem"`, `"12px"`, `"1rem"`). Default `"0.375rem"` (Tailwind `rounded-md`).
   */
  rounded?: string;
  /** Additional className applied to the outer `<section>`. */
  className?: string;
};

/**
 * Editorial scroll-tilted image grid. Pairs of images rise from below tipped
 * forward, settle into a clean focus, then tilt back over the top edge as they
 * exit. Optionally loops infinitely via an IntersectionObserver-driven append.
 */
export function ScrollTiltedGrid({
  images = DEFAULT_GRID_IMAGES,
  loop = false,
  initialCycles = 3,
  aspectRatio = "3/4",
  maxWidth = "lg",
  gap = 10,
  perspective = 900,
  maxTilt = 70,
  maxBlur = 8,
  rounded = "0.375rem",
  className,
}: ScrollTiltedGridProps = {}) {
  const [cycles, setCycles] = useState(loop ? initialCycles : 1);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loop) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setCycles((c) => c + 2);
        }
      },
      { rootMargin: "1500px 0px 1500px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loop]);

  const items = useMemo(
    () =>
      loop
        ? Array.from({ length: cycles }, () => images).flat()
        : [...images],
    [loop, cycles, images],
  );

  const config = useMemo<TileConfig>(
    () => ({ aspectRatio, perspective, maxTilt, maxBlur, rounded }),
    [aspectRatio, perspective, maxTilt, maxBlur, rounded],
  );

  const gridClass = [
    "mx-auto mt-[20vh] mb-[10vh] grid w-full grid-cols-2 px-6 py-[20vh]",
    MAX_WIDTH_CLASS[maxWidth],
    GAP_CLASS[gap],
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      className={["relative w-full", className].filter(Boolean).join(" ")}
    >
      <div className={gridClass}>
        {items.map((src, i) => (
          <Tile
            key={`${i}-${src}`}
            src={src}
            side={i % 2 === 0 ? "L" : "R"}
            config={config}
          />
        ))}
      </div>
      {loop ? (
        <div ref={sentinelRef} aria-hidden className="h-px w-full" />
      ) : null}
    </section>
  );
}

export default ScrollTiltedGrid;
