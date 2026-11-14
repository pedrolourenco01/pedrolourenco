import React, { useEffect, useRef, useState } from "react";

interface MobileMenuItemProps {
  href: string;
  label: string;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

function MobileMenuItem({ href, label, onClick }: MobileMenuItemProps) {
  return (
    <div className="mobile-menu-item">
      <a href={href} onClick={onClick} className="mobile-item-link">
        <span className="mobile-item-text">{label}</span>
      </a>
    </div>
  );
}

export function Navbar() {
  const [currentLang, setCurrentLang] = useState<"PT" | "EN">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("portfolio_lang") as "PT" | "EN" | null;
      if (saved === "EN" || saved === "PT") return saved;
    }
    return "EN";
  });

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuAnimActive, setIsMenuAnimActive] = useState(false);
  const [isLightSection, setIsLightSection] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuBtnRef = useRef<HTMLButtonElement>(null);

  // Sync state if language changed externally
  useEffect(() => {
    const handleLangSync = (e: any) => {
      const l = e.detail?.lang;
      if (l === "EN" || l === "PT") {
        setCurrentLang(l);
      }
    };
    window.addEventListener("portfolio:language-change", handleLangSync);
    return () => window.removeEventListener("portfolio:language-change", handleLangSync);
  }, []);

  // Abertura do menu mobile: monta no DOM e desliza suavemente de cima para baixo
  const handleOpenMenu = () => {
    setIsLangOpen(false);
    setIsMenuOpen(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsMenuAnimActive(true);
      });
    });
  };

  // Fechamento / Volta do menu mobile: sobe de volta para o topo e desmonta
  const handleCloseMenu = (targetId?: string) => {
    setIsMenuAnimActive(false);

    setTimeout(() => {
      setIsMenuOpen(false);
      document.body.style.overflow = "";

      if (targetId) {
        setTimeout(() => {
          if (targetId === "#contact") {
            if ((window as any).lenis) {
              (window as any).lenis.scrollTo(document.documentElement.scrollHeight, { duration: 1.4 });
            } else {
              window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
            }
            return;
          }

          const target = document.querySelector(targetId);
          if (target) {
            if ((window as any).lenis) {
              (window as any).lenis.scrollTo(target, { offset: 0, duration: 1.2 });
            } else {
              target.scrollIntoView({ behavior: "smooth" });
            }
          }
        }, 50);
      }
    }, 650);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (langDropdownRef.current && !langDropdownRef.current.contains(target)) {
        setIsLangOpen(false);
      }
    };
    if (isLangOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isLangOpen]);

  // Close dropdown & mobile menu on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isLangOpen) setIsLangOpen(false);
        if (isMenuOpen) handleCloseMenu();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isLangOpen, isMenuOpen]);

  // Bloqueio do scroll do body durante a exibição do menu
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isMenuOpen]);

  // Language switch handler with smooth block transition
  const handleLanguageSwitch = (newLang: "PT" | "EN") => {
    setIsLangOpen(false);
    if (newLang === currentLang) return;

    const applySwitch = () => {
      setCurrentLang(newLang);
      if (typeof window !== "undefined") {
        localStorage.setItem("portfolio_lang", newLang);
        const langCode = newLang.toLowerCase();
        document.documentElement.lang = langCode === "en" ? "en" : "pt-BR";
        document.documentElement.setAttribute("data-lang", langCode);
        window.dispatchEvent(
          new CustomEvent("portfolio:language-change", { detail: { lang: newLang } })
        );
      }
    };

    if (typeof window !== "undefined" && (window as any).triggerBlockTransition) {
      (window as any).triggerBlockTransition(applySwitch);
    } else {
      applySwitch();
    }
  };

  // Smooth scroll handler with Lenis integration
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();

    if (targetId === "#contact") {
      if ((window as any).lenis) {
        (window as any).lenis.scrollTo(document.documentElement.scrollHeight, { duration: 1.4 });
      } else {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
      }
      return;
    }

    const target = document.querySelector(targetId);
    if (target) {
      if ((window as any).lenis) {
        (window as any).lenis.scrollTo(target, { offset: 0, duration: 1.2 });
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // Scroll theme observer: switches navbar colors when over light sections (#services, #about)
  // and hides the navbar completely at the bottom/footer
  useEffect(() => {
    const checkScrollState = () => {
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollY > 20);

      const work = document.getElementById("work");
      const services = document.getElementById("services");
      const about = document.getElementById("about");
      const spacer = document.getElementById("footer-curtain-spacer");
      const contact = document.getElementById("contact");

      const winH = window.innerHeight;
      const docH = document.documentElement.scrollHeight;
      const distFromBottom = docH - (scrollY + winH);

      // Detecta se o usuário chegou no final do site / footer
      let inFooter = false;
      if (spacer) {
        const spacerRect = spacer.getBoundingClientRect();
        // Quando o topo do spacer do footer entra nos 80% inferiores da tela
        if (spacerRect.top <= winH * 0.8) {
          inFooter = true;
        }
      } else if (distFromBottom <= winH * 0.8) {
        inFooter = true;
      }

      setIsFooterVisible(inFooter);

      // Detecta se a barra está sobre qualquer seção clara (#work, #services, #about)
      let light = false;
      const navCheckY = 50;

      [work, services, about].forEach((sec) => {
        if (!sec) return;
        const rect = sec.getBoundingClientRect();
        if (rect.top <= navCheckY && rect.bottom >= navCheckY) {
          light = true;
        }
      });

      setIsLightSection(light);
    };

    checkScrollState();
    window.addEventListener("scroll", checkScrollState, { passive: true });

    if ((window as any).lenis) {
      (window as any).lenis.on("scroll", checkScrollState);
    }

    return () => {
      window.removeEventListener("scroll", checkScrollState);
    };
  }, []);

  const isPt = currentLang === "PT";

  return (
    <header className={`site-navbar ${isLightSection ? "is-light" : ""} ${isScrolled ? "is-scrolled" : ""} ${isFooterVisible ? "is-footer" : ""} ${isMenuOpen ? "is-menu-open" : ""}`}>
      <div className="navbar-container">
        {/* Brand Logo (Left) */}
        <a
          href="#hero"
          onClick={(e) => handleNavClick(e, "#hero")}
          className="navbar-brand"
          aria-label="Pedro Lourenço - Início"
        >
          PEDRO LOURENÇO
        </a>

        {/* Navigation Items & Language Dropdown (Right) */}
        <nav className="navbar-nav" aria-label="Navegação principal">
          <div className="navbar-nav-group">
            {/* 1. Trabalhos / Work */}
            <a
              href="#work"
              onClick={(e) => handleNavClick(e, "#work")}
              className="navbar-link"
            >
              <span className="navbar-link-text">{isPt ? "TRABALHOS" : "WORK"}</span>
            </a>

            {/* 2. Contato / Contact */}
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, "#contact")}
              className="navbar-link"
            >
              <span className="navbar-link-text">{isPt ? "CONTATO" : "CONTACT"}</span>
            </a>

            {/* 3. Sobre / About */}
            <a
              href="#about"
              onClick={(e) => handleNavClick(e, "#about")}
              className="navbar-link"
            >
              <span className="navbar-link-text">{isPt ? "SOBRE" : "ABOUT"}</span>
            </a>

            {/* 4. Botão de Tradução (PT / EN alinhado à referência haoqi.design) */}
            <div className="header-lang-switcher" ref={langDropdownRef}>
              <button
                type="button"
                className={`lang-trigger-btn ${isLangOpen ? "is-active" : ""}`}
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsLangOpen((prev) => !prev);
                }}
                aria-expanded={isLangOpen}
                aria-label="Selecionar idioma"
              >
                <span className="lang-current">{currentLang}</span>
                <svg
                  className={`lang-chevron ${isLangOpen ? "is-open" : ""}`}
                  width="7"
                  height="5"
                  viewBox="0 0 7 5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 1L3.5 3.5L6 1" />
                </svg>
              </button>

              {isLangOpen && (
                <div className="lang-dropdown-menu">
                  {(["EN", "PT"] as const)
                    .filter((lang) => lang !== currentLang)
                    .map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        className="lang-option-btn"
                        onClick={() => handleLanguageSwitch(lang)}
                      >
                        {lang}
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* 5. Botão de Disparo do Menu Mobile (Apenas ícone, sem texto "MENU") */}
            <button
              type="button"
              ref={mobileMenuBtnRef}
              className="mobile-menu-trigger"
              onClick={handleOpenMenu}
              aria-expanded={isMenuOpen}
              aria-label={isPt ? "Abrir menu" : "Open menu"}
            >
              <svg
                width="20"
                height="12"
                viewBox="0 0 20 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <line x1="0" y1="2" x2="20" y2="2" />
                <line x1="0" y1="10" x2="20" y2="10" />
              </svg>
            </button>
          </div>
        </nav>
      </div>

      {/* 6. Menu Mobile Fullscreen (Desliza suavemente de cima para baixo) */}
      {isMenuOpen && (
        <div
          className={`mobile-fullscreen-menu ${isMenuAnimActive ? "is-active" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label="Menu principal"
        >
          {/* Top Bar idêntica à referência: LOGO à esquerda e ✕ à direita */}
          <div className="mobile-fullscreen-header">
            <a
              href="#hero"
              onClick={(e) => {
                e.preventDefault();
                handleCloseMenu("#hero");
              }}
              className="mobile-fullscreen-brand"
            >
              PEDRO LOURENÇO
            </a>

            <button
              type="button"
              className="mobile-fullscreen-close"
              onClick={() => handleCloseMenu()}
              aria-label={isPt ? "Fechar menu" : "Close menu"}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <line x1="3" y1="3" x2="19" y2="19" />
                <line x1="19" y1="3" x2="3" y2="19" />
              </svg>
            </button>
          </div>

          {/* Links verticais com animação idêntica aos cards de work */}
          <div className="mobile-fullscreen-body">
            <MobileMenuItem
              href="#hero"
              label={isPt ? "INÍCIO" : "HOME"}
              onClick={(e) => {
                e.preventDefault();
                handleCloseMenu("#hero");
              }}
            />
            <MobileMenuItem
              href="#work"
              label={isPt ? "TRABALHOS" : "WORK"}
              onClick={(e) => {
                e.preventDefault();
                handleCloseMenu("#work");
              }}
            />
            <MobileMenuItem
              href="#contact"
              label={isPt ? "CONTATO" : "CONTACT"}
              onClick={(e) => {
                e.preventDefault();
                handleCloseMenu("#contact");
              }}
            />
            <MobileMenuItem
              href="#about"
              label={isPt ? "SOBRE" : "ABOUT"}
              onClick={(e) => {
                e.preventDefault();
                handleCloseMenu("#about");
              }}
            />
          </div>
        </div>
      )}

      <style>{`
        .site-navbar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          background: transparent;
          color: #FFFFFF;
          font-family: 'JetBrains Mono', 'Space Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          transition: color 0.3s cubic-bezier(0.25, 1, 0.5, 1), background-color 0.3s cubic-bezier(0.25, 1, 0.5, 1), backdrop-filter 0.3s ease, opacity 0.4s cubic-bezier(0.25, 1, 0.5, 1), transform 0.45s cubic-bezier(0.25, 1, 0.5, 1);
          pointer-events: none;
          will-change: transform, opacity;
        }

        .site-navbar.is-footer {
          opacity: 0 !important;
          transform: translateY(-100%) !important;
          pointer-events: none !important;
        }

        .site-navbar.is-menu-open .navbar-container {
          opacity: 0 !important;
          pointer-events: none !important;
        }

        .site-navbar.is-scrolled,
        .site-navbar.is-light.is-scrolled {
          background: transparent !important;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .site-navbar.is-light {
          color: #111215 !important;
        }

        .navbar-container {
          width: 100%;
          max-width: 1920px;
          margin: 0 auto;
          padding: clamp(2rem, 3.8vh, 3.2rem) clamp(1.5rem, 4vw, 4.5rem) clamp(1.2rem, 2vh, 1.8rem);
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-sizing: border-box;
          animation: navbarFadeIn 0.8s cubic-bezier(0.25, 1, 0.5, 1) both;
        }

        @keyframes navbarFadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Brand Logo (Left) */
        .navbar-brand {
          pointer-events: auto;
          font-family: 'JetBrains Mono', 'Space Mono', ui-monospace, monospace;
          font-weight: 700;
          font-size: clamp(0.92rem, 1.08vw, 1.08rem);
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: inherit;
          text-decoration: none;
          padding: 0.4rem 0.6rem;
          margin: -0.4rem -0.6rem;
          position: relative;
          transition: color 0.2s ease, opacity 0.2s ease;
          display: inline-flex;
          align-items: center;
        }

        .navbar-brand::before {
          content: '';
          position: absolute;
          inset: 0;
          border: 1.5px dotted transparent;
          pointer-events: none;
          transition: border-color 0.2s ease;
        }

        .navbar-brand:hover {
          opacity: 0.85;
        }

        .navbar-brand:hover::before {
          border-color: currentColor;
        }

        /* Navigation Group (Right) - Layout idêntico ao haoqi.design */
        .navbar-nav {
          pointer-events: auto;
          display: flex;
          justify-content: flex-end;
          flex: 1;
          max-width: 600px;
        }

        .navbar-nav-group {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: clamp(1rem, 2.5vw, 3rem);
        }

        .navbar-link {
          position: relative;
          font-family: 'JetBrains Mono', 'Space Mono', ui-monospace, monospace;
          font-weight: 600;
          font-size: clamp(0.88rem, 1.02vw, 1.02rem);
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: inherit;
          text-decoration: none;
          padding: 0.4rem 0.65rem;
          margin: -0.4rem 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.2s ease;
          white-space: nowrap;
        }

        .navbar-link::before {
          content: '';
          position: absolute;
          inset: 0;
          border: 1.5px dotted transparent;
          pointer-events: none;
          transition: border-color 0.2s ease;
        }

        .navbar-link:hover {
          opacity: 0.85;
        }

        .navbar-link:hover::before {
          border-color: currentColor;
        }

        /* Language Switcher Dropdown (Estilo editorial haoqi.design) */
        .header-lang-switcher {
          position: relative;
          display: inline-flex;
          flex-direction: column;
          align-items: flex-start;
          margin: -0.4rem 0;
        }

        .lang-trigger-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: none;
          padding: 0.4rem 0.65rem;
          font-family: 'JetBrains Mono', 'Space Mono', ui-monospace, monospace;
          font-size: clamp(0.88rem, 1.02vw, 1.02rem);
          font-weight: 600;
          letter-spacing: 0.04em;
          color: inherit;
          cursor: pointer;
          transition: opacity 0.2s ease;
          line-height: 1;
          white-space: nowrap;
        }

        .lang-trigger-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          border: 1.5px dotted transparent;
          pointer-events: none;
          transition: border-color 0.2s ease;
        }

        .lang-trigger-btn:hover,
        .lang-trigger-btn.is-active {
          opacity: 0.85;
        }

        .lang-trigger-btn:hover::before,
        .lang-trigger-btn.is-active::before {
          border-color: currentColor;
        }

        .lang-current {
          color: inherit;
          font-weight: 600;
        }

        .lang-chevron {
          width: 8px;
          height: 6px;
          display: inline-block;
          color: inherit;
          opacity: 0.85;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .lang-chevron.is-open {
          transform: rotate(180deg);
        }

        /* Dropdown: EN fica exatamente embaixo de PT */
        .lang-dropdown-menu {
          position: absolute;
          top: calc(100% - 2px);
          left: 0;
          right: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          z-index: 1002;
          animation: langFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes langFadeIn {
          from {
            opacity: 0;
            transform: translateY(-2px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .lang-option-btn {
          position: relative;
          background: transparent;
          border: none;
          padding: 0.35rem 0.65rem;
          color: inherit;
          opacity: 0.75;
          font-family: 'JetBrains Mono', 'Space Mono', ui-monospace, monospace;
          font-size: clamp(0.88rem, 1.02vw, 1.02rem);
          font-weight: 600;
          letter-spacing: 0.04em;
          cursor: pointer;
          line-height: 1;
          text-align: left;
          transition: opacity 0.2s ease;
          white-space: nowrap;
        }

        .lang-option-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          border: 1.5px dotted transparent;
          pointer-events: none;
          transition: border-color 0.2s ease;
        }

        .lang-option-btn:hover {
          opacity: 1;
        }

        .lang-option-btn:hover::before {
          border-color: currentColor;
        }

        /* Mobile Menu Trigger & Fullscreen Overlay - ocultos por padrão no desktop */
        .mobile-menu-trigger {
          display: none;
        }

        .mobile-fullscreen-menu {
          display: none;
        }

        /* Responsive adjustments for mobile: apenas nome, botão de idioma e popup fullscreen */
        @media (max-width: 900px) {
          .navbar-container {
            padding: 1.5rem 1.25rem 1rem 1.25rem;
            position: relative;
          }

          .navbar-brand {
            font-size: 0.95rem;
            letter-spacing: 0.04em;
          }

          .navbar-nav {
            max-width: none;
            width: auto;
            flex: 0 0 auto;
          }

          .navbar-nav-group {
            width: auto;
            justify-content: flex-end;
            gap: 0.75rem;
          }

          /* No mobile, oculta os links inline mantendo apenas o nome, o botão de idioma e o gatilho */
          .navbar-link {
            display: none !important;
          }

          .lang-trigger-btn,
          .lang-option-btn {
            font-size: 0.92rem;
            padding: 0.35rem 0.5rem;
          }

          .lang-dropdown-menu {
            left: 0;
            right: 0;
            width: 100%;
          }

          /* Botão disparador do menu no mobile (apenas ícone, sem texto "MENU") */
          .mobile-menu-trigger {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: transparent;
            border: none;
            padding: 0.35rem 0.5rem;
            margin: -0.35rem 0;
            color: inherit;
            cursor: pointer;
            line-height: 1;
            pointer-events: auto;
            -webkit-tap-highlight-color: transparent;
          }

          /* Remove efeitos de hover/active em botões e links no mobile */
          .mobile-menu-trigger:hover,
          .mobile-menu-trigger:active,
          .navbar-brand:hover,
          .navbar-brand:active,
          .lang-trigger-btn:hover,
          .lang-trigger-btn:active,
          .lang-option-btn:hover,
          .lang-option-btn:active {
            opacity: 1 !important;
            transform: none !important;
          }

          .navbar-brand::before,
          .lang-trigger-btn::before,
          .lang-option-btn::before,
          .mobile-menu-trigger::before {
            display: none !important;
          }

          /* Menu Mobile Fullscreen (Desliza suavemente de cima para baixo de forma lenta e sutil) */
          .mobile-fullscreen-menu {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            height: 100dvh;
            background-color: #000000;
            color: #FFFFFF;
            z-index: 9999999;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 0;
            margin: 0;
            box-sizing: border-box;
            overflow: hidden;
            pointer-events: auto;
            transform: translateY(-100%);
            transition: transform 0.75s cubic-bezier(0.25, 1, 0.35, 1);
            will-change: transform;
          }

          .mobile-fullscreen-menu.is-active {
            transform: translateY(0) !important;
          }

          .mobile-fullscreen-header {
            position: relative;
            z-index: 2;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1.5rem 1.25rem 1rem 1.25rem;
            width: 100%;
            box-sizing: border-box;
            opacity: 0;
            transform: translateY(-10px);
            transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.25, 1, 0.35, 1);
            will-change: transform, opacity;
          }

          .mobile-fullscreen-menu.is-active .mobile-fullscreen-header {
            opacity: 1 !important;
            transform: translateY(0) !important;
            transition-delay: 0.2s;
          }

          .mobile-fullscreen-brand {
            font-family: 'JetBrains Mono', 'Space Mono', ui-monospace, monospace;
            font-weight: 700;
            font-size: 0.95rem;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: #FFFFFF;
            text-decoration: none;
            padding: 0.4rem 0.6rem;
            margin: -0.4rem -0.6rem;
            position: relative;
          }

          .mobile-fullscreen-close {
            background: transparent;
            border: none;
            color: #FFFFFF;
            padding: 0.4rem;
            margin: -0.4rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
          }

          .mobile-fullscreen-close:hover,
          .mobile-fullscreen-close:active,
          .mobile-fullscreen-brand:hover,
          .mobile-fullscreen-brand:active {
            opacity: 1 !important;
            transform: none !important;
          }

          .mobile-fullscreen-body {
            position: relative;
            z-index: 2;
            display: flex;
            flex-direction: column;
            justify-content: center;
            flex: 1;
            padding: 0 clamp(1.25rem, 6vw, 3rem);
            padding-bottom: 14vh;
            gap: clamp(1.1rem, 2.8vh, 2rem);
            box-sizing: border-box;
          }

          .mobile-menu-item {
            position: relative;
            display: block;
            width: fit-content;
            opacity: 0;
            pointer-events: none;
            transform: translateY(16px);
            transition: opacity 0.55s ease, transform 0.55s cubic-bezier(0.25, 1, 0.35, 1);
            will-change: transform, opacity;
          }

          .mobile-fullscreen-menu.is-active .mobile-menu-item {
            opacity: 1 !important;
            pointer-events: auto !important;
            transform: translateY(0) !important;
          }

          .mobile-fullscreen-menu.is-active .mobile-menu-item:nth-child(1) { transition-delay: 0.26s; }
          .mobile-fullscreen-menu.is-active .mobile-menu-item:nth-child(2) { transition-delay: 0.34s; }
          .mobile-fullscreen-menu.is-active .mobile-menu-item:nth-child(3) { transition-delay: 0.42s; }
          .mobile-fullscreen-menu.is-active .mobile-menu-item:nth-child(4) { transition-delay: 0.50s; }

          .mobile-item-link {
            position: relative;
            display: inline-block;
            font-family: 'JetBrains Mono', 'Space Mono', ui-monospace, monospace;
            font-weight: 700;
            font-size: clamp(2.4rem, 11vw, 4.2rem);
            line-height: 1.15;
            letter-spacing: 0.02em;
            text-transform: uppercase;
            color: #FFFFFF;
            text-decoration: none;
            padding: 0.25rem 0.5rem;
            margin: -0.25rem -0.5rem;
            white-space: nowrap;
            -webkit-tap-highlight-color: transparent;
          }

          .mobile-item-link:hover,
          .mobile-item-link:active {
            opacity: 1 !important;
            transform: none !important;
          }
        }

        /* Garante remoção completa de hover nos links e botões em mobile e dispositivos touch */
        @media (max-width: 900px), (hover: none), (pointer: coarse) {
          .navbar-link,
          .navbar-brand,
          .lang-trigger-btn,
          .lang-option-btn,
          .mobile-menu-trigger,
          .mobile-fullscreen-close,
          .mobile-fullscreen-brand,
          .mobile-item-link {
            -webkit-tap-highlight-color: transparent;
          }

          .navbar-link:hover,
          .navbar-link:active,
          .navbar-brand:hover,
          .navbar-brand:active,
          .lang-trigger-btn:hover,
          .lang-trigger-btn:active,
          .lang-option-btn:hover,
          .lang-option-btn:active,
          .mobile-menu-trigger:hover,
          .mobile-menu-trigger:active,
          .mobile-fullscreen-close:hover,
          .mobile-fullscreen-close:active,
          .mobile-fullscreen-brand:hover,
          .mobile-fullscreen-brand:active,
          .mobile-item-link:hover,
          .mobile-item-link:active {
            opacity: 1 !important;
            transform: none !important;
            color: inherit !important;
          }

          .navbar-link::before,
          .navbar-link:hover::before,
          .navbar-link:active::before,
          .navbar-brand::before,
          .navbar-brand:hover::before,
          .navbar-brand:active::before,
          .lang-trigger-btn::before,
          .lang-trigger-btn:hover::before,
          .lang-trigger-btn.is-active::before,
          .lang-option-btn::before,
          .lang-option-btn:hover::before,
          .mobile-menu-trigger::before {
            display: none !important;
            border-color: transparent !important;
          }
        }

        @media (max-width: 420px) {
          .navbar-container {
            padding: 1.25rem 1rem 0.85rem 1rem;
          }

          .navbar-brand {
            font-size: 0.88rem;
          }

          .navbar-nav-group {
            gap: 0.5rem;
          }

          .lang-trigger-btn,
          .lang-option-btn,
          .mobile-menu-trigger {
            font-size: 0.84rem;
            padding: 0.3rem 0.4rem;
          }

          .mobile-fullscreen-header {
            padding: 1.25rem 1rem 0.85rem 1rem;
          }

          .mobile-fullscreen-brand {
            font-size: 0.88rem;
            color: #FFFFFF;
          }

          .mobile-fullscreen-body {
            padding: 0 1.2rem;
            padding-bottom: 12vh;
            gap: 1.15rem;
          }

          .mobile-item-link {
            font-size: clamp(2.1rem, 10.5vw, 2.9rem);
            color: #FFFFFF;
          }
        }
      `}</style>
    </header>
  );
}

export default Navbar;
