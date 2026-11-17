"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  disabled?: boolean;
}

export default function MagneticButton({
  children,
  href,
  onClick,
  type = "button",
  variant = "primary",
  className,
  disabled,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left - rect.width / 2) * 0.18;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.18;
    setOffset({ x, y });
  };

  const reset = () => setOffset({ x: 0, y: 0 });

  const styles = cn(
    "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold",
    variant === "primary" &&
      "bg-gold-gradient text-obsidian shadow-gold-glow hover:shadow-sapphire-glow hover:brightness-110",
    variant === "secondary" &&
      "bg-charcoal/80 text-white border border-sapphire/40 hover:border-gold hover:bg-sapphire/10",
    variant === "ghost" &&
      "text-mutedText hover:text-white hover:bg-white/5",
    disabled && "opacity-50 pointer-events-none",
    className
  );

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
      }}
      className="inline-block transition-transform duration-150 ease-out"
    >
      {href ? (
        <Link href={href} className={styles}>
          {children}
        </Link>
      ) : (
        <button
          type={type}
          onClick={onClick}
          disabled={disabled}
          className={styles}
        >
          {children}
        </button>
      )}
    </div>
  );
}
