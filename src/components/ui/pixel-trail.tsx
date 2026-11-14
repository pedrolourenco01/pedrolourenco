"use client";
import React, { useEffect, useRef } from "react";

// Cor oficial do site: Laranja vibrante (#EE5037)
const SITE_ORANGE_RGB = "238, 80, 55";

export interface PixelCursorTrailProps {
  color?: string; // e.g. "238, 80, 55"
  gridSize?: number;
  maxAge?: number; // duração em ms antes de sumir
  maxCells?: number; // comprimento máx da serpente
  className?: string;
}

export function PixelCursorTrail({
  color = SITE_ORANGE_RGB,
  gridSize = 14,
  maxAge = 460,
  maxCells = 42,
  className = "",
}: PixelCursorTrailProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Não executa em ambientes sem pointer preciso (ex: smartphones sem cursor)
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let dpr = window.devicePixelRatio || 1;

    const handleResize = () => {
      dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });

    // Armazena as células da trilha: { col, row, time }
    interface TrailCell {
      col: number;
      row: number;
      time: number;
    }

    const cells: TrailCell[] = [];
    let lastCol: number | null = null;
    let lastRow: number | null = null;

    const handlePointerMove = (e: PointerEvent) => {
      // Ignora toques em telas touch para não interferir na rolagem
      if (e.pointerType === "touch") return;

      const col = Math.floor(e.clientX / gridSize);
      const row = Math.floor(e.clientY / gridSize);
      const now = performance.now();

      if (lastCol === null || lastRow === null) {
        lastCol = col;
        lastRow = row;
        cells.push({ col, row, time: now });
        return;
      }

      // Se não mudou de célula na grade, apenas atualiza o tempo da cabeça
      if (lastCol === col && lastRow === row) {
        if (cells.length > 0) {
          cells[cells.length - 1].time = now;
        }
        return;
      }

      // Interpolação Manhattan ortogonal: garante uma trilha contínua conectada
      // com giros exatos em 90 graus (estilo Snake / Grid Pixel da referência)
      let currCol = lastCol;
      let currRow = lastRow;

      while (currCol !== col || currRow !== row) {
        const dx = Math.abs(col - currCol);
        const dy = Math.abs(row - currRow);

        if (dx >= dy) {
          currCol += Math.sign(col - currCol);
        } else {
          currRow += Math.sign(row - currRow);
        }

        const lastCell = cells[cells.length - 1];
        if (!lastCell || lastCell.col !== currCol || lastCell.row !== currRow) {
          cells.push({ col: currCol, row: currRow, time: now });
        }
      }

      // Mantém o comprimento da cauda controlado
      while (cells.length > maxCells) {
        cells.shift();
      }

      lastCol = col;
      lastRow = row;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    // Loop de renderização com requestAnimationFrame
    const render = (now: number) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Remove células cujo tempo expirou
      while (cells.length > 0 && now - cells[0].time > maxAge) {
        cells.shift();
      }

      const total = cells.length;
      if (total > 0) {
        for (let i = 0; i < total; i++) {
          const cell = cells[i];
          const age = now - cell.time;
          const lifeRatio = Math.max(0, 1 - age / maxAge);
          const posRatio = (i + 1) / total; // 0 no final da cauda, 1 na cabeça

          const x = cell.col * gridSize;
          const y = cell.row * gridSize;

          // Cabeça: os 2 blocos mais recentes têm opacidade plena e cor vibrante sólida
          if (i >= total - 2) {
            const headAlpha = Math.min(1, lifeRatio * 1.15);
            ctx.fillStyle = `rgba(${color}, ${headAlpha})`;
          } else {
            // Corpo da serpente: tom mais claro / translúcido contínuo, idêntico à referência
            const bodyAlpha = 0.52 * lifeRatio * Math.pow(posRatio, 0.45);
            ctx.fillStyle = `rgba(${color}, ${bodyAlpha})`;
          }

          ctx.fillRect(x, y, gridSize, gridSize);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [color, gridSize, maxAge, maxCells]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`fixed inset-0 w-screen h-screen pointer-events-none z-[9999] select-none ${className}`}
    />
  );
}

export default PixelCursorTrail;
