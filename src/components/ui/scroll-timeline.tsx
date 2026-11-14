"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export interface Milestone {
  id: string;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  date?: string;
  tags?: string[];
}

export interface TimelineProps {
  milestones: Milestone[];
  className?: string;
}

export default function Component({ milestones, className = "" }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const bgLineRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const dotRatiosRef = useRef<number[]>([0, 0.25, 0.5, 0.75]);

  const [currentLang, setCurrentLang] = useState<"EN" | "PT">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("portfolio_lang") as "EN" | "PT") || "EN";
    }
    return "EN";
  });

  useEffect(() => {
    const handleLangChange = (e: CustomEvent) => {
      if (e.detail?.lang) {
        setCurrentLang(e.detail.lang);
      }
    };
    window.addEventListener("portfolio:language-change", handleLangChange as EventListener);
    return () => window.removeEventListener("portfolio:language-change", handleLangChange as EventListener);
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const container = containerRef.current;
    const bgLine = bgLineRef.current;
    const line = lineRef.current;
    if (!container || !bgLine || !line) return;

    const dots = dotsRef.current.filter(Boolean) as HTMLDivElement[];
    const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];
    if (dots.length < 2 || cards.length === 0) return;

    const ctx = gsap.context(() => {
      // Mede a distância real: do centro do ponto 0 até o final completo do último card
      const measureMetrics = () => {
        const firstRect = dots[0].getBoundingClientRect();
        const lastCard = cards[cards.length - 1];
        if (!lastCard) return 0;

        const lastCardRect = lastCard.getBoundingClientRect();
        const firstCenter = firstRect.top + firstRect.height / 2;
        // A linha estende-se até o final completo do último card (+ 24px de respiro)
        const endPosition = lastCardRect.bottom + 24;
        const totalDistance = Math.max(0, endPosition - firstCenter);

        if (totalDistance > 0) {
          bgLine.style.height = `${totalDistance}px`;
          line.style.height = `${totalDistance}px`;

          // A proporção de cada ponto é calculada em relação ao comprimento total da linha
          dotRatiosRef.current = dots.map((dot) => {
            const rect = dot.getBoundingClientRect();
            const center = rect.top + rect.height / 2;
            return (center - firstCenter) / totalDistance;
          });
        }
        return totalDistance;
      };

      measureMetrics();

      // Configuração inicial dos pontos e cards
      dots.forEach((dot, i) => {
        gsap.set(dot, {
          scale: i === 0 ? 1.25 : 1,
          backgroundColor: i === 0 ? "#EE5037" : "#E8E6E0",
          borderColor: i === 0 ? "#EE5037" : "#a3a3a3",
        });
      });

      cards.forEach((card, i) => {
        gsap.set(card, {
          opacity: i === 0 ? 1 : 0.35,
          y: i === 0 ? 0 : 16,
        });
        const numSpan = card.querySelector(".milestone-num");
        if (numSpan) {
          gsap.set(numSpan, { color: i === 0 ? "#EE5037" : "#a3a3a3" });
        }
      });

      // Animação mestre: do centro do primeiro ponto até a base completa do último card
      const tl = gsap.timeline({
        scrollTrigger: {
          id: "services-timeline-trigger",
          trigger: dots[0],
          endTrigger: cards[cards.length - 1],
          start: "center 55%",
          end: "bottom 55%",
          scrub: true,
          invalidateOnRefresh: true,
          onRefresh: () => {
            measureMetrics();
          },
          onUpdate: (self) => {
            const p = self.progress;
            const ratios = dotRatiosRef.current;
            const activeStates = (self as any)._activeStates || [];
            (self as any)._activeStates = activeStates;

            dots.forEach((dot, i) => {
              const targetRatio = ratios[i] ?? (i / (dots.length - 1));
              // Acende no instante exato em que a linha toca a borda do ponto
              const isActive = p >= targetRatio - 0.008;

              // Otimização crucial: só dispara animações quando o estado do ponto realmente mudar
              if (activeStates[i] === isActive) return;
              activeStates[i] = isActive;

              const card = cards[i];

              if (isActive) {
                gsap.to(dot, {
                  scale: 1.25,
                  backgroundColor: "#EE5037",
                  borderColor: "#EE5037",
                  duration: 0.15,
                  ease: "power2.out",
                  overwrite: "auto",
                });
                if (card) {
                  gsap.to(card, {
                    opacity: 1,
                    y: 0,
                    duration: 0.3,
                    ease: "power2.out",
                    overwrite: "auto",
                  });
                  const numSpan = card.querySelector(".milestone-num");
                  if (numSpan) {
                    gsap.to(numSpan, { color: "#EE5037", duration: 0.15, overwrite: "auto" });
                  }
                }
              } else {
                gsap.to(dot, {
                  scale: 1,
                  backgroundColor: "#E8E6E0",
                  borderColor: "#a3a3a3",
                  duration: 0.15,
                  ease: "power2.out",
                  overwrite: "auto",
                });
                if (card) {
                  gsap.to(card, {
                    opacity: 0.35,
                    y: 16,
                    duration: 0.3,
                    ease: "power2.out",
                    overwrite: "auto",
                  });
                  const numSpan = card.querySelector(".milestone-num");
                  if (numSpan) {
                    gsap.to(numSpan, { color: "#a3a3a3", duration: 0.15, overwrite: "auto" });
                  }
                }
              }
            });
          },
        },
      });

      tl.fromTo(
        line,
        { scaleY: 0 },
        { scaleY: 1, ease: "none" }
      );
    }, container);

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, [milestones.length]);

  return (
    <div className={`w-full max-w-5xl mx-auto px-2 md:px-4 py-1 md:py-8 font-sans ${className}`} ref={containerRef}>
      <style>{`
        .timeline-card-even {
          padding-left: 2.5rem;
          padding-right: 0.75rem;
          text-align: left;
        }
        .timeline-card-odd {
          padding-left: 2.5rem;
          padding-right: 0.75rem;
          text-align: left;
        }
        @media (min-width: 768px) {
          .timeline-card-even {
            padding-right: clamp(1.4rem, 2.5vw, 2.25rem);
            padding-left: 0;
            text-align: right;
          }
          .timeline-card-odd {
            padding-left: clamp(1.4rem, 2.5vw, 2.25rem);
            padding-right: 0;
            text-align: left;
          }
        }
      `}</style>

      <div className="relative" ref={trackRef}>
        {/* Trilha estática de fundo: Laranja translúcido conectando do ponto 0 até o final da seção */}
        <div
          ref={bgLineRef}
          className="absolute left-5 md:left-1/2 top-4 -translate-x-1/2 z-0 pointer-events-none"
          style={{
            width: "2.5px",
            backgroundColor: "rgba(238, 80, 55, 0.2)",
            height: "0px",
          }}
        />

        {/* Linha animada preenchida pelo scroll: Laranja oficial (#EE5037), desce até o final completo */}
        <div
          ref={lineRef}
          className="absolute left-5 md:left-1/2 top-4 -translate-x-1/2 z-0 pointer-events-none"
          style={{
            width: "2.5px",
            backgroundColor: "#EE5037",
            transformOrigin: "top center",
            willChange: "transform",
            boxShadow: "none",
            height: "0px",
          }}
        />

        <div className="flex flex-col gap-10 md:gap-24 relative z-10">
          {milestones.map((milestone, index) => {
            const isEven = index % 2 === 0;

            return (
              <div
                key={milestone.id}
                className={`relative flex flex-col md:flex-row ${isEven ? 'md:flex-row-reverse' : ''} items-start w-full group`}
              >
                {/* O pixel/quadradinho do marco (alinhado com o topo do título) */}
                <div
                  ref={(el) => { dotsRef.current[index] = el; }}
                  className="absolute left-5 md:left-1/2 top-2.5 w-3.5 h-3.5 border-2 -translate-x-1/2 z-20 pointer-events-none"
                  style={{
                    backgroundColor: index === 0 ? "#EE5037" : "#E8E6E0",
                    borderColor: index === 0 ? "#EE5037" : "#a3a3a3",
                    boxShadow: "none",
                  }}
                />

                {/* Espaçador Desktop para empurrar o conteúdo para a esquerda ou direita */}
                <div className="hidden md:block w-1/2" />

                {/* Card de Conteúdo com respiro generoso garantido via padding */}
                <div
                  ref={(el) => { cardsRef.current[index] = el; }}
                  className={`w-full md:w-1/2 ${isEven ? 'timeline-card-even' : 'timeline-card-odd'
                    }`}
                  style={{
                    opacity: index === 0 ? 1 : 0.35,
                    transform: index === 0 ? "translateY(0)" : "translateY(16px)",
                  }}
                >
                  <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-950 leading-tight">
                    <span
                      className="milestone-num mr-2.5 font-mono font-semibold text-xl md:text-2xl"
                      style={{ color: index === 0 ? "#EE5037" : "#a3a3a3" }}
                    >
                      {milestone.id}.
                    </span>
                    {currentLang === "EN" && milestone.titleEn ? milestone.titleEn : milestone.title}
                  </h3>

                  <p className="mt-3.5 text-base md:text-lg leading-relaxed text-neutral-700 font-normal">
                    {currentLang === "EN" && milestone.descriptionEn ? milestone.descriptionEn : milestone.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { Component as ScrollTimeline };
