import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";

// Register GSAP Plugins safely
if (typeof window !== "undefined") {
  gsap.registerPlugin(CustomEase);
}

export interface NavItem {
  number: string;
  label: string;
  href: string;
}

export function SterlingGateKineticNavigation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { number: "01", label: "INICIO", href: "#hero" },
    { number: "02", label: "SOBRE", href: "#about" },
    { number: "03", label: "PROJETOS", href: "#work" },
    { number: "04", label: "CONTATO", href: "#contact" },
  ];

  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Initial GSAP Setup & Master Timeline Creation
  useEffect(() => {
    if (!containerRef.current) return;

    try {
      if (!gsap.parseEase("main")) {
        CustomEase.create("main", "0.65, 0.01, 0.05, 0.99");
        gsap.defaults({ ease: "main", duration: 0.7 });
      }
    } catch (e) {
      console.warn("CustomEase failed to load, falling back to default.", e);
      gsap.defaults({ ease: "power2.out", duration: 0.7 });
    }

    const ctx = gsap.context(() => {
      const navWrap = containerRef.current!.querySelector(".nav-overlay-wrapper");
      const menu = containerRef.current!.querySelector(".menu-content");
      const overlay = containerRef.current!.querySelector(".overlay");
      const menuLinks = containerRef.current!.querySelectorAll(".menu-list-item");
      const fadeTargets = containerRef.current!.querySelectorAll("[data-menu-fade]");
      const contentWrap = containerRef.current!.querySelector(".menu-content-wrapper");
      const allLines2 = containerRef.current!.querySelectorAll(".nav-close-btn .line-2");
      const allLines1 = containerRef.current!.querySelectorAll(".nav-close-btn .line-1");

      if (navWrap) {
        (navWrap as HTMLElement).style.display = "none";
      }

      const tl = gsap.timeline({
        paused: true,
        onStart: () => {
          if (navWrap) {
            navWrap.setAttribute("data-nav", "open");
            (navWrap as HTMLElement).style.display = "block";
          }
          if ((window as any).lenis) (window as any).lenis.stop();
          document.body.style.overflow = "hidden";
        },
        onReverseComplete: () => {
          if (navWrap) {
            navWrap.setAttribute("data-nav", "closed");
            (navWrap as HTMLElement).style.display = "none";
          }
          document.body.style.overflow = "";
          if ((window as any).lenis) (window as any).lenis.start();
        },
      });

      tl.fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: "power2.out" }, 0)
        .fromTo(menu, { xPercent: 100 }, { xPercent: 0, duration: 0.48, ease: "power3.out" }, 0)
        .to(allLines2, { opacity: 0, y: -5, duration: 0.28, ease: "power2.out" }, 0.2)
        .to(allLines1, { y: 5, duration: 0.28, ease: "power2.out" }, 0.2)
        .fromTo(contentWrap, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, 0.2)
        .fromTo(
          menuLinks,
          { y: 25, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, stagger: 0.05, duration: 0.38, ease: "power3.out" },
          0.22
        );

      if (fadeTargets.length) {
        tl.fromTo(
          fadeTargets,
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, stagger: 0.04, duration: 0.3, ease: "power2.out" },
          0.25
        );
      }

      tlRef.current = tl;
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Control Timeline Play / Reverse when menu toggles
  useEffect(() => {
    if (!tlRef.current) return;

    if (isMenuOpen) {
      tlRef.current.play();
    } else {
      tlRef.current.reverse();
    }
  }, [isMenuOpen]);

  // Prevent scroll inside menu drawer when open
  useEffect(() => {
    if (!isMenuOpen || !containerRef.current) return;
    const preventScroll = (e: Event) => {
      e.preventDefault();
    };
    const menuEl = containerRef.current.querySelector(".menu-content");
    if (menuEl) {
      menuEl.addEventListener("wheel", preventScroll, { passive: false });
      menuEl.addEventListener("touchmove", preventScroll, { passive: false });
    }
    return () => {
      if (menuEl) {
        menuEl.removeEventListener("wheel", preventScroll);
        menuEl.removeEventListener("touchmove", preventScroll);
      }
    };
  }, [isMenuOpen]);

  const [isLightHeader, setIsLightHeader] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(() => {
    if (typeof window !== "undefined") {
      return (window.scrollY || window.pageYOffset || document.documentElement.scrollTop) > 35;
    }
    return false;
  });
  const [rioTime, setRioTime] = useState<string>("");

  // Live Rio de Janeiro real-time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "America/Sao_Paulo",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      };
      const formatted = new Intl.DateTimeFormat("en-US", options).format(now);
      setRioTime(`[${formatted}]`);
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

  // Header visibility: Hide navbar smoothly when scrolling down past initial threshold (> 35px)
  useIsomorphicLayoutEffect(() => {
    const handleHeaderState = () => {
      const currentScrollY = Math.max(
        0,
        window.scrollY || window.pageYOffset || document.documentElement.scrollTop
      );
      setIsHeaderHidden(currentScrollY > 35);
    };

    // Immediate check before first paint
    handleHeaderState();

    // Check after browser scroll restoration / Lenis init frames
    const rafId = requestAnimationFrame(() => {
      handleHeaderState();
      setIsReady(true);
    });

    const t1 = setTimeout(handleHeaderState, 50);
    const t2 = setTimeout(() => {
      handleHeaderState();
      setIsReady(true);
    }, 150);

    window.addEventListener("scroll", handleHeaderState, { passive: true });

    if ((window as any).lenis) {
      (window as any).lenis.on("scroll", handleHeaderState);
    }

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("scroll", handleHeaderState);
    };
  }, []);

  // Keydown Escape handling
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLinkClick = (href: string) => {
    closeMenu();
    if (href.startsWith("#")) {
      const target = document.querySelector(href);
      if (target) {
        if ((window as any).lenis) {
          (window as any).lenis.scrollTo(target, { offset: 0, duration: 1.2 });
        } else {
          target.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  // Helper to render letter-by-letter roll effect
  const renderRollText = (text: string) => {
    return text.split("").map((char, index) => (
      <span key={index} className="contact-char-mask" aria-hidden="true">
        <span className="contact-char-inner" style={{ "--contact-char-idx": index } as React.CSSProperties}>
          <span className="char-hover-roll">
            <span className="char-primary">{char === " " ? "\u00A0" : char}</span>
            <span className="char-clone" aria-hidden="true">{char === " " ? "\u00A0" : char}</span>
          </span>
        </span>
      </span>
    ));
  };

  return (
    <div ref={containerRef} className="kinetic-nav-root">
      {/* Site Header / Trigger Button */}
      <header className={`site-header-fixed ${isReady ? "is-ready" : ""} ${isMenuOpen ? "is-menu-open" : ""} ${isLightHeader ? "is-light" : ""} ${isHeaderHidden ? "is-hidden" : ""}`}>
        <div className="header-nav-container">
          {/* Brand Logo */}
          <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick("#hero"); }} className="header-brand-logo">
            <span className="brand-text">Pedro Lourenço</span>
          </a>

          {/* Location & Real-Time Clock */}
          <div className="header-info-block header-location-block">
            <span className="info-top">Rio de Janeiro, BR</span>
            <span className="info-bottom">{rioTime || "[--:--]"}</span>
          </div>

          {/* Availability Status & Email */}
          <div className="header-info-block header-contact-block">
            <span className="info-top">Disponível para Projetos</span>
            <a href="mailto:pedroworks@gmail.com" className="info-bottom info-email-link">
              pedroworks@gmail.com
            </a>
          </div>

          {/* Hamburger Menu Toggle Button */}
          <button
            type="button"
            className="nav-close-btn"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Fechar Menu" : "Abrir Menu"}
            aria-expanded={isMenuOpen}
          >
            <span className="menu-line line-1"></span>
            <span className="menu-line line-2"></span>
          </button>
        </div>
      </header>

      {/* Fullscreen/Lateral Menu Container */}
      <div data-nav="closed" className="nav-overlay-wrapper" style={{ display: "none" }}>
        {/* Backdrop Overlay with Pure Section Blur & No Shadow */}
        <div className="overlay" onClick={closeMenu}></div>

        {/* Lateral Side Menu Drawer */}
        <nav className="menu-content" data-lenis-prevent>
          <div className="menu-content-wrapper">
            {/* Drawer Top Bar matching exact navbar height and close button */}
            <div className="drawer-top-bar" data-menu-fade>
              <button
                type="button"
                className="nav-close-btn"
                onClick={closeMenu}
                aria-label="Fechar Menu"
              >
                <span className="menu-line line-1"></span>
                <span className="menu-line line-2"></span>
              </button>
            </div>

            {/* Navigation items list with numbers and full-width separator lines */}
            <ul className="menu-list">
              {navItems.map((item) => (
                <li key={item.label} className="menu-list-item">
                  <a
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleLinkClick(item.href);
                    }}
                    className="nav-link"
                    aria-label={item.label}
                  >
                    <span className="nav-link-roll">
                      <span className="roll-primary">{item.label}</span>
                      <span className="roll-secondary" aria-hidden="true">{item.label}</span>
                    </span>
                    <span className="nav-link-number">{item.number}</span>
                  </a>
                </li>
              ))}
            </ul>

            {/* Footer inside Drawer matching reference layout & our design system */}
            <div className="drawer-footer-row" data-menu-fade>
              <div className="social-icons-wrap">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-btn"
                  aria-label="X / Twitter"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-btn"
                  aria-label="Instagram"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-btn"
                  aria-label="LinkedIn"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                  </svg>
                </a>
              </div>

              <div className="drawer-copyright-text">
                © 2026 PEDRO LOURENÇO
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}

export default SterlingGateKineticNavigation;
