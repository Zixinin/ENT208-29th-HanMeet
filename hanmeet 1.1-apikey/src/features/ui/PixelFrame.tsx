import React from 'react';

interface PixelFrameProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export function PixelFrame({ children, className = '', color = 'var(--pixel-border)' }: PixelFrameProps) {
  return (
    <div
      className={`relative ${className}`}
      style={{
        background: 'var(--pixel-panel)',
        border: `4px solid ${color}`,
        boxShadow: `4px 4px 0px #000, inset 0 0 0 2px rgba(255,255,255,0.05)`,
      }}
    >
      {children}
    </div>
  );
}
