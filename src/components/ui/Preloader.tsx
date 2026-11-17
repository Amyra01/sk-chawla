"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale } from "lucide-react";

export default function Preloader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) {
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => setVisible(false), 1350);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          aria-hidden="true"
          initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{
            clipPath: "inset(0% 0% 100% 0%)",
            transition: { duration: 0.55, ease: [0.77, 0, 0.175, 1] },
          }}
          className="fixed inset-0 z-[90] bg-[#0A0F1C] flex flex-col items-center justify-center gap-4"
        >
          <div className="relative flex items-center justify-center w-24 h-24">
            <svg viewBox="0 0 100 100" className="w-24 h-24">
              <motion.rect
                x="8"
                y="8"
                width="84"
                height="84"
                rx="18"
                fill="none"
                stroke="#4F74E8"
                strokeWidth="2.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.9, ease: "easeInOut" }}
              />
            </svg>
            <span className="absolute font-serif text-3xl font-bold tracking-wider text-white">
              SC
            </span>
          </div>
          <motion.div
            animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="flex items-center gap-2 text-gold text-xs tracking-[0.25em] uppercase"
          >
            <Scale className="w-4 h-4" />
            <span>Sunil Chawla</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
