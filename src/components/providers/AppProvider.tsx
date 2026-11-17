"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import Lenis from "lenis";
import { dictionary, type Locale } from "@/lib/i18n";

export interface CartItem {
  serviceId: string;
  slug: string;
  title: string;
  priceInr: number;
  sacCode: string;
  quantity: number;
}

interface AppContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (typeof dictionary)["en"] | (typeof dictionary)["hi"];
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (slug: string) => void;
  clearCart: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  cmdOpen: boolean;
  setCmdOpen: (open: boolean) => void;
  triggerEasterEgg: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, setLocale] = useState<Locale>("en");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [easterEgg, setEasterEgg] = useState(false);

  // Hydrate cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sc_cart");
      if (saved) setCart(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("sc_cart", JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  // Lenis Smooth Scroll
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  // Global Cmd/Ctrl+K & Konami code
  useEffect(() => {
    const konami = [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "b",
      "a",
    ];
    let kIdx = 0;

    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
      if (e.key === konami[kIdx]) {
        kIdx++;
        if (kIdx === konami.length) {
          kIdx = 0;
          setEasterEgg(true);
          setTimeout(() => setEasterEgg(false), 3800);
        }
      } else {
        kIdx = 0;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const addToCart = useCallback((item: Omit<CartItem, "quantity">) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.slug === item.slug);
      if (existing) {
        return prev.map((i) =>
          i.slug === item.slug ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setCartOpen(true);
  }, []);

  const removeFromCart = useCallback((slug: string) => {
    setCart((prev) => prev.filter((i) => i.slug !== slug));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const triggerEasterEgg = useCallback(() => {
    setEasterEgg(true);
    setTimeout(() => setEasterEgg(false), 3800);
  }, []);

  return (
    <AppContext.Provider
      value={{
        locale,
        setLocale,
        t: dictionary[locale],
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        cartOpen,
        setCartOpen,
        cmdOpen,
        setCmdOpen,
        triggerEasterEgg,
      }}
    >
      {children}
      {easterEgg && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center bg-sapphire/20 backdrop-blur-sm animate-pulse"
        >
          <div className="glass-card px-10 py-6 rounded-2xl border-gold text-center shadow-sapphire-glow">
            <p className="font-serif text-3xl md:text-5xl text-white tracking-wide">
              Precision. <span className="text-gold">Always.</span>
            </p>
            <p className="text-xs uppercase tracking-[0.25em] text-mutedText mt-2">
              Sunil Chawla • 22+ Years of Tax &amp; Legal Craft
            </p>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
}
