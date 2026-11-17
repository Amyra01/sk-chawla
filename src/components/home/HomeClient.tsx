"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Scale,
  ShieldCheck,
  FileText,
  Landmark,
  ArrowRight,
  ChevronDown,
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  Play,
  Briefcase,
  Award,
  X,
} from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { emitSceneEvent } from "@/components/scene/StageCanvas";
import ProgressRail from "@/components/scene/ProgressRail";
import MagneticButton from "@/components/ui/MagneticButton";
import TiltCard from "@/components/ui/TiltCard";
import DealerJourneyMap from "@/components/home/DealerJourneyMap";
import { FALLBACK_SERVICES, FALLBACK_FAQS } from "@/lib/seed-fallback";

const StageCanvas = dynamic(() => import("@/components/scene/StageCanvas"), {
  ssr: false,
});

const SECTIONS = [
  { id: "hero", label: "Overview" },
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "journey", label: "Journey" },
  { id: "clients", label: "Clients" },
  { id: "why", label: "Why Us" },
  { id: "process", label: "Process" },
  { id: "insights", label: "Knowledge" },
  { id: "contact", label: "Contact" },
  { id: "footer", label: "Footer" },
];

const CLIENTS = [
  {
    name: "Kalyan Jewellers",
    role: "VAT Consultant",
    tenure: "8 Years",
    ongoing: false,
  },
  {
    name: "Siemens Ltd.",
    role: "Litigation Consultant (Tax Court Cases)",
    tenure: "10 Years",
    ongoing: false,
  },
  {
    name: "Makkar Fabrics",
    role: "Litigation Consultant (Revenue Courts)",
    tenure: "5 Years to Present",
    ongoing: true,
  },
  {
    name: "Iqbal Enterprises",
    role: "Complete Compliance & Services",
    tenure: "10 Years to Present",
    ongoing: true,
  },
  {
    name: "Ganpati Overseas",
    role: "Complete Tax Services",
    tenure: "15+ Years to Present",
    ongoing: true,
  },
];

const JOURNEY_STEPS = [
  {
    year: "1998 – 2000",
    title: "Graduation (Correspondence)",
    desc: "Foundational academic studies while developing early practical familiarity with commercial accounts and taxation.",
  },
  {
    year: "2001 – 2003",
    title: "B.A. LL.B. (Honours) — DAVV Indore",
    desc: "Graduated in Law with Honours from Devi Ahilya Vishwavidyalaya (DAVV), Indore, building a rigorous legal foundation.",
  },
  {
    year: "2004",
    title: "The Foundation",
    desc: "Enrolment and licence obtained; independent tax and revenue court practice begins.",
  },
  {
    year: "2005 – 2018",
    title: "The Growth Years",
    desc: "Built enduring corporate relationships across manufacturing, jewellery, textiles and multinational enterprises.",
  },
  {
    year: "Today",
    title: "The Automated Practice",
    desc: "A systemised, process-driven practice where clients arrive through established reputation and structured workflows.",
  },
];

function CountUpStat({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let start = 0;
          const step = Math.max(1, Math.ceil(target / 30));
          const timer = setInterval(() => {
            start += step;
            if (start >= target) {
              setVal(target);
              clearInterval(timer);
            } else {
              setVal(start);
            }
          }, 28);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
}

export default function HomeClient() {
  const { t } = useApp();
  const [openFaq, setOpenFaq] = useState<string | null>(FALLBACK_FAQS[0].id);
  const [selectedCubeIdx, setSelectedCubeIdx] = useState<number | null>(null);
  const [gentlePrompt, setGentlePrompt] = useState(false);
  const [callbackOpen, setCallbackOpen] = useState(false);
  const [callbackPhone, setCallbackPhone] = useState("");
  const [callbackName, setCallbackName] = useState("");
  const [callbackSent, setCallbackSent] = useState(false);

  // Contact quick form state
  const [cName, setCName] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [cMsg, setCMsg] = useState("");
  const [cConsent, setCConsent] = useState(false);
  const [cStatus, setCStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  const timelineRef = useRef<HTMLDivElement | null>(null);

  // GSAP ScrollTrigger for Career Journey line
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced || !timelineRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".journey-line-fill",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: timelineRef.current,
            start: "top 70%",
            end: "bottom 70%",
            scrub: true,
          },
        }
      );
    }, timelineRef);
    return () => ctx.revert();
  }, []);

  // Smart Gentle Prompt (once per session after 18s)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("sc_gentle_prompt_shown")) return;
    const timer = setTimeout(() => {
      setGentlePrompt(true);
      sessionStorage.setItem("sc_gentle_prompt_shown", "1");
    }, 18000);
    return () => clearTimeout(timer);
  }, []);

  const handleServiceCubeSelect = (idx: number) => {
    setSelectedCubeIdx(idx);
    const el = document.getElementById("services");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const handleQuickContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cConsent) {
      setCStatus("error");
      emitSceneEvent({ type: "fail" });
      return;
    }
    setCStatus("sending");
    try {
      const res = await fetch("/api/queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cName,
          email: cEmail,
          phone: cPhone,
          category: "Other",
          urgency: "Normal",
          question: cMsg,
          dpdpConsent: cConsent,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setCStatus("sent");
      emitSceneEvent({ type: "pulse" });
      setCName("");
      setCEmail("");
      setCPhone("");
      setCMsg("");
    } catch {
      setCStatus("error");
      emitSceneEvent({ type: "fail" });
    }
  };

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/callbacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: callbackName,
          phone: callbackPhone,
          dpdpConsent: true,
        }),
      });
      setCallbackSent(true);
      emitSceneEvent({ type: "pulse" });
    } catch {
      emitSceneEvent({ type: "fail" });
    }
  };

  const heroWords = t.heroHeadline.split(" ");

  return (
    <div className="relative">
      <StageCanvas
        sectionIds={SECTIONS.map((s) => s.id)}
        onServiceSelect={handleServiceCubeSelect}
      />
      <ProgressRail sections={SECTIONS} />

      {/* B. HERO SECTION */}
      <section
        id="hero"
        className="relative min-h-[90vh] flex items-center py-14 sm:py-20 pointer-events-none"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6 pointer-events-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sapphire/10 border border-sapphire/40 text-[11px] font-semibold tracking-[0.2em] text-gold">
              <span>{t.eyebrow}</span>
            </div>

            <h1 className="font-serif font-bold text-white leading-[1.03] tracking-tight text-[clamp(3rem,6.5vw,5.75rem)]">
              {heroWords.map((word, idx) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.1 + idx * 0.06 }}
                  className={
                    idx >= heroWords.length - 2
                      ? "inline-block mr-3 text-gold-gradient"
                      : "inline-block mr-3"
                  }
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            <p className="text-base sm:text-lg text-mutedText max-w-xl leading-relaxed">
              {t.heroSubtext}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <MagneticButton href="/book" variant="primary">
                {t.bookConsultation} <ArrowRight className="w-4 h-4" />
              </MagneticButton>
              <MagneticButton href="/services" variant="secondary">
                {t.exploreServices}
              </MagneticButton>
            </div>

            {/* Quick-action notice strip */}
            <Link
              href="/notice-decoder"
              className="mt-4 inline-flex items-center gap-3 px-4 py-2.5 rounded-xl glass-card border-gold/30 hover:border-gold text-xs sm:text-sm text-white transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-gold animate-ping" />
              <span>{t.noticeStrip}</span>
              <span className="text-gold font-semibold">
                AI Notice Decoder →
              </span>
            </Link>
          </div>

          {/* Portrait + Floating Glass Badges */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end pointer-events-auto">
            <div className="relative w-72 sm:w-80">
              <div className="absolute -inset-3 rounded-3xl bg-gold-gradient opacity-20 blur-2xl pointer-events-none" />
              <div className="relative glass-card rounded-3xl p-2.5 border-sapphire/50 shadow-gold-glow">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-obsidian border border-white/10">
                  <Image
                    src="/images/hero-advocate.jpg"
                    alt="Mr. Sunil Chawla — Advocate, Tax Advisor & Tax Consultant"
                    fill
                    priority
                    sizes="(max-width: 768px) 288px, 320px"
                    className="object-cover object-top"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-obsidian via-obsidian/70 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <p className="font-serif text-lg font-bold text-white leading-tight">
                      Mr. Sunil Chawla
                    </p>
                    <p className="text-[11px] text-gold tracking-wide">
                      Sunil Chawla &amp; Associates
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -left-4 top-8 glass-card px-3 py-1.5 rounded-xl text-xs font-semibold text-white border-gold/40">
                22+ Years
              </div>
              <div className="absolute -right-4 top-1/2 glass-card px-3 py-1.5 rounded-xl text-xs font-semibold text-gold border-sapphire/40">
                B.A. LL.B. (Hons)
              </div>
              <div className="absolute left-6 -bottom-4 glass-card px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white border-sapphire/50">
                GST &amp; Litigation Expert
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* C. STATS BAR */}
      <section className="py-10 border-y border-sapphire/15 bg-charcoal/65 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div>
            <p className="font-serif text-3xl sm:text-4xl font-bold text-white">
              <CountUpStat target={22} suffix="+" />
            </p>
            <p className="text-xs uppercase tracking-widest text-mutedText mt-1">
              Years of Practice
            </p>
          </div>
          <div>
            <p className="font-serif text-3xl sm:text-4xl font-bold text-gold">
              <CountUpStat target={5} />
            </p>
            <p className="text-xs uppercase tracking-widest text-mutedText mt-1">
              Long-Term Corporate Clients
            </p>
          </div>
          <div>
            <p className="font-serif text-3xl sm:text-4xl font-bold text-white">
              <CountUpStat target={8} />
            </p>
            <p className="text-xs uppercase tracking-widest text-mutedText mt-1">
              Core Practice Areas
            </p>
          </div>
          <div>
            <p className="font-mono text-2xl sm:text-3xl font-bold text-sapphire">
              [CASES HANDLED]
            </p>
            <p className="text-xs uppercase tracking-widest text-mutedText mt-1">
              Verified Matters
            </p>
          </div>
        </div>
      </section>

      {/* D. ABOUT SECTION (Big editorial black-suit portrait looking right toward bio & credentials) */}
      <section id="about" className="py-24 pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 pointer-events-auto">
            <div className="relative max-w-md mx-auto lg:mx-0">
              <div className="absolute -inset-4 rounded-3xl bg-gold-gradient opacity-20 blur-2xl pointer-events-none" />
              <div className="relative glass-card rounded-3xl p-2.5 border-sapphire/45 shadow-gold-glow">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-obsidian border border-white/10">
                  <Image
                    src="/images/sunil-black-suit.jpg"
                    alt="Mr. Sunil Chawla in black suit smiling"
                    fill
                    sizes="(max-width: 1024px) 90vw, 420px"
                    className="object-cover object-top"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-obsidian via-obsidian/65 to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-gold font-semibold">
                      Founder &amp; Principal Advocate
                    </p>
                    <p className="font-serif text-xl font-bold text-white mt-0.5">
                      Sunil Chawla &amp; Associates
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7 pointer-events-auto space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
                About the Practice
              </p>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white mt-2">
                Dual Mastery of Tax Law &amp; Commercial Compliance
              </h2>
              <div className="h-[2px] w-24 bg-gold-gradient mt-4" />
            </div>

            <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-4 text-sm sm:text-base leading-relaxed">
              <p className="text-white/90">
                Mr. Sunil Chawla combines deep legal knowledge with over two
                decades of practical tax experience. As a dedicated practitioner
                in GST consultation and income tax returns, he delivers advisory
                with precision and professionalism.
              </p>
              <p className="text-mutedText">
                He provides tax litigation and revenue court representation to
                reputed companies, including drafting litigation compliance
                replies, handling assessment appeals, and guiding corporate
                incorporation and MCA portal compliance.
              </p>

              <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-obsidian/70 border border-sapphire/25">
                  <p className="text-[11px] font-mono text-gold">
                    1998 – 2000
                  </p>
                  <p className="text-sm font-semibold text-white mt-1">
                    Graduation (Correspondence)
                  </p>
                  <p className="text-xs text-mutedText mt-0.5">
                    Foundational Commercial Studies
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-obsidian/70 border border-sapphire/25">
                  <p className="text-[11px] font-mono text-gold">
                    2001 – 2003
                  </p>
                  <p className="text-sm font-semibold text-white mt-1">
                    B.A. LL.B. (Honours)
                  </p>
                  <p className="text-xs text-mutedText mt-0.5">
                    Devi Ahilya Vishwavidyalaya (DAVV), Indore
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* E. SERVICES CATALOG (Bento Grid) */}
      <section id="services" className="py-24 bg-navy-radial pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pointer-events-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
                Services Catalog
              </p>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white mt-2">
                Structured Tax &amp; Litigation Services
              </h2>
              <div className="h-[2px] w-24 bg-gold-gradient mt-4" />
            </div>
            <Link
              href="/services"
              className="text-sm font-semibold text-gold hover:underline inline-flex items-center gap-1.5"
            >
              Open Full Services Store <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {selectedCubeIdx !== null && (
            <div className="glass-card px-4 py-2.5 rounded-xl text-xs text-gold inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>
                3D Cube Selected:{" "}
                {["GST & Indirect Tax", "Income Tax & Direct Tax", "Litigation & Corporate"][selectedCubeIdx]}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Group 1: GST & Indirect Tax */}
            <TiltCard className="p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-sapphire/15 border border-sapphire/40 flex items-center justify-center text-gold">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-white">
                  GST &amp; Indirect Tax
                </h3>
                <p className="text-xs text-mutedText leading-relaxed">
                  New GST registration, GSTR-1 / 3B / 9 return filing, VAT
                  returns, GST court cases and Bar licence applications.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
                {FALLBACK_SERVICES.filter(
                  (s) => s.categorySlug === "gst-indirect-tax"
                ).map((s) => (
                  <Link
                    key={s.slug}
                    href={`/services/${s.slug}`}
                    className="flex items-center justify-between text-xs text-white/85 hover:text-gold py-1 group"
                  >
                    <span>{s.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ))}
              </div>
            </TiltCard>

            {/* Group 2: Income Tax & Direct Tax */}
            <TiltCard className="p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-sapphire/15 border border-sapphire/40 flex items-center justify-center text-gold">
                  <Landmark className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-white">
                  Income Tax &amp; Direct Tax
                </h3>
                <p className="text-xs text-mutedText leading-relaxed">
                  ITR filing, income tax planning, direct &amp; indirect
                  taxation advisory, and partnership firm taxation.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
                {FALLBACK_SERVICES.filter(
                  (s) => s.categorySlug === "income-tax-direct-tax"
                ).map((s) => (
                  <Link
                    key={s.slug}
                    href={`/services/${s.slug}`}
                    className="flex items-center justify-between text-xs text-white/85 hover:text-gold py-1 group"
                  >
                    <span>{s.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ))}
              </div>
            </TiltCard>

            {/* Group 3: Litigation & Corporate (Highlighted) */}
            <TiltCard className="p-6 flex flex-col justify-between border-gold/45 shadow-gold-glow">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center text-obsidian">
                    <Scale className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full bg-gold/15 text-gold border border-gold/30">
                    Core Focus
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-white">
                  Litigation &amp; Corporate
                </h3>
                <p className="text-xs text-gold italic font-medium">
                  &ldquo;Saving the dealer, one case at a time.&rdquo;
                </p>
                <p className="text-xs text-mutedText leading-relaxed">
                  Revenue court representation, drafting compliance replies,
                  appeal notices, company incorporation via MCA portal and
                  legacy committee matters.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
                {FALLBACK_SERVICES.filter(
                  (s) => s.categorySlug === "litigation-corporate"
                ).map((s) => (
                  <Link
                    key={s.slug}
                    href={`/services/${s.slug}`}
                    className="flex items-center justify-between text-xs text-white/90 hover:text-gold py-1 group"
                  >
                    <span>{s.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ))}
              </div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* F. CAREER JOURNEY TIMELINE */}
      <section id="journey" className="py-24 pointer-events-none">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pointer-events-auto">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
              Career Journey
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white mt-2">
              Two Decades of Practice
            </h2>
          </div>

          <div ref={timelineRef} className="relative pl-8 sm:pl-12 space-y-8">
            <div className="absolute left-3 sm:left-5 top-2 bottom-2 w-[2px] bg-white/10">
              <div className="journey-line-fill w-full h-full bg-gold-gradient origin-top" />
            </div>

            {JOURNEY_STEPS.map((step, i) => (
              <motion.div
                key={step.year}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="relative glass-card rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <span className="absolute -left-[29px] sm:-left-[37px] top-7 w-4 h-4 rounded-full bg-obsidian border-2 border-gold shadow-[0_0_12px_#E0B860]" />
                <div>
                  <span className="font-mono text-xs text-gold">
                    {step.year}
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mt-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-mutedText mt-2 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                {i === 0 && (
                  <div className="relative w-20 h-24 rounded-xl overflow-hidden border border-sapphire/40 shrink-0">
                    <Image
                      src="/images/sunil-early-career.jpg"
                      alt="Mr. Sunil Chawla — Early Academic Years"
                      fill
                      sizes="80px"
                      className="object-cover object-top"
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* G. CLIENTS AND EXPERIENCE + MARQUEE */}
      <section id="clients" className="py-24 bg-charcoal/50 pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pointer-events-auto space-y-10">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
              Clients &amp; Experience
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white mt-2">
              Long-Term Corporate Engagements
            </h2>
            <div className="h-[2px] w-24 bg-gold-gradient mt-4" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {CLIENTS.map((c) => (
              <div
                key={c.name}
                className="glass-card rounded-2xl p-5 border-t-2 border-t-sapphire flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Briefcase className="w-4 h-4 text-sapphire" />
                    {c.ongoing && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Ongoing
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-xl font-bold text-white">
                    {c.name}
                  </h3>
                  <p className="text-xs text-mutedText mt-1.5 leading-relaxed">
                    {c.role}
                  </p>
                </div>
                <p className="font-mono text-xs text-gold">{c.tenure}</p>
              </div>
            ))}
          </div>

          {/* Infinite Marquee */}
          <div className="overflow-hidden border-y border-white/10 py-4">
            <div className="animate-marquee gap-10 text-xs uppercase tracking-[0.22em] text-mutedText">
              {[...FALLBACK_SERVICES, ...FALLBACK_SERVICES].map((s, idx) => (
                <span key={`${s.slug}-${idx}`} className="flex items-center gap-4 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                  <span>{s.title}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* H. WHY CHOOSE ME */}
      <section id="why" className="py-24 pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pointer-events-auto">
          <div className="mb-12">
            <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
              Practice Pillars
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white mt-2">
              Why Businesses &amp; Dealers Work With Us
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Legal + Tax Dual Expertise",
                desc: "Combined perspective of an Advocate (B.A. LL.B. Hons) and seasoned Tax Consultant.",
              },
              {
                title: "22 Years of Proven Experience",
                desc: "Consistent practice across GST, Income Tax, VAT and revenue court proceedings since 2004.",
              },
              {
                title: "Precision & Professionalism",
                desc: "Reconciliation-first drafting, statutory accuracy, and clear communication.",
              },
              {
                title: "End-to-End Support",
                desc: "From initial GST/company registration through returns, notices, and appellate representation.",
              },
            ].map((pillar) => (
              <TiltCard key={pillar.title} className="p-6 space-y-3">
                <Award className="w-6 h-6 text-gold" />
                <h3 className="font-serif text-xl font-bold text-white">
                  {pillar.title}
                </h3>
                <p className="text-xs text-mutedText leading-relaxed">
                  {pillar.desc}
                </p>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* I. PROCESS + DEALER'S JOURNEY MAP */}
      <section id="process" className="py-24 bg-navy-radial pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pointer-events-auto space-y-14">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
              How We Work
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white mt-2">
              Four-Stage Engagement Process
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
              {[
                { step: "01", title: "Consult", desc: "Review facts, notices, returns and statutory deadlines." },
                { step: "02", title: "Strategise", desc: "Reconcile data and map the optimal legal & tax response." },
                { step: "03", title: "Execute & File", desc: "Prepare compliant returns, applications, or legal replies." },
                { step: "04", title: "Defend & Support", desc: "Represent in hearings and maintain ongoing compliance." },
              ].map((p) => (
                <div key={p.step} className="glass-card rounded-2xl p-6 space-y-2">
                  <span className="font-mono text-xs text-gold">
                    STEP {p.step}
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-white">
                    {p.title}
                  </h3>
                  <p className="text-xs text-mutedText">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
                Interactive Lifecycle
              </p>
              <h3 className="font-serif text-2xl sm:text-4xl font-bold text-white mt-1">
                The Dealer&apos;s Journey Map
              </h3>
            </div>
            <DealerJourneyMap />
          </div>
        </div>
      </section>

      {/* J, K, L: INSIGHTS, CASE STORIES, VIDEO EXPLAINERS, TESTIMONIALS & FAQ */}
      <section id="insights" className="py-24 pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pointer-events-auto space-y-16">
          {/* Quick Links to Signature Tools */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/notice-decoder" className="glass-card rounded-2xl p-6 hover:border-gold transition-colors">
              <p className="text-xs text-gold uppercase tracking-wider font-semibold">
                AI OCR Tool
              </p>
              <h3 className="font-serif text-2xl text-white font-bold mt-2">
                Notice Decoder
              </h3>
              <p className="text-xs text-mutedText mt-2">
                Upload a GST or Income Tax notice to extract key dates, sections and next steps.
              </p>
            </Link>
            <Link href="/health-check" className="glass-card rounded-2xl p-6 hover:border-gold transition-colors">
              <p className="text-xs text-gold uppercase tracking-wider font-semibold">
                2-Minute Assessment
              </p>
              <h3 className="font-serif text-2xl text-white font-bold mt-2">
                Compliance Health Check
              </h3>
              <p className="text-xs text-mutedText mt-2">
                Get a radial score out of 100 and a prioritised compliance action checklist.
              </p>
            </Link>
            <Link href="/tools" className="glass-card rounded-2xl p-6 hover:border-gold transition-colors">
              <p className="text-xs text-gold uppercase tracking-wider font-semibold">
                Calculators &amp; Estimators
              </p>
              <h3 className="font-serif text-2xl text-white font-bold mt-2">
                Free Tax Tools
              </h3>
              <p className="text-xs text-mutedText mt-2">
                GST calculator, late-fee estimator, Old vs New Tax Regime &amp; Appeal deadline calculator.
              </p>
            </Link>
          </div>

          {/* Short Video Explainers */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
                  Tax in 60 Seconds
                </p>
                <h2 className="font-serif text-3xl font-bold text-white mt-1">
                  Short Video Explainers
                </h2>
              </div>
              <Link href="/insights" className="text-xs text-gold hover:underline">
                All Insights &amp; Articles →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "What to Do First When You Receive a GST Notice",
                  topic: "Notices",
                  transcript:
                    "Check the DIN, note the statutory reply deadline, and reconcile against GSTR-2B before drafting a factual reply.",
                },
                {
                  title: "Old vs New Income Tax Regime: Key Checklist",
                  topic: "Income Tax",
                  transcript:
                    "Compare Chapter VI-A deductions and housing loan interest against lower New Regime slabs.",
                },
                {
                  title: "Documents Needed for New GST Registration",
                  topic: "Registration",
                  transcript:
                    "Keep PAN, Aadhaar, electricity bill with rent agreement or NOC, and bank proof ready.",
                },
              ].map((v) => (
                <div key={v.title} className="glass-card rounded-2xl p-5 space-y-3">
                  <div className="aspect-video rounded-xl bg-obsidian border border-white/10 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-sapphire/20 border border-gold/50 flex items-center justify-center text-gold">
                      <Play className="w-5 h-5" />
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-gold">
                    {v.topic} • 60s
                  </span>
                  <h3 className="font-serif text-lg font-bold text-white">
                    {v.title}
                  </h3>
                  <p className="text-xs text-mutedText">{v.transcript}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials (Placeholder only, never fabricated) */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-gold font-semibold">
                Client Feedback
              </p>
              <h3 className="font-serif text-2xl text-white font-bold mt-1">
                Verified Client Testimonials
              </h3>
              <p className="text-xs text-mutedText mt-1">
                [TESTIMONIALS] — Only admin-approved feedback from completed
                engagements is published here.
              </p>
            </div>
            <Link
              href="/portal"
              className="px-4 py-2.5 rounded-xl bg-sapphire/15 border border-sapphire/40 text-xs font-semibold text-white hover:border-gold shrink-0"
            >
              Submit Verified Feedback
            </Link>
          </div>

          {/* L. FAQ Accordion */}
          <div id="faq" className="space-y-6 max-w-4xl">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {FALLBACK_FAQS.map((faq) => {
                const isOpen = openFaq === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="glass-card rounded-xl overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 text-sm font-medium text-white"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-gold transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-xs sm:text-sm text-mutedText leading-relaxed border-t border-white/5 pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* M. CONTACT SECTION */}
      <section id="contact" className="py-24 bg-navy-radial pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pointer-events-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-6">
            <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
              Get in Touch
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white">
              Facing a Tax Notice? Let&apos;s Talk.
            </h2>
            <p className="text-sm text-mutedText leading-relaxed">
              Reach out for structured consultations, notice reviews, or
              ongoing business compliance.
            </p>

            <div className="space-y-3 text-sm">
              <a
                href="tel:+919872355007"
                className="flex items-center gap-3 text-white hover:text-gold transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-gold shrink-0" />
                <span className="font-mono">9872355007</span>
              </a>
              <a
                href="mailto:sunilkumarchawla@gmail.com"
                className="flex items-center gap-3 text-white hover:text-gold transition-colors"
              >
                <Mail className="w-4 h-4 text-gold shrink-0" />
                <span className="font-mono">sunilkumarchawla@gmail.com</span>
              </a>
              <div className="flex items-start gap-3 text-white">
                <MapPin className="w-4 h-4 text-gold shrink-0 mt-1" />
                <span>
                  42, Street No. 1B7, Santokh Nagar, Shiv Puri, near Masjid,
                  Vishnupuri, New Shiv Puri, Ludhiana, Punjab 141008, India
                </span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <Clock className="w-4 h-4 text-gold shrink-0" />
                <span>8:30 AM – 10:30 PM (Ludhiana, Punjab)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCallbackOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sapphire/20 border border-sapphire/50 text-xs font-semibold text-white hover:border-gold transition-colors"
            >
              <PhoneCall className="w-4 h-4 text-gold" />
              Call me back in 10 minutes
            </button>
          </div>

          <div className="lg:col-span-7">
            <form
              onSubmit={handleQuickContact}
              className="glass-card rounded-2xl p-6 sm:p-8 space-y-4"
            >
              <h3 className="font-serif text-2xl font-bold text-white">
                Send a Brief Enquiry
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  required
                  type="text"
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  placeholder="Full Name"
                  className="rounded-xl bg-obsidian/80 border border-white/15 px-4 py-3 text-sm text-white focus:border-gold focus:outline-none"
                />
                <input
                  required
                  type="tel"
                  value={cPhone}
                  onChange={(e) => setCPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="rounded-xl bg-obsidian/80 border border-white/15 px-4 py-3 text-sm text-white focus:border-gold focus:outline-none"
                />
              </div>
              <input
                required
                type="email"
                value={cEmail}
                onChange={(e) => setCEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full rounded-xl bg-obsidian/80 border border-white/15 px-4 py-3 text-sm text-white focus:border-gold focus:outline-none"
              />
              <textarea
                required
                rows={4}
                value={cMsg}
                onChange={(e) => setCMsg(e.target.value)}
                placeholder="Briefly describe your tax, GST, or compliance requirement..."
                className="w-full rounded-xl bg-obsidian/80 border border-white/15 px-4 py-3 text-sm text-white focus:border-gold focus:outline-none"
              />
              <label className="flex items-start gap-2.5 text-xs text-mutedText cursor-pointer">
                <input
                  type="checkbox"
                  checked={cConsent}
                  onChange={(e) => setCConsent(e.target.checked)}
                  className="mt-1 accent-sapphire"
                />
                <span>
                  {t.dpdpConsent} {t.bciNotice}
                </span>
              </label>

              {cStatus === "sent" && (
                <p className="text-xs text-emerald-400">
                  Enquiry recorded. You can also track queries via Ask a Query.
                </p>
              )}
              {cStatus === "error" && (
                <p className="text-xs text-red-400">
                  Please complete all fields and accept the privacy consent.
                </p>
              )}

              <MagneticButton
                type="submit"
                variant="primary"
                disabled={cStatus === "sending"}
              >
                {cStatus === "sending" ? "Submitting..." : "Submit Enquiry"}
              </MagneticButton>
            </form>
          </div>
        </div>
      </section>

      {/* Smart Gentle Prompt */}
      {gentlePrompt && (
        <div className="fixed bottom-20 left-5 z-40 max-w-xs glass-card rounded-2xl p-4 border-gold/40 shadow-gold-glow">
          <button
            type="button"
            onClick={() => setGentlePrompt(false)}
            aria-label="Dismiss prompt"
            className="absolute top-2.5 right-2.5 text-mutedText hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="text-xs font-semibold text-gold">
            Free 2-Minute Check
          </p>
          <p className="text-xs text-white mt-1">
            Check your GST &amp; Income Tax readiness with our Compliance Health
            Check.
          </p>
          <Link
            href="/health-check"
            onClick={() => setGentlePrompt(false)}
            className="inline-block mt-2.5 text-xs font-semibold text-gold hover:underline"
          >
            Start Health Check →
          </Link>
        </div>
      )}

      {/* 10-Minute Callback Modal */}
      {callbackOpen && (
        <div
          className="fixed inset-0 z-[85] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm glass-card rounded-2xl p-6 space-y-4 border-sapphire/40">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl text-white font-bold">
                Request a 10-Minute Callback
              </h3>
              <button
                type="button"
                onClick={() => setCallbackOpen(false)}
                className="text-mutedText hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {callbackSent ? (
              <p className="text-xs text-emerald-400">
                Callback request received. During office hours ([HOURS]), our
                desk will call you within 10 minutes.
              </p>
            ) : (
              <form onSubmit={handleCallbackSubmit} className="space-y-3">
                <input
                  required
                  type="text"
                  value={callbackName}
                  onChange={(e) => setCallbackName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full rounded-lg bg-obsidian border border-white/15 px-3 py-2 text-xs text-white"
                />
                <input
                  required
                  type="tel"
                  value={callbackPhone}
                  onChange={(e) => setCallbackPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="w-full rounded-lg bg-obsidian border border-white/15 px-3 py-2 text-xs text-white"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gold-gradient text-obsidian text-xs font-semibold"
                >
                  Notify Office Now
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
