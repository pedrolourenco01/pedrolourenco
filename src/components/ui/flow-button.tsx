'use client';

import React from 'react';

export interface FlowButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  text?: string;
  children?: React.ReactNode;
  href?: string;
  className?: string;
  id?: string;
  rippleColor?: string;
  type?: "button" | "submit" | "reset";
}

export function FlowButton({
  text,
  children,
  href,
  className = "",
  id,
  rippleColor = "#C83D27",
  style,
  ...props
}: FlowButtonProps) {
  const labelText = children || text || "Entrar em contato";
  const Component = href ? 'a' : 'button';

  return (
    <Component
      href={href}
      id={id}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        backgroundColor: "#EE5037",
        border: "none !important",
        outline: "none !important",
        boxShadow: "none !important",
        borderRadius: "8px",
        padding: "13px 32px",
        whiteSpace: "nowrap",
        fontFamily: "'Rethink Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize: "0.95rem",
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: "0.01em",
        color: "#ffffff",
        cursor: "pointer",
        textDecoration: "none",
        userSelect: "none",
        ...style,
      }}
      className={`flow-button-root group active:scale-[0.97] ${className}`}
      {...(props as any)}
    >
      {/* Primary default static layer: Base Orange background (#EE5037) + White text (#ffffff) */}
      <div className="flow-btn-static flex items-center justify-center w-full h-full text-white font-semibold transition-transform duration-500 ease-in-out group-hover:-translate-y-[150%]">
        <span>{labelText}</span>
      </div>

      {/* Skew slide-up hover layer: Darker Orange background (#C83D27) + White text (#ffffff) */}
      <div className="flow-btn-hover absolute inset-0 flex items-center justify-center w-full h-full translate-y-[100%] text-white transition-transform duration-500 ease-in-out group-hover:translate-y-0">
        <span
          className="flow-btn-skew absolute -inset-4 w-[150%] h-[200%] translate-y-full skew-y-12 transition-transform duration-500 ease-in-out group-hover:translate-y-0"
          style={{ backgroundColor: rippleColor }}
        ></span>
        <span className="relative z-10 flex items-center justify-center text-white font-semibold">
          <span>{labelText}</span>
        </span>
      </div>
    </Component>
  );
}

export default FlowButton;
