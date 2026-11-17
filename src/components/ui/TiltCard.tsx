"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function TiltCard({
  children,
  className,
  onClick,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: 50, my: 50 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({
      rx: (0.5 - py) * 9,
      ry: (px - 0.5) * 9,
      mx: px * 100,
      my: py * 100,
    });
  };

  const onLeave = () => setTilt({ rx: 0, ry: 0, mx: 50, my: 50 });

  return (
    <div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
      style={{
        perspective: "800px",
        transform: `perspective(800px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
      }}
      className={cn(
        "glass-card relative overflow-hidden rounded-2xl transition-transform duration-200 ease-out",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(320px circle at ${tilt.mx}% ${tilt.my}%, rgba(224, 184, 96, 0.14), transparent 65%)`,
        }}
      />
      <div className="relative z-10" style={{ transform: "translateZ(18px)" }}>
        {children}
      </div>
    </div>
  );
}
