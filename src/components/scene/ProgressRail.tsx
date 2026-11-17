"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ProgressRailProps {
  sections: Array<{ id: string; label: string }>;
}

export default function ProgressRail({ sections }: ProgressRailProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const triggerY = window.innerHeight * 0.55;
      let current = 0;
      sections.forEach((sec, idx) => {
        const el = document.getElementById(sec.id);
        if (el && el.getBoundingClientRect().top <= triggerY) {
          current = idx;
        }
      });
      setActiveIndex(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav
      aria-label="Section progress"
      className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-end gap-3"
    >
      {sections.map((sec, idx) => {
        const isActive = idx === activeIndex;
        return (
          <button
            key={sec.id}
            type="button"
            onClick={() => scrollTo(sec.id)}
            aria-label={`Jump to ${sec.label}`}
            aria-current={isActive ? "true" : undefined}
            className="group flex items-center gap-2.5 focus:outline-none"
          >
            <span
              className={cn(
                "text-[11px] font-medium tracking-wide px-2 py-0.5 rounded bg-charcoal/90 border border-sapphire/30 text-white transition-all duration-200",
                isActive
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
              )}
            >
              {sec.label}
            </span>
            <span
              className={cn(
                "block rounded-full transition-all duration-300",
                isActive
                  ? "w-3 h-3 bg-gold shadow-[0_0_12px_#E0B860]"
                  : "w-2 h-2 bg-sapphire/40 group-hover:bg-sapphire"
              )}
            />
          </button>
        );
      })}
    </nav>
  );
}
