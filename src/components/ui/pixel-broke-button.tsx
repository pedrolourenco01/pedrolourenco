import React, { useEffect, useRef, useState } from 'react';

export interface Button03Props extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  text?: string;
  children?: React.ReactNode;
  href?: string;
  id?: string;
  className?: string;
  variant?: 'orange' | 'dark';
  style?: React.CSSProperties;
}

function extractText(node: any): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (!node) return '';
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (typeof node === 'object') {
    if (typeof node.props?.value === 'string') {
      return node.props.value.replace(/<[^>]*>?/gm, '').trim();
    }
    if (typeof node.props?.dangerouslySetInnerHTML?.__html === 'string') {
      return node.props.dangerouslySetInnerHTML.__html.replace(/<[^>]*>?/gm, '').trim();
    }
    if (node.props?.children) {
      return extractText(node.props.children);
    }
    if (typeof node.value === 'string') {
      return node.value.replace(/<[^>]*>?/gm, '').trim();
    }
  }
  return '';
}

export const Button03: React.FC<Button03Props> = ({
  text,
  children,
  href = '#',
  id,
  className = '',
  variant = 'orange',
  style,
  onClick,
  ...props
}) => {
  // Matriz de quebra de pixels nas laterais esquerda e direita
  const leftPixelIndices = [0, 0, 1, 3, 4, 0, 0, 2, 0, 0, 0, 1];
  const rightPixelIndices = [3, 0, 0, 0, 4, 0, 0, 2, 1, 3, 0, 0];

  const extracted = extractText(children);
  const initialText = text || extracted || 'Entrar em contato';

  const [activeText, setActiveText] = useState(initialText);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (text) {
      setActiveText(text);
    } else if (textRef.current) {
      const t = textRef.current.innerText?.trim();
      if (t) setActiveText(t);
    } else if (extracted) {
      setActiveText(extracted);
    }
  }, [text, children, extracted]);

  const charCount = activeText.length || 11;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (href && href.startsWith('#')) {
      e.preventDefault();
      if (href === '#contact') {
        if (typeof window !== 'undefined' && (window as any).lenis) {
          (window as any).lenis.scrollTo(document.documentElement.scrollHeight, { duration: 1.4 });
        } else {
          window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
        }
        return;
      }
      const target = document.querySelector(href);
      if (target) {
        if (typeof window !== 'undefined' && (window as any).lenis) {
          (window as any).lenis.scrollTo(target, { offset: 0, duration: 1.2 });
        } else {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <a
      href={href}
      id={id}
      onClick={handleClick}
      style={{
        '--characters': charCount,
        '--button-bg': variant === 'dark' ? '#111215' : '#EE5037',
        '--button-color': '#FFFFFF',
        ...style,
      } as React.CSSProperties}
      className={`button03 w-inline-block ${className}`}
      {...props}
    >
      <span className="button03_bg" aria-hidden="true">
        <span className="button03_bg-left">
          {leftPixelIndices.map((index, i) => (
            <span
              key={`left-${i}`}
              style={{ '--index': index } as React.CSSProperties}
              className="button03_bg-pixel"
            ></span>
          ))}
        </span>
        <span className="button03_bg-mid"></span>
        <span className="button03_bg-right">
          {rightPixelIndices.map((index, i) => (
            <span
              key={`right-${i}`}
              style={{ '--index': index } as React.CSSProperties}
              className="button03_bg-pixel"
            ></span>
          ))}
        </span>
      </span>
      <span data-text={activeText} className="button03_inner">
        <span ref={textRef} className="button03_text">
          {children || activeText}
        </span>
      </span>
    </a>
  );
};

export default Button03;
