"use client";

import { useEffect, useState } from "react";

export default function ScrollProgressBar() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return setPct(0);
      setPct(Math.min(100, Math.max(0, (window.scrollY / docHeight) * 100)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2px] z-[60] bg-transparent pointer-events-none"
    >
      <div
        className="h-full bg-gold-gradient shadow-[0_0_10px_#E0B860]"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
