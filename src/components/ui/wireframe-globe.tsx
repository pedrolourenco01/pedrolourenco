import React, { useEffect, useRef } from 'react';

interface WireframeGlobeProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

// Proporção geométrica elíptica idêntica à referência da marca
const ASPECT_RATIO = 92 / 52; // ~1.7692
const TOTAL_MERIDIANS = 12;
const ROTATION_DURATION_MS = 12000;
const ROTATION_SPEED = (2 * Math.PI) / ROTATION_DURATION_MS;

export function WireframeGlobe({ className = '' }: WireframeGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let lastTime = performance.now();
    let autoRotation = 0;
    let scrollProgress = 0;
    let isVisible = true;

    // Redimensionamento de alta definição (High DPI / Retina 1:1)
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const rect = canvas.getBoundingClientRect();
      const width = rect.width || window.innerWidth;
      const height = rect.height || window.innerHeight;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        resizeCanvas();
      });
      resizeObserver.observe(containerRef.current);
    }

    const render = (now: number) => {
      if (!isVisible) {
        animFrameId = 0;
        return;
      }

      const dt = Math.min(now - lastTime, 100);
      lastTime = now;

      // Progresso do scroll (0.0 a 1.0) vindo do ScrollTrigger quando atinge o elemento
      const p = Math.max(0, Math.min(1, scrollProgress));

      // Em repouso (p === 0), rotação contínua 3D suave por tempo.
      // Durante o zoom (p > 0), a rotação é conduzida pelo scroll (tanto na ida quanto na volta).
      if (p === 0) {
        autoRotation -= ROTATION_SPEED * dt;
        if (autoRotation < -2 * Math.PI) {
          autoRotation += 2 * Math.PI;
        }
      }

      // Rotação com o scroll durante o zoom (~2 rotações completas durante o percurso)
      const SCROLL_ROTATION_FACTOR = 18.0;
      const scrollRotation = p > 0 ? -(p * SCROLL_ROTATION_FACTOR) : 0;
      const totalRotation = autoRotation + scrollRotation;

      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      // Dimensões base em repouso (5rem x 3rem)
      const baseRx = 38;
      const baseRy = baseRx / ASPECT_RATIO; // ~21.48px
      const baseStrokeWidth = 2.8; // Traço sólido, marcante e definido (nunca fino)

      let scale = 1.0;
      let globeAlpha = 1.0;
      let wireframeStroke = baseStrokeWidth;
      let equatorStroke = baseStrokeWidth;

      // Zoom contínuo e encorpado até preencher a tela em branco puro (mantendo a mesma velocidade física)
      const ZOOM_END = 0.70; // Ponto onde o zoom atinge o ápice e o fundo já é 100% branco sólido
      const FADE_END = 0.82; // Ponto onde as linhas do globo se dissolvem suavemente na tela branca

      const MAX_ZOOM_SCALE = 720;

      if (p <= ZOOM_END) {
        const norm = p / ZOOM_END;
        const ease = Math.pow(norm, 2.7);

        scale = 1 + ease * MAX_ZOOM_SCALE;
        // As linhas do aramado se mantêm nítidas durante o zoom
        wireframeStroke = Math.max(baseStrokeWidth, baseStrokeWidth * Math.pow(scale, 0.65));

        // Em repouso e no início do zoom (norm <= 0.3), a linha do meio tem a exata mesma espessura das outras linhas.
        // Conforme a câmera se aproxima do centro (norm > 0.3), a linha central ganha espessura progressiva,
        // gerando a sensação cinematográfica de mergulhar e entrar diretamente dentro da linha branca.
        if (norm > 0.3) {
          const diveProgress = (norm - 0.3) / 0.7;
          const diveEase = Math.pow(diveProgress, 2.5);
          equatorStroke = Math.max(wireframeStroke, wireframeStroke + diveEase * (h * 1.5));
        } else {
          equatorStroke = wireframeStroke;
        }
        globeAlpha = 1.0;
      } else if (p <= FADE_END) {
        // A tela já está 100% coberta pela linha branca central (ao entrar em About)
        scale = 1 + MAX_ZOOM_SCALE;
        wireframeStroke = Math.max(baseStrokeWidth, baseStrokeWidth * Math.pow(scale, 0.65));
        equatorStroke = h * 1.5;
        // Desvanecimento linear e contínuo de 1.0 a 0.0 sem saltos ou piscadas
        const fadeNorm = (p - ZOOM_END) / (FADE_END - ZOOM_END);
        globeAlpha = Math.max(0, 1 - fadeNorm);
      } else {
        scale = 1 + MAX_ZOOM_SCALE;
        wireframeStroke = Math.max(baseStrokeWidth, baseStrokeWidth * Math.pow(scale, 0.65));
        equatorStroke = h * 1.5;
        globeAlpha = 0;
      }

      // Renderização do globo com traço branco sólido (#FFFFFF) nítido e elegante
      if (globeAlpha > 0.005) {
        const rx = baseRx * scale;
        const ry = baseRy * scale;
        const norm = Math.min(1, p / ZOOM_END);
        const lineFade = norm > 0.65 ? Math.max(0, 1 - (norm - 0.65) / 0.25) : 1.0;

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // 1. Linhas internas recortadas pela elipse exterior do globo
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.clip();

        // 2. Paralelos de latitude
        // Equador central: A linha do meio que, com o mega zoom, preenche a tela toda de branco
        ctx.globalAlpha = globeAlpha;
        ctx.lineWidth = equatorStroke;
        ctx.beginPath();
        ctx.moveTo(cx - rx, cy);
        ctx.lineTo(cx + rx, cy);
        ctx.stroke();

        // Linhas de detalhe (meridianos e paralelas) que desvanecem suavemente no mergulho final
        if (lineFade > 0.01) {
          // Paralelo intermediário
          ctx.globalAlpha = globeAlpha * lineFade;
          ctx.lineWidth = wireframeStroke;
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry * (24 / 52), 0, 0, Math.PI * 2);
          ctx.stroke();

          // 3. Meridianos de longitude em rotação 3D
          for (let i = 0; i < TOTAL_MERIDIANS; i++) {
            const angle = totalRotation + (i * 2 * Math.PI) / TOTAL_MERIDIANS;
            const cosAngle = Math.cos(angle);
            const sinAngle = Math.sin(angle);

            // Oculta hemisfério traseiro
            if (cosAngle < 0) continue;

            const meridianRx = rx * Math.abs(sinAngle);
            const edgeFade = Math.min(1, Math.max(0, cosAngle * 8));
            ctx.globalAlpha = edgeFade * globeAlpha * lineFade;

            ctx.beginPath();
            if (meridianRx < 0.5) {
              ctx.moveTo(cx, cy - ry);
              ctx.lineTo(cx, cy + ry);
            } else {
              ctx.ellipse(cx, cy, meridianRx, ry, 0, -Math.PI / 2, Math.PI / 2, sinAngle < 0);
            }
            ctx.stroke();
          }
        }

        ctx.restore(); // Remove o recorte

        // 4. Anel elíptico exterior (com desvanecimento suave no mergulho)
        if (lineFade > 0.01) {
          ctx.globalAlpha = globeAlpha * lineFade;
          ctx.lineWidth = wireframeStroke;
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      ctx.restore();
      animFrameId = requestAnimationFrame(render);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animFrameId) {
          lastTime = performance.now();
          animFrameId = requestAnimationFrame(render);
        }
      },
      { threshold: 0.01 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    animFrameId = requestAnimationFrame(render);

    (window as any).setGlobeScrollProgress = (progress: number) => {
      scrollProgress = progress;
    };

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      observer.disconnect();
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', resizeCanvas);
      delete (window as any).setGlobeScrollProgress;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}

export default WireframeGlobe;
