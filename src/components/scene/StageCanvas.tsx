"use client";

import { useEffect, useRef, useState } from "react";
import type { Scene as SceneType } from "./Scene";

export type SceneFeedbackEvent =
  | { type: "pulse" }
  | { type: "fail" }
  | { type: "select"; index: number };

export function emitSceneEvent(event: SceneFeedbackEvent) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("sc-scene-event", { detail: event }));
  }
}

interface StageCanvasProps {
  sectionIds: string[];
  onServiceSelect?: (index: number) => void;
}

export default function StageCanvas({
  sectionIds,
  onServiceSelect,
}: StageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<SceneType | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    let mounted = true;
    let sceneInstance: SceneType | null = null;

    const init = async () => {
      if (!canvasRef.current) return;
      try {
        const { Scene } = await import("./Scene");
        if (!mounted || !canvasRef.current) return;
        sceneInstance = new Scene(canvasRef.current, {
          onSelect: (idx) => onServiceSelect?.(idx),
        });
        sceneRef.current = sceneInstance;
      } catch {
        if (mounted) setWebglFailed(true);
      }
    };

    const raf = requestAnimationFrame(() => {
      void init();
    });

    const handleScroll = () => {
      if (!sceneRef.current || sectionIds.length === 0) return;
      const triggerY = window.innerHeight * 0.55;
      let progress = 0;

      for (let i = 0; i < sectionIds.length; i++) {
        const el = document.getElementById(sectionIds[i]);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= triggerY) {
          const frac = Math.min(
            1,
            Math.max(0, (triggerY - rect.top) / Math.max(1, rect.height))
          );
          progress = i + frac;
        }
      }
      sceneRef.current.setProgress(progress);
    };

    const handleSceneEvent = (e: Event) => {
      const custom = e as CustomEvent<SceneFeedbackEvent>;
      if (!sceneRef.current) return;
      if (custom.detail.type === "pulse") sceneRef.current.pulse();
      if (custom.detail.type === "fail") sceneRef.current.fail();
      if (custom.detail.type === "select")
        sceneRef.current.select(custom.detail.index);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("sc-scene-event", handleSceneEvent);
    handleScroll();

    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("sc-scene-event", handleSceneEvent);
      sceneInstance?.dispose();
      sceneRef.current = null;
    };
  }, [sectionIds, onServiceSelect]);

  if (webglFailed) {
    return (
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 pointer-events-none bg-[#0A0F1C]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 70% 25%, rgba(79, 116, 232,0.22), transparent 55%), linear-gradient(rgba(79, 116, 232,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(79, 116, 232,0.06) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 48px 48px, 48px 48px",
        }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full -z-10 block"
    />
  );
}
