"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  CalendarClock,
  Globe,
  HelpCircle,
} from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { cn } from "@/lib/utils";
import { FALLBACK_COMPLIANCE_DATES } from "@/lib/seed-fallback";
import { startSiteTour } from "@/components/ui/SiteTour";

const NAV_LINKS = [
  { href: "/#about", id: "about", label: "About" },
  { href: "/#services", id: "services", label: "Services" },
  { href: "/#journey", id: "journey", label: "Journey" },
  { href: "/#clients", id: "clients", label: "Clients" },
  { href: "/insights", id: "insights", label: "Insights" },
  { href: "/#contact", id: "contact", label: "Contact" },
];

export default function Navbar() {
  const {
    locale,
    setLocale,
    t,
    cart,
    setCartOpen,
    setCmdOpen,
    triggerEasterEgg,
  } = useApp();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 36);
      if (pathname === "/") {
        const triggerY = window.innerHeight * 0.45;
        let current = "";
        for (const item of NAV_LINKS) {
          const el = document.getElementById(item.id);
          if (el && el.getBoundingClientRect().top <= triggerY) {
            current = item.id;
          }
        }
        setActiveId(current);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const totalItems = cart.reduce((acc, i) => acc + i.quantity, 0);

  // Next GST due date calculation
  const nextDue = FALLBACK_COMPLIANCE_DATES[2] || FALLBACK_COMPLIANCE_DATES[0];
  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(nextDue.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
  );

  const handleLogoClick = () => {
    const next = logoClicks + 1;
    if (next >= 5) {
      setLogoClicks(0);
      triggerEasterEgg();
    } else {
      setLogoClicks(next);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div
        className={cn(
          "transition-all duration-300 border-b border-sapphire/15 backdrop-blur-xl",
          scrolled
            ? "bg-obsidian/90 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.65)]"
            : "bg-obsidian/70 py-4"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          <Link
            href="/"
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <span className="w-8 h-8 rounded-lg bg-sapphire/15 border border-sapphire/50 flex items-center justify-center font-serif font-bold text-white text-sm group-hover:border-gold transition-colors">
              SC
            </span>
            <div className="leading-tight">
              <span className="font-serif text-sm sm:text-base font-semibold tracking-wider text-white">
                {t.brand}
              </span>
              <span className="hidden sm:inline-block text-sapphire mx-2">|</span>
              <span className="hidden sm:inline-block text-xs text-mutedText">
                {t.brandSub}
              </span>
            </div>
          </Link>

          <nav
            data-tour="nav-main"
            className="hidden lg:flex items-center gap-6"
            aria-label="Main"
          >
            {NAV_LINKS.map((item) => {
              const isActive =
                activeId === item.id || pathname.startsWith(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "relative text-xs uppercase tracking-widest transition-colors py-1",
                    isActive ? "text-white" : "text-mutedText hover:text-white"
                  )}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute left-0 right-0 -bottom-0.5 h-[2px] bg-gold-gradient rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={startSiteTour}
              aria-label="Website Guide"
              title={locale === "hi" ? "वेबसाइट गाइड" : "Website Guide"}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-charcoal/80 border border-white/10 text-xs text-gold hover:border-gold/60 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              type="button"
              data-tour="search"
              onClick={() => setCmdOpen(true)}
              aria-label="Search (Ctrl+K)"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-charcoal/80 border border-white/10 text-xs text-mutedText hover:text-white hover:border-sapphire/50 transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-gold" />
              <span className="hidden xl:inline">⌘K</span>
            </button>

            <button
              type="button"
              data-tour="language"
              onClick={() => setLocale(locale === "en" ? "hi" : "en")}
              aria-label="Toggle language"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-charcoal/80 border border-white/10 text-xs text-mutedText hover:text-white hover:border-sapphire/50 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-sapphire" />
              <span>{locale === "en" ? "हिं" : "EN"}</span>
            </button>

            <Link
              href="/ask-query"
              data-tour="ask-query"
              className="hidden md:inline-flex text-xs font-medium text-mutedText hover:text-white px-2.5 py-1.5 transition-colors"
            >
              {t.askQuery}
            </Link>

            <Link
              href="/portal"
              data-tour="portal"
              className="hidden md:inline-flex text-xs font-medium text-white/90 hover:text-gold px-2.5 py-1.5 transition-colors"
            >
              {t.clientLogin}
            </Link>

            {totalItems > 0 && (
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                aria-label="Open service cart"
                className="relative p-2 rounded-lg bg-charcoal border border-sapphire/40 text-white hover:border-gold transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gold-gradient text-[10px] font-bold flex items-center justify-center text-obsidian">
                  {totalItems}
                </span>
              </button>
            )}

            <Link
              href="/book"
              data-tour="book"
              className="inline-flex items-center px-3.5 py-2 rounded-xl bg-gold-gradient text-obsidian text-xs font-semibold shadow-gold-glow hover:shadow-sapphire-glow transition-all"
            >
              {t.bookConsultation}
            </Link>

            <button
              type="button"
              data-tour="menu"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              className="lg:hidden p-2 rounded-lg text-white hover:bg-white/5"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-white/10 bg-obsidian/95 px-4 py-4 space-y-2">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-sm text-mutedText hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-white/10 flex flex-wrap gap-3">
              <Link
                href="/ask-query"
                onClick={() => setMobileOpen(false)}
                className="text-sm text-gold"
              >
                {t.askQuery}
              </Link>
              <Link
                href="/portal"
                onClick={() => setMobileOpen(false)}
                className="text-sm text-white"
              >
                {t.clientLogin}
              </Link>
              <Link
                href="/tools"
                onClick={() => setMobileOpen(false)}
                className="text-sm text-mutedText"
              >
                Free Tax Tools
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Live Due-Date Ticker */}
      <div
        data-tour="ticker"
        className="bg-charcoal/90 border-b border-sapphire/15 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-center sm:justify-between text-[11px] text-mutedText">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-3.5 h-3.5 text-gold shrink-0" />
            <span>
              Next GST due date:{" "}
              <strong className="text-white">{nextDue.form_code}</strong> in{" "}
              <strong className="text-gold">{daysLeft} days</strong> (
              {nextDue.due_date})
            </span>
          </div>
          <Link
            href="/compliance-calendar"
            className="hidden sm:inline-flex text-gold hover:underline font-medium"
          >
            Set a reminder →
          </Link>
        </div>
      </div>
    </header>
  );
}
