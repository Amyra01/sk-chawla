import Link from "next/link";
import { Scale, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full glass-card rounded-2xl p-8 border-sapphire/40 space-y-5 text-center">
        <div className="w-12 h-12 mx-auto rounded-xl bg-sapphire/15 border border-sapphire/40 flex items-center justify-center text-gold">
          <Scale className="w-6 h-6" />
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-gold">
          HTTP 404 • NOTICE NOT FOUND
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
          This Page Could Not Be Located on Record
        </h1>
        <p className="text-sm text-mutedText leading-relaxed">
          The requested URL or statutory reference does not exist or may have
          been moved. Please return to the main chamber or use{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-obsidian border border-white/15 text-xs text-white">
            Ctrl+K
          </kbd>{" "}
          to search.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-gradient text-obsidian text-sm font-semibold shadow-gold-glow"
          >
            <ArrowLeft className="w-4 h-4" /> Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
