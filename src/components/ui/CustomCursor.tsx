"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (isTouch || reduced) return;
    setEnabled(true);

    let mx = -100;
    let my = -100;
    let rx = -100;
    let ry = -100;
    let expanded = false;
    let rafId = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      const target = e.target as HTMLElement | null;
      expanded = Boolean(
        target?.closest("a, button, [role='button'], .glass-card")
      );
    };

    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mx - 3}px, ${my - 3}px, 0)`;
      }
      if (ringRef.current) {
        const scale = expanded ? 1.75 : 1;
        ringRef.current.style.transform = `translate3d(${rx - 16}px, ${ry - 16}px, 0) scale(${scale})`;
        ringRef.current.style.borderColor = expanded
          ? "rgba(224, 184, 96, 0.85)"
          : "rgba(79, 116, 232, 0.55)";
      }
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-gold pointer-events-none z-[95]"
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-sapphire/60 pointer-events-none z-[94] transition-[border-color] duration-200"
      />
    </>
  );
}
