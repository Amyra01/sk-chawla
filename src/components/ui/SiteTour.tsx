"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  FileSearch,
  HeartPulse,
  Calculator,
  Sparkles,
  X,
} from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";

/** Bump the version to show the tour again to everyone after big changes. */
const STORAGE_KEY = "skc_site_tour_done_v1";
export const START_TOUR_EVENT = "skc:start-tour";

/** Call from anywhere (e.g. a "?" button) to replay the guide. */
export function startSiteTour() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(START_TOUR_EVENT));
  }
}

type Copy = { title: string; body: string };

interface TourStep {
  /** data-tour ids, first visible one is highlighted. Empty = centered card. */
  targets: string[];
  en: Copy;
  hi: Copy;
  final?: boolean;
}

const STEPS: TourStep[] = [
  {
    targets: [],
    en: {
      title: "Welcome to Sunil Chawla & Associates",
      body: "Advocate, Tax Advisor & Tax Consultant — 22+ years in GST, Income Tax, VAT and tax litigation in Ludhiana. Take this 1-minute guide to see how the website works.",
    },
    hi: {
      title: "सुनील चावला एंड एसोसिएट्स में आपका स्वागत है",
      body: "एडवोकेट, टैक्स एडवाइज़र और टैक्स कंसल्टेंट — GST, इनकम टैक्स, VAT और टैक्स लिटिगेशन में 22+ वर्षों का अनुभव। वेबसाइट कैसे इस्तेमाल करें, यह 1 मिनट की गाइड देखें।",
    },
  },
  {
    targets: ["nav-main", "menu"],
    en: {
      title: "1. Explore the website",
      body: "Use these links to read About, Services, the career Journey, Clients, Insights and Contact details. On mobile, tap the menu icon.",
    },
    hi: {
      title: "1. वेबसाइट देखें",
      body: "इन लिंक से About, Services, Journey, Clients, Insights और Contact देखें। मोबाइल पर मेनू आइकन दबाएँ।",
    },
  },
  {
    targets: ["book"],
    en: {
      title: "2. Book a consultation",
      body: "Pick a date and time slot, choose online or in-office, and confirm. You get an instant confirmation and the office is notified.",
    },
    hi: {
      title: "2. कंसल्टेशन बुक करें",
      body: "तारीख और समय चुनें, ऑनलाइन या ऑफिस में मिलने का विकल्प चुनें और कन्फर्म करें। आपको तुरंत कन्फर्मेशन मिलेगा।",
    },
  },
  {
    targets: ["ask-query", "menu"],
    en: {
      title: "3. Ask a tax query",
      body: "Describe your GST / Income Tax problem, attach documents, and get a written reply from the office. Urgent notices are prioritised.",
    },
    hi: {
      title: "3. टैक्स सवाल पूछें",
      body: "अपनी GST / इनकम टैक्स समस्या लिखें, दस्तावेज़ जोड़ें और ऑफिस से लिखित जवाब पाएँ। अर्जेंट नोटिस को प्राथमिकता मिलती है।",
    },
  },
  {
    targets: ["search"],
    en: {
      title: "4. Quick search",
      body: "Press Ctrl + K (or click here) to jump to any service, tool or page instantly.",
    },
    hi: {
      title: "4. तुरंत खोजें",
      body: "Ctrl + K दबाएँ (या यहाँ क्लिक करें) और किसी भी सेवा, टूल या पेज पर तुरंत जाएँ।",
    },
  },
  {
    targets: ["language"],
    en: {
      title: "5. हिंदी / English",
      body: "Switch the website language between English and Hindi anytime.",
    },
    hi: {
      title: "5. हिंदी / English",
      body: "वेबसाइट की भाषा कभी भी हिंदी और अंग्रेज़ी में बदलें।",
    },
  },
  {
    targets: ["ticker"],
    en: {
      title: "6. Never miss a due date",
      body: "This bar shows the next GST due date. Click “Set a reminder” to open the compliance calendar and get reminders.",
    },
    hi: {
      title: "6. कोई ड्यू डेट न चूकें",
      body: "यह पट्टी अगली GST ड्यू डेट दिखाती है। “Set a reminder” दबाकर कंप्लायंस कैलेंडर खोलें और रिमाइंडर पाएँ।",
    },
  },
  {
    targets: ["portal", "menu"],
    en: {
      title: "7. Client login",
      body: "Existing clients can log in to track their cases, documents, orders and invoices.",
    },
    hi: {
      title: "7. क्लाइंट लॉगिन",
      body: "मौजूदा क्लाइंट लॉगिन करके अपने केस, दस्तावेज़, ऑर्डर और इनवॉइस देख सकते हैं।",
    },
  },
  {
    targets: ["assistant"],
    en: {
      title: "8. AI assistant & WhatsApp",
      body: "Have a quick question? Chat with the assistant here, or message the office directly on WhatsApp (9872355007).",
    },
    hi: {
      title: "8. AI असिस्टेंट और WhatsApp",
      body: "कोई जल्दी का सवाल? यहाँ असिस्टेंट से चैट करें, या सीधे WhatsApp (9872355007) पर ऑफिस को मैसेज करें।",
    },
  },
  {
    targets: [],
    final: true,
    en: {
      title: "You're all set!",
      body: "Try the free tools below, or book your consultation. You can replay this guide anytime using the “?” button at the top.",
    },
    hi: {
      title: "आप तैयार हैं!",
      body: "नीचे दिए मुफ़्त टूल आज़माएँ, या कंसल्टेशन बुक करें। यह गाइड कभी भी ऊपर “?” बटन से दोबारा देख सकते हैं।",
    },
  },
];

const QUICK_LINKS = [
  { href: "/notice-decoder", en: "Notice Decoder", hi: "नोटिस डिकोडर", icon: FileSearch },
  { href: "/health-check", en: "GST Health Check", hi: "GST हेल्थ चेक", icon: HeartPulse },
  { href: "/tools", en: "Free Tax Tools", hi: "मुफ़्त टैक्स टूल", icon: Calculator },
];

type Rect = { top: number; left: number; width: number; height: number };

const PAD = 8;
const CARD_W = 360;

function findTarget(ids: string[]): HTMLElement | null {
  for (const id of ids) {
    const el = document.querySelector<HTMLElement>(`[data-tour="${id}"]`);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    if (r.width > 0 && r.height > 0 && style.visibility !== "hidden") return el;
  }
  return null;
}

export default function SiteTour() {
  const { locale } = useApp();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [viewport, setViewport] = useState({ w: 1280, h: 800 });
  const nextBtnRef = useRef<HTMLButtonElement>(null);

  const step = STEPS[index];
  const copy = locale === "hi" ? step.hi : step.en;
  const isLast = index === STEPS.length - 1;

  const finish = useCallback(() => {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* storage unavailable — ignore */
    }
  }, []);

  const start = useCallback(() => {
    setIndex(0);
    setOpen(true);
  }, []);

  // Auto-start on first visit (after the preloader), and listen for replays.
  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      seen = true;
    }
    const timer = seen ? undefined : window.setTimeout(start, 1700);
    window.addEventListener(START_TOUR_EVENT, start);
    return () => {
      if (timer) window.clearTimeout(timer);
      window.removeEventListener(START_TOUR_EVENT, start);
    };
  }, [start]);

  // Measure the highlighted element; re-measure on resize / scroll.
  const measure = useCallback(() => {
    setViewport({ w: window.innerWidth, h: window.innerHeight });
    const el = step.targets.length ? findTarget(step.targets) : null;
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    if (r.top < 0 || r.bottom > window.innerHeight) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    setRect({
      top: r.top - PAD,
      left: r.left - PAD,
      width: r.width + PAD * 2,
      height: r.height + PAD * 2,
    });
  }, [step]);

  useLayoutEffect(() => {
    if (!open) return;
    measure();
    const t = window.setTimeout(measure, 400); // after smooth scroll settles
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
    };
  }, [open, measure]);

  // Keyboard: Esc closes, arrows navigate.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, STEPS.length - 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, finish]);

  useEffect(() => {
    if (open) nextBtnRef.current?.focus({ preventScroll: true });
  }, [open, index]);

  if (!open) return null;

  // ---- Card placement ----
  const isMobile = viewport.w < 640;
  const cardW = Math.min(CARD_W, viewport.w - 24);
  let cardStyle: React.CSSProperties;
  if (!rect) {
    cardStyle = {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: Math.min(isLast ? 440 : 420, viewport.w - 24),
    };
  } else if (isMobile) {
    const placeBottom = rect.top + rect.height / 2 < viewport.h / 2;
    cardStyle = placeBottom
      ? { bottom: 16, left: 12, right: 12 }
      : { top: 16, left: 12, right: 12 };
  } else {
    const spaceBelow = viewport.h - (rect.top + rect.height);
    const below = spaceBelow > 260;
    const left = Math.min(
      Math.max(12, rect.left + rect.width / 2 - cardW / 2),
      viewport.w - cardW - 12
    );
    cardStyle = below
      ? { top: rect.top + rect.height + 14, left, width: cardW }
      : { bottom: viewport.h - rect.top + 14, left, width: cardW };
  }

  const labels =
    locale === "hi"
      ? { skip: "गाइड बंद करें", back: "पीछे", next: "आगे", start: "शुरू करें", done: "समाप्त", book: "कंसल्टेशन बुक करें" }
      : { skip: "Skip guide", back: "Back", next: "Next", start: "Start tour", done: "Finish", book: "Book Consultation" };

  return (
    <div
      className="fixed inset-0 z-[92]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="site-tour-title"
      aria-describedby="site-tour-body"
    >
      {/* Click-catcher (blocks the page while the guide is open) */}
      <div className="absolute inset-0" />

      {/* Dim layer + spotlight */}
      {rect ? (
        <div
          className="absolute rounded-xl pointer-events-none transition-all duration-300 ease-out ring-2 ring-gold/80"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            boxShadow:
              "0 0 0 9999px rgba(10, 15, 28, 0.78), 0 0 28px 4px rgba(224, 184, 96, 0.45)",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-obsidian/80 backdrop-blur-[2px] pointer-events-none" />
      )}

      {/* Guide card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
          className="absolute"
          style={cardStyle}
        >
          <div className="relative rounded-2xl border border-gold/40 bg-charcoal/95 backdrop-blur-xl p-5 shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
            <button
              type="button"
              onClick={finish}
              aria-label={labels.skip}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-mutedText hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2 pr-8">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gold-gradient text-obsidian shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <span className="text-[11px] uppercase tracking-widest text-gold font-semibold">
                {locale === "hi" ? "वेबसाइट गाइड" : "Website Guide"} · {index + 1}/{STEPS.length}
              </span>
            </div>

            <h2 id="site-tour-title" className="font-serif text-xl font-semibold text-white leading-snug">
              {copy.title}
            </h2>
            <p id="site-tour-body" className="mt-2 text-sm leading-relaxed text-mutedText">
              {copy.body}
            </p>

            {step.final && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                {QUICK_LINKS.map((q) => {
                  const Icon = q.icon;
                  return (
                    <Link
                      key={q.href}
                      href={q.href}
                      onClick={finish}
                      className="flex sm:flex-col items-center gap-2 sm:gap-1.5 rounded-xl border border-sapphire/30 bg-navy/60 px-3 py-2.5 text-xs text-white hover:border-gold/60 transition-colors text-center"
                    >
                      <Icon className="w-4 h-4 text-gold" />
                      {locale === "hi" ? q.hi : q.en}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Progress dots */}
            <div className="mt-4 flex items-center gap-1.5" aria-hidden="true">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={
                    "h-1.5 rounded-full transition-all duration-300 " +
                    (i === index ? "w-5 bg-gold" : i < index ? "w-1.5 bg-gold/50" : "w-1.5 bg-white/15")
                  }
                />
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              {index === 0 ? (
                <button
                  type="button"
                  onClick={finish}
                  className="text-xs text-mutedText hover:text-white transition-colors"
                >
                  {labels.skip}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIndex((i) => Math.max(0, i - 1))}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs text-white border border-white/15 hover:border-sapphire/60 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {labels.back}
                </button>
              )}

              {isLast ? (
                <div className="flex items-center gap-2">
                  <button
                    ref={nextBtnRef}
                    type="button"
                    onClick={finish}
                    className="px-3 py-2 rounded-lg text-xs text-white border border-white/15 hover:border-sapphire/60 transition-colors"
                  >
                    {labels.done}
                  </button>
                  <Link
                    href="/book"
                    onClick={finish}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gold-gradient text-obsidian text-xs font-semibold shadow-gold-glow"
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    {labels.book}
                  </Link>
                </div>
              ) : (
                <button
                  ref={nextBtnRef}
                  type="button"
                  onClick={() => setIndex((i) => Math.min(STEPS.length - 1, i + 1))}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gold-gradient text-obsidian text-xs font-semibold shadow-gold-glow"
                >
                  {index === 0 ? labels.start : labels.next}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
