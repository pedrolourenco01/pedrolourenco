import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

/**
 * Extracted from MengTo/threeui (MIT) — src/shaders/neuform-isolated/NeuformBatchEffects.tsx,
 * export `TopoField`. That module is a shared file holding many unrelated background effects
 * (ConstellationField, ParticleDrift, FluxVortex, DiagnosticsPanel, WireframeForms, ...); only the
 * machinery TopoField itself needs — its HTML/WebGL document plus the isolate/patch/control
 * pipeline that turns the raw page into a focused full-bleed background — is kept here.
 *
 * The effect's document (normally loaded via a Vite `?raw` import of
 * ./sources/topo-field.html) is inlined verbatim below. Only its own internal backticks (from the
 * vsSource/fsSource template literals inside its <script>) are escaped so it nests in this outer
 * template literal.
 */
const topoFieldSource = `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NexusNode Infrastructure</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
    <!-- GSAP & ScrollTrigger for Masked Reveal -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
</head>
<body class="bg-black text-white font-sans min-h-screen relative overflow-x-hidden selection:bg-white/20 selection:text-white font-light" style="background-color: #000; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">

    <!-- WebGL Background Container -->
    <div class="fixed inset-0 z-0 pointer-events-none">
        <canvas id="topo-canvas" class="w-full h-full"></canvas>
        <!-- Gradient overlay to fade bottom and top for text readability -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black z-10"></div>
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] opacity-90 z-10"></div>
    </div>

    <!-- Main Content -->
    <main class="relative z-20 flex flex-col min-h-screen">

        <!-- Navigation -->
        <header class="container mx-auto px-6 py-6 flex items-center justify-between reveal opacity-0 translate-y-4 transition-all duration-1000 ease-out">
            <div class="flex items-center gap-2 text-white hover:text-neutral-300 transition-colors cursor-pointer">
                <iconify-icon icon="solar:radar-linear" width="24"></iconify-icon>
                <span class="font-light text-sm tracking-tight">NexusNode</span>
            </div>
            <nav class="hidden md:flex items-center gap-8 text-sm text-neutral-400 font-extralight">
                <a href="#" class="hover:text-white transition-colors">Compute Clusters</a>
                <a href="#" class="hover:text-white transition-colors">Observability</a>
                <a href="#" class="hover:text-white transition-colors">Throughput</a>
                <a href="#" class="hover:text-white transition-colors">Consensus</a>
            </nav>
            <div class="flex items-center gap-4">
                <a href="#" class="hidden md:block text-sm text-neutral-400 font-extralight hover:text-white transition-colors">Sign In</a>
                <button class="bg-white text-black px-4 py-2 rounded-full text-sm font-light hover:bg-neutral-200 transition-colors">
                    Get Started
                </button>
            </div>
        </header>

        <!-- Hero Section -->
        <section class="flex-grow flex flex-col items-center justify-center text-center px-6 py-24 md:py-32">
            <div class="max-w-4xl mx-auto flex flex-col items-center">

                <!-- Pill Badge -->
                <div class="reveal opacity-0 translate-y-4 transition-all duration-1000 ease-out inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8">
                    <span class="flex h-2 w-2 relative">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    <span class="text-xs font-extralight text-neutral-300 tracking-wide uppercase">Nexus OS v4.2 deployment ready</span>
                    <iconify-icon icon="solar:alt-arrow-right-linear" width="14" class="text-neutral-500"></iconify-icon>
                </div>

                <h1 class="mask-container text-5xl md:text-7xl lg:text-8xl font-light tracking-tight text-white leading-[1.1]">
                    <span class="overflow-hidden inline-block align-bottom pb-2"><span class="mask-word inline-block opacity-0 translate-y-[120%]">Orchestrate</span></span>
                    <span class="overflow-hidden inline-block align-bottom pb-2"><span class="mask-word inline-block opacity-0 translate-y-[120%]">the</span></span>
                    <br class="hidden md:block" />
                    <span class="text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-600 font-extralight inline-block">
                        <span class="overflow-hidden inline-block align-bottom pb-2"><span class="mask-word inline-block opacity-0 translate-y-[120%]">neural</span></span>
                        <span class="overflow-hidden inline-block align-bottom pb-2"><span class="mask-word inline-block opacity-0 translate-y-[120%]">compute</span></span>
                        <span class="overflow-hidden inline-block align-bottom pb-2"><span class="mask-word inline-block opacity-0 translate-y-[120%]">fabric.</span></span>
                    </span>
                </h1>

                <p class="mask-container mt-6 text-lg md:text-xl text-neutral-400 max-w-2xl leading-relaxed font-extralight">
                    <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">Provision</span></span>
                    <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">ultra-low</span></span>
                    <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">latency</span></span>
                    <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">inference</span></span>
                    <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">nodes</span></span>
                    <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">with</span></span>
                    <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">zero</span></span>
                    <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">configuration.</span></span>
                    <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">Enterprise-grade</span></span>
                    <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">AI</span></span>
                    <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">infrastructure</span></span>
                    <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">built</span></span>
                    <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">for</span></span>
                    <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">real-time</span></span>
                    <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">model</span></span>
                    <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">serving.</span></span>
                </p>

                <div class="reveal opacity-0 translate-y-4 transition-all duration-1000 ease-out delay-300 mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <button class="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-full text-sm font-light hover:bg-neutral-200 transition-colors group">
                        Launch Workspace
                        <iconify-icon icon="solar:transfer-horizontal-linear" width="18" class="group-hover:translate-x-0.5 transition-transform"></iconify-icon>
                    </button>
                    <button class="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-light text-white border border-white/20 hover:bg-white/5 transition-colors">
                        View Documentation
                    </button>
                </div>
            </div>
        </section>

        <!-- Features Matrix with Subtler Gradient Borders -->
        <section class="container mx-auto px-6 py-24 pb-32">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 reveal opacity-0 translate-y-4 transition-all duration-1000 ease-out delay-300">

                <!-- Feature Card 1 -->
                <div class="group relative rounded-2xl p-[1px] bg-gradient-to-br from-white/20 via-white/5 to-white/10 overflow-hidden shadow-2xl shadow-white/5">
                    <div class="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div class="relative h-full bg-[#050505] rounded-[15px] p-8 flex flex-col gap-4 z-10">
                        <div class="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white mb-2">
                            <iconify-icon icon="solar:scanner-linear" width="20"></iconify-icon>
                        </div>
                        <h3 class="mask-container text-xl font-light tracking-tight text-white">
                            <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">Homomorphic</span></span>
                            <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">Encryption</span></span>
                        </h3>
                        <p class="text-sm text-neutral-400 font-extralight leading-relaxed">Cryptographic isolation guaranteeing absolute data privacy during active model inference across edge nodes.</p>
                    </div>
                </div>

                <!-- Feature Card 2 -->
                <div class="group relative rounded-2xl p-[1px] bg-gradient-to-br from-white/20 via-white/5 to-white/10 overflow-hidden shadow-2xl shadow-white/5">
                    <div class="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div class="relative h-full bg-[#050505] rounded-[15px] p-8 flex flex-col gap-4 z-10">
                        <div class="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white mb-2">
                            <iconify-icon icon="solar:cpu-bolt-linear" width="20"></iconify-icon>
                        </div>
                        <h3 class="mask-container text-xl font-light tracking-tight text-white">
                            <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">Serverless</span></span>
                            <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">GPUs</span></span>
                        </h3>
                        <p class="text-sm text-neutral-400 font-extralight leading-relaxed">On-demand distributed compute layers. Elastic scaling powered by decentralized tensor processing units.</p>
                    </div>
                </div>

                <!-- Feature Card 3 -->
                <div class="group relative rounded-2xl p-[1px] bg-gradient-to-br from-white/20 via-white/5 to-white/10 overflow-hidden shadow-2xl shadow-white/5">
                    <div class="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div class="relative h-full bg-[#050505] rounded-[15px] p-8 flex flex-col gap-4 z-10">
                        <div class="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white mb-2">
                            <iconify-icon icon="solar:server-square-linear" width="20"></iconify-icon>
                        </div>
                        <h3 class="mask-container text-xl font-light tracking-tight text-white">
                            <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">Global</span></span>
                            <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">State</span></span>
                            <span class="overflow-hidden inline-block align-bottom pb-1"><span class="mask-word inline-block opacity-0 translate-y-[120%]">Sync</span></span>
                        </h3>
                        <p class="text-sm text-neutral-400 font-extralight leading-relaxed">Distributed vector database integration. Access and mutate embedding states with sub-millisecond precision.</p>
                    </div>
                </div>

            </div>
        </section>

    </main>

    <!-- Interactions & WebGL Implementation -->
    <script>
        // Native Reveal Animations Trigger
        setTimeout(() => {
            document.querySelectorAll('.reveal').forEach(el => {
                el.classList.remove('opacity-0', 'translate-y-4');
            });
        }, 100);

        // GSAP Masked Reveal Implementation
        gsap.registerPlugin(ScrollTrigger);
        document.querySelectorAll('.mask-container').forEach(container => {
            const words = container.querySelectorAll('.mask-word');
            gsap.to(words, {
                scrollTrigger: {
                    trigger: container,
                    start: "top 95%",
                },
                y: "0%",
                opacity: 1,
                duration: 1.1,
                stagger: 0.05,
                ease: "power4.out",
                delay: 0.1
            });
        });

        // WebGL Topography
        const canvas = document.getElementById('topo-canvas');
        const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false });

        if (gl) {
            const vsSource = \`
                attribute vec2 a_position;
                void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
            \`;

            const fsSource = \`
                precision highp float;
                uniform vec2 u_resolution;
                uniform float u_time;
                uniform float u_dpr;
                uniform float u_page_offset_y;
                uniform vec2 u_mouse;
                uniform float u_mouse_active;

                vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
                float snoise(vec2 v){
                    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
                    vec2 i  = floor(v + dot(v, C.yy) );
                    vec2 x0 = v -   i + dot(i, C.xx);
                    vec2 i1; i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                    vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
                    i = mod(i, 289.0);
                    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
                    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                    m = m*m; m = m*m;
                    vec3 x = 2.0 * fract(p * C.www) - 1.0;
                    vec3 h = abs(x) - 0.5; vec3 ox = floor(x + 0.5);
                    vec3 a0 = x - ox; m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
                    vec3 g; g.x  = a0.x  * x0.x  + h.x  * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                    return 130.0 * dot(m, g);
                }

                void main() {
                    // Continuous global document coordinates across all sections
                    vec2 pagePixel = vec2(gl_FragCoord.x, u_page_offset_y + (u_resolution.y - gl_FragCoord.y));
                    vec2 st = pagePixel / (u_resolution.x * 0.5625);

                    // Physical grid calculation (0.0 by default)
                    float gridLines = 0.0;

                    // Ultra-smooth Continuous Topographic Lines
                    float noiseScale = 1.4;
                    vec2 offset = vec2(u_time * 0.015, u_time * 0.025);
                    vec2 noisePos = st * noiseScale + offset;

                    // Interactive cursor magnetic ripple & displacement (Lando Norris style)
                    float mouseDist = length(pagePixel - u_mouse);
                    float mouseRadius = 380.0 * u_dpr;
                    float mouseInfluence = smoothstep(mouseRadius, 0.0, mouseDist) * u_mouse_active;
                    vec2 warpDir = (mouseDist > 0.01) ? normalize(pagePixel - u_mouse) : vec2(0.0);
                    vec2 distortedNoisePos = noisePos - warpDir * (mouseInfluence * 0.13);

                    float n = snoise(distortedNoisePos) * 0.5 + 0.5;
                    float numBands = 10.0;
                    float bandVal = n * numBands;

                    // Analytical screen-space gradient via finite difference (1 physical pixel offset)
                    vec2 dPos = vec2(1.0 / (u_resolution.x * 0.5625)) * noiseScale;
                    float nRight = snoise(distortedNoisePos + vec2(dPos.x, 0.0)) * 0.5 + 0.5;
                    float nUp = snoise(distortedNoisePos + vec2(0.0, dPos.y)) * 0.5 + 0.5;
                    vec2 grad = vec2(nRight - n, nUp - n) * numBands;
                    float gradLen = max(length(grad), 0.0002);

                    // True distance in physical screen pixels to nearest contour line
                    float f = fract(bandVal);
                    float lineDist = min(f, 1.0 - f);
                    float distInPixels = lineDist / gradLen;

                    // Refined hairline thickness (~1.6px) with clean antialiasing
                    float targetHalfWidth = 0.8 * max(u_dpr * 0.75, 1.0);
                    float topoLines = 1.0 - smoothstep(targetHalfWidth - 0.5, targetHalfWidth + 0.5, distInPixels);

                    vec3 paper = vec3(0.949, 0.945, 0.929);
                    // Warm stone tone (#BCBBA8) with clear visibility against light background
                    vec3 ink = vec3(0.737, 0.733, 0.659);
                    // Subtle cobalt focal accent near cursor on hover
                    vec3 activeInk = mix(ink, vec3(0.051, 0.204, 0.475), mouseInfluence * 0.38);
                    vec3 color = mix(paper, activeInk, clamp(gridLines + topoLines, 0.0, 1.0));

                    gl_FragColor = vec4(color, 1.0);
                }
            \`;

            function createShader(gl, type, source) {
                const shader = gl.createShader(type);
                gl.shaderSource(shader, source);
                gl.compileShader(shader);
                return shader;
            }

            const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
            const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
            const program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            gl.useProgram(program);

            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

            const positionLocation = gl.getAttribLocation(program, "a_position");
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

            const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
            const timeLocation = gl.getUniformLocation(program, "u_time");
            const dprLocation = gl.getUniformLocation(program, "u_dpr");
            const pageOffsetLocation = gl.getUniformLocation(program, "u_page_offset_y");
            const mouseLocation = gl.getUniformLocation(program, "u_mouse");
            const mouseActiveLocation = gl.getUniformLocation(program, "u_mouse_active");

            var currentMouse = { x: -9999.0, y: -9999.0 };
            var targetMouse = { x: -9999.0, y: -9999.0 };
            var mouseActive = 0.0;
            var targetActive = 0.0;

            function resizeCanvas() {
                const dpr = window.devicePixelRatio || 1;
                canvas.width = window.innerWidth * dpr;
                canvas.height = window.innerHeight * dpr;
                gl.viewport(0, 0, canvas.width, canvas.height);
                gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
                gl.uniform1f(dprLocation, dpr);
            }

            window.addEventListener('resize', resizeCanvas);
            resizeCanvas();

            function render(time) {
                var sfControls = window.__SF_CONTROLS || {};
                var pageOffsetY = sfControls.pageOffsetY || 0.0;
                if (pageOffsetLocation) {
                    gl.uniform1f(pageOffsetLocation, pageOffsetY);
                }

                if (sfControls.mouseX != null && sfControls.mouseY != null) {
                    targetMouse.x = sfControls.mouseX;
                    targetMouse.y = sfControls.mouseY;
                    targetActive = sfControls.mouseActive != null ? sfControls.mouseActive : 1.0;
                }

                currentMouse.x += (targetMouse.x - currentMouse.x) * 0.1;
                currentMouse.y += (targetMouse.y - currentMouse.y) * 0.1;
                mouseActive += (targetActive - mouseActive) * 0.08;

                if (mouseLocation) {
                    gl.uniform2f(mouseLocation, currentMouse.x, currentMouse.y);
                }
                if (mouseActiveLocation) {
                    gl.uniform1f(mouseActiveLocation, mouseActive);
                }

                var speed = (sfControls.speed != null) ? sfControls.speed : 0.35;
                gl.uniform1f(timeLocation, time * 0.001 * speed);
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                requestAnimationFrame(render);
            }
            requestAnimationFrame(render);
        }
    </script>
</body>
</html>`;

type TopoFieldMode = "dark" | "light";

export type TopoFieldProps = {
  /** "auto" follows the page's light/dark scheme via prefers-color-scheme. */
  mode?: TopoFieldMode | "auto";
  /** Optional custom background/paper color (e.g. #E8E6E0). Defaults to #F2F1ED in light mode. */
  paperColor?: string;
  /** Optional custom line/ink color (e.g. #E7E7DD). Defaults to #E7E7DD in light mode. */
  lineColor?: string;
  /** Whether to show the square grid lines behind the topography. Defaults to false. */
  grid?: boolean;
  /** Animation speed multiplier. */
  speed?: number;
  /** Stretches/compresses the noise field driving the contour bands. */
  length?: number;
  /** Multiplies the number of contour bands (visual density of lines). */
  density?: number;
  /** Whether mouse hover dynamically deforms the topographic lines. Defaults to true. */
  interactive?: boolean;
  opacity?: number;
  hue?: number;
  saturation?: number;
  brightness?: number;
  className?: string;
  style?: CSSProperties;
};

const LIGHT_PAPER = "#F2F1ED";

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

/** WebGL1 GLSL ES requires float literals (10.0), not ints (10). */
function glslFloat(value: number, digits = 3) {
  const fixed = Number(value).toFixed(digits);
  return fixed.includes(".") ? fixed : `${fixed}.0`;
}

function readAutomaticMode(): TopoFieldMode {
  if (typeof document === "undefined" || typeof window === "undefined")
    return "dark";
  const root = document.documentElement;
  const declared = root.dataset.scheme ?? root.dataset.theme;
  if (declared === "light" || declared === "dark") return declared;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function useAutomaticMode(enabled: boolean) {
  const [autoMode, setAutoMode] = useState<TopoFieldMode>(readAutomaticMode);

  useEffect(() => {
    if (
      !enabled ||
      typeof document === "undefined" ||
      typeof window === "undefined"
    )
      return undefined;
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setAutoMode(readAutomaticMode());
    const observer = new MutationObserver(update);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-scheme", "data-theme"],
    });
    media.addEventListener("change", update);
    update();
    return () => {
      observer.disconnect();
      media.removeEventListener("change", update);
    };
  }, [enabled]);

  return autoMode;
}

function hexToGlslVec3(hex: string, fallback = "0.906, 0.906, 0.867") {
  const clean = hex.replace("#", "").trim();
  if (clean.length === 6) {
    const r = (parseInt(clean.substring(0, 2), 16) / 255).toFixed(3);
    const g = (parseInt(clean.substring(2, 4), 16) / 255).toFixed(3);
    const b = (parseInt(clean.substring(4, 6), 16) / 255).toFixed(3);
    return `${r}, ${g}, ${b}`;
  }
  return fallback;
}

function patchTopoField(
  source: string,
  {
    length,
    density,
    mode,
    paperColor,
    lineColor,
    grid = false,
  }: {
    length: number;
    density: number;
    mode: TopoFieldMode;
    paperColor?: string;
    lineColor?: string;
    grid?: boolean;
  },
) {
  let next = source
    .replace(
      "float noiseScale = 1.4;",
      `float noiseScale = ${glslFloat(1.4 * length, 3)};`,
    )
    .replace(
      "vec2 dPos = vec2(1.0 / (u_resolution.x * 0.5625)) * noiseScale;",
      `vec2 dPos = vec2(1.0 / (u_resolution.x * 0.5625)) * ${glslFloat(1.4 * length, 3)};`,
    )
    .replace(
      "float numBands = 10.0;",
      `float numBands = ${glslFloat(10 * density, 2)};`,
    );

  if (grid) {
    next = next.replace(
      "float gridLines = 0.0;",
      `float gridSize = 48.0 * u_dpr;
                    vec2 gridSt = gl_FragCoord.xy / gridSize;
                    vec2 gridFract = fract(gridSt);
                    float lineThickness = 1.0 / gridSize;
                    float gridLines = step(1.0 - lineThickness, gridFract.x) + step(1.0 - lineThickness, gridFract.y);
                    gridLines = clamp(gridLines, 0.0, 1.0) * 0.35;`,
    );
  }

  if (mode === "dark") {
    next = next.replace(
      `vec3 paper = vec3(0.949, 0.945, 0.929);
                    // Warm stone tone (#BCBBA8) with clear visibility against light background
                    vec3 ink = vec3(0.737, 0.733, 0.659);`,
      `vec3 paper = vec3(0.0);
                    vec3 ink = vec3(1.0);`,
    );
  } else {
    if (paperColor) {
      const glslPaper = hexToGlslVec3(paperColor);
      next = next.replace(
        `vec3 paper = vec3(0.949, 0.945, 0.929);`,
        `vec3 paper = vec3(${glslPaper});`,
      );
    }
    if (lineColor) {
      const glslLine = hexToGlslVec3(lineColor);
      next = next.replace(
        `vec3 ink = vec3(0.737, 0.733, 0.659);`,
        `vec3 ink = vec3(${glslLine});`,
      );
    }
  }

  return next;
}

function buildFocusedDocument(knobs: {
  mode: TopoFieldMode;
  paperColor?: string;
  lineColor?: string;
  length: number;
  density: number;
  grid?: boolean;
}) {
  const background = knobs.paperColor || (knobs.mode === "light" ? LIGHT_PAPER : "#000000");
  const patched = patchTopoField(topoFieldSource, knobs);
  const targetJson = JSON.stringify([
    { selector: "#topo-canvas", role: "background" },
  ]).replace(/</g, "\\u003c");

  const focusStyle = `<style data-threeui-focus>
html, body { width: 100% !important; height: 100% !important; min-height: 0 !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; background: ${background} !important; }
body { position: relative !important; }
body > * { visibility: hidden !important; }
body[data-threeui-ready] > [data-threeui-role] { visibility: visible !important; }
[data-threeui-residual] { display: none !important; }
[data-threeui-role="background"] { position: fixed !important; inset: 0 !important; width: 100% !important; height: 100% !important; z-index: 0 !important; opacity: 1 !important; pointer-events: none !important; }
</style>`;

  const controlScript = `<script data-threeui-controls>
(function () {
  var controls = { speed: 1, opacity: 1 };
  window.__SF_CONTROLS = controls;
  var origin = performance.now();
  var virtual = 0;
  var last = origin;
  var performanceNow = performance.now.bind(performance);
  performance.now = function () {
    var real = performanceNow();
    virtual += (real - last) * (controls.speed || 1);
    last = real;
    return origin + virtual;
  };
  function applyVisual() {
    var opacity = controls.opacity == null ? 1 : controls.opacity;
    Array.prototype.forEach.call(document.querySelectorAll('[data-threeui-role]'), function (element) {
      element.style.opacity = String(opacity);
    });
  }
  window.addEventListener('message', function (event) {
    if (!event.data || event.data.type !== 'threeui-controls') return;
    var next = event.data.controls || {};
    Object.keys(next).forEach(function (key) { controls[key] = next[key]; });
    applyVisual();
  });
  window.__SF_APPLY_CONTROLS = applyVisual;
})();
</script>`;

  const focusScript = `<script data-threeui-focus>
(function () {
  var isolated = false;
  function isolate() {
    if (isolated) return;
    var specs = ${targetJson};
    var roots = [];
    specs.forEach(function (spec) {
      var element = document.querySelector(spec.selector);
      if (!element) return;
      element.setAttribute('data-threeui-role', spec.role);
      if (!roots.some(function (root) { return root.contains(element); })) roots.push(element);
    });
    if (!roots.length) return;
    isolated = true;
    roots.forEach(function (root) { document.body.appendChild(root); });
    Array.from(document.body.children).forEach(function (element) {
      if (roots.indexOf(element) !== -1) return;
      element.setAttribute('data-threeui-residual', '');
      element.setAttribute('aria-hidden', 'true');
      if ('inert' in element) element.inert = true;
    });
    document.body.setAttribute('data-threeui-ready', '');
    if (window.__SF_APPLY_CONTROLS) window.__SF_APPLY_CONTROLS();
    requestAnimationFrame(function () { window.dispatchEvent(new Event('resize')); });
  }
  function scheduleIsolation() { setTimeout(isolate, 100); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scheduleIsolation, { once: true });
  else scheduleIsolation();
  window.addEventListener('load', isolate, { once: true });
})();
</script>`;

  return patched
    .replace(/<head([^>]*)>/i, `<head$1>${controlScript}${focusStyle}`)
    .replace(/<\/body>/i, `${focusScript}</body>`);
}

/**
 * TopoField — an isolated, full-bleed animated WebGL background: a faint 48px grid plus
 * ultra-thin contour ("topographic") lines drawn from 2D simplex noise, drifting slowly over
 * time. Ships as a sandboxed iframe (matching the source's isolation technique) so the shader's
 * own script/canvas loop stays completely self-contained.
 */
export default function TopoField({
  mode = "light",
  paperColor,
  lineColor = "#E7E7DD",
  grid = false,
  speed = 1,
  length = 1,
  density = 1,
  interactive = true,
  opacity = 0.65,
  hue = 0,
  saturation = 1,
  brightness = 1,
  className,
  style,
}: TopoFieldProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const automaticMode = useAutomaticMode(mode === "auto");
  const resolvedMode: TopoFieldMode =
    mode === "auto" ? automaticMode : mode === "light" ? "light" : "dark";
  const background = paperColor || (resolvedMode === "light" ? LIGHT_PAPER : "#000000");

  const safeSpeed = clamp(speed, 0, 3);
  const safeLength = clamp(length, 0.35, 2.5);
  const safeDensity = clamp(density, 0.25, 2.5);
  const safeOpacity = clamp(opacity, 0.05, 1);
  const safeHue = clamp(hue, -180, 180);
  const safeSaturation = clamp(saturation, 0, 2);
  const safeBrightness = clamp(brightness, 0.35, 1.65);

  // Rebuild when baked geometry/mode knobs change. Speed/opacity stay live via postMessage + time wrap.
  const source = useMemo(
    () =>
      buildFocusedDocument({
        mode: resolvedMode,
        paperColor,
        lineColor,
        length: safeLength,
        density: safeDensity,
        grid,
      }),
    [resolvedMode, paperColor, lineColor, safeLength, safeDensity, grid],
  );

  useEffect(() => {
    const frame = iframeRef.current?.contentWindow;
    if (!frame) return;

    const sendControls = () => {
      const el = iframeRef.current;
      const rect = el?.getBoundingClientRect();
      const scrollY = typeof window !== "undefined" ? (window.scrollY || window.pageYOffset || 0) : 0;
      const dpr = typeof window !== "undefined" ? (window.devicePixelRatio || 1) : 1;
      const pageOffsetY = (rect ? (rect.top + scrollY) : 0) * dpr;

      frame.postMessage(
        {
          type: "threeui-controls",
          controls: { speed: safeSpeed, opacity: safeOpacity, pageOffsetY, mouseActive: interactive ? undefined : 0 },
        },
        "*",
      );
    };

    let lastMouse = { x: -9999, y: -9999, active: 0 };
    let rafId: number | null = null;

    const onPointerMove = (e: MouseEvent) => {
      if (!interactive) return;
      const el = iframeRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollY = typeof window !== "undefined" ? (window.scrollY || window.pageYOffset || 0) : 0;
      const dpr = typeof window !== "undefined" ? (window.devicePixelRatio || 1) : 1;
      const pageOffsetY = (rect ? (rect.top + scrollY) : 0) * dpr;

      const isInside =
        e.clientX >= rect.left - 50 &&
        e.clientX <= rect.right + 50 &&
        e.clientY >= rect.top - 50 &&
        e.clientY <= rect.bottom + 50;

      if (isInside) {
        lastMouse.x = (e.clientX - rect.left) * dpr;
        lastMouse.y = pageOffsetY + (e.clientY - rect.top) * dpr;
        lastMouse.active = 1;
      } else {
        lastMouse.active = 0;
      }

      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          rafId = null;
          frame?.postMessage(
            {
              type: "threeui-controls",
              controls: {
                mouseX: lastMouse.x,
                mouseY: lastMouse.y,
                mouseActive: lastMouse.active,
              },
            },
            "*"
          );
        });
      }
    };

    const onPointerLeave = () => {
      lastMouse.active = 0;
      frame?.postMessage(
        {
          type: "threeui-controls",
          controls: { mouseActive: 0 },
        },
        "*"
      );
    };

    let scrollRafId: number | null = null;
    const throttledSendControls = () => {
      if (scrollRafId) return;
      scrollRafId = requestAnimationFrame(() => {
        scrollRafId = null;
        sendControls();
      });
    };

    sendControls();
    window.addEventListener("resize", throttledSendControls);
    if (interactive) {
      window.addEventListener("scroll", throttledSendControls, { passive: true });
      window.addEventListener("mousemove", onPointerMove, { passive: true });
      document.addEventListener("mouseleave", onPointerLeave);
    }
    const timer1 = setTimeout(sendControls, 100);
    const timer2 = setTimeout(sendControls, 500);

    return () => {
      window.removeEventListener("resize", throttledSendControls);
      if (interactive) {
        window.removeEventListener("scroll", throttledSendControls);
        window.removeEventListener("mousemove", onPointerMove);
        document.removeEventListener("mouseleave", onPointerLeave);
      }
      if (rafId) cancelAnimationFrame(rafId);
      if (scrollRafId) cancelAnimationFrame(scrollRafId);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [safeSpeed, safeOpacity, source, interactive]);

  const filter =
    safeHue === 0 && safeSaturation === 1 && safeBrightness === 1
      ? undefined
      : `hue-rotate(${safeHue}deg) saturate(${safeSaturation}) brightness(${safeBrightness})`;

  return (
    <iframe
      ref={iframeRef}
      className={className}
      title="Topo Field"
      srcDoc={source}
      sandbox="allow-scripts"
      loading="eager"
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        border: 0,
        background,
        filter,
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}
