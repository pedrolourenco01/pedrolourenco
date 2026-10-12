import React, { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RippleState {
  x: number;
  y: number;
  size: number;
  key: number;
  isLeaving?: boolean;
}

export interface RippleButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  className?: string;
  rippleColor?: string;
  href?: string;
  type?: "button" | "submit" | "reset";
}

export function RippleButton({
  children,
  className = "",
  rippleColor = "#111215",
  href,
  style,
  ...props
}: RippleButtonProps) {
  const buttonRef = useRef<any>(null);
  const [ripple, setRipple] = useState<RippleState | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const createRipple = useCallback((event: React.MouseEvent<any>) => {
    if (isHovered || !buttonRef.current) return;
    setIsHovered(true);

    const button = buttonRef.current;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 3.2;
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setRipple({ x, y, size, key: Date.now() });
  }, [isHovered]);

  const removeRipple = useCallback((event: React.MouseEvent<any>) => {
    if (event.target !== event.currentTarget) return;
    setIsHovered(false);
    
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 3.2;
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setRipple({ x, y, size, key: Date.now(), isLeaving: true });
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent<any>) => {
    if (!buttonRef.current || !isHovered || !ripple) return;

    const button = buttonRef.current;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setRipple(prev => (prev ? { ...prev, x, y } : null));
  }, [isHovered, ripple]);

  const sharedStyle: React.CSSProperties = {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: isHovered ? rippleColor : "#ffffff",
    border: isHovered ? "1px solid #ffffff" : "none",
    outline: "none",
    borderRadius: "8px",
    padding: "14px 34px",
    fontSize: "0.98rem",
    fontWeight: 600,
    fontFamily: "'Rethink Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    color: isHovered ? "#ffffff" : "#111215",
    cursor: "pointer",
    textDecoration: "none",
    boxShadow: "none",
    transition: "background-color 0.35s ease, color 0.35s ease, transform 0.25s ease",
    transform: isHovered ? "translateY(-2px)" : "none",
    ...style,
    ...(isHovered ? { border: "1px solid #ffffff" } : {}),
  };

  const sharedProps = {
    ref: buttonRef,
    className: `relative flex items-center justify-center overflow-hidden rounded-lg px-8 py-3.5 text-base font-semibold ${className}`,
    style: sharedStyle,
    onMouseEnter: (e: React.MouseEvent<any>) => {
      if (e.target === e.currentTarget) createRipple(e);
    },
    onMouseLeave: (e: React.MouseEvent<any>) => {
      if (e.target === e.currentTarget) removeRipple(e);
    },
    onMouseMove: handleMouseMove,
    ...props,
  };

  const content = (
    <>
      <span
        className="relative z-[2]"
        style={{
          position: "relative",
          zIndex: 2,
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {children}
      </span>
      
      <AnimatePresence>
        {ripple && (
          <motion.span
            key={ripple.key}
            className="absolute rounded-full bg-black pointer-events-none z-[1]"
            style={{
              position: "absolute",
              borderRadius: "50%",
              backgroundColor: rippleColor,
              pointerEvents: "none",
              zIndex: 1,
              width: ripple.size,
              height: ripple.size,
              left: ripple.x,
              top: ripple.y,
              x: '-50%',
              y: '-50%',
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ 
              scale: ripple.isLeaving ? 0 : 1,
              x: '-50%',
              y: '-50%',
            }}
            exit={{ scale: 0, opacity: 1 }}
            transition={{ 
              duration: 0.6, 
              ease: "easeOut",
            }}
            onAnimationComplete={() => {
              if (ripple.isLeaving) {
                setRipple(null);
              }
            }}
          />
        )}
      </AnimatePresence>
    </>
  );

  if (href) {
    return (
      <a href={href} {...(sharedProps as any)}>
        {content}
      </a>
    );
  }

  return (
    <button {...(sharedProps as any)}>
      {content}
    </button>
  );
}

// Demo Component
export function Component() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white">
      <div className="flex flex-col gap-6 items-center">
        <RippleButton onClick={() => alert('Button clicked!')}>
          Click Me
        </RippleButton>
      </div>
    </div>
  );
}

export default RippleButton;
