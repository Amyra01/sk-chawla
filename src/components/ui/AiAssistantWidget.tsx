"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, X, Send, Sparkles, PhoneCall } from "lucide-react";

interface ChatMsg {
  role: "user" | "assistant";
  text: string;
}

export default function AiAssistantWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      text: "Hello! I can help with general questions about Mr. Sunil Chawla's tax & legal services, required documents, or booking a consultation. Note: I do not provide case-specific legal advice.",
    },
  ]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            data.reply ||
            "Please use our Ask a Query form or Book a Consultation for personalised assistance.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Unable to reach assistant right now. You can submit a query directly via Ask a Query.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[340px] sm:w-[380px] glass-card rounded-2xl overflow-hidden border-sapphire/40 shadow-gold-glow flex flex-col max-h-[500px]">
          <div className="px-4 py-3 bg-obsidian/90 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold" />
              <div>
                <p className="text-xs font-semibold text-white">
                  Practice Information Assistant
                </p>
                <p className="text-[10px] text-mutedText">
                  General guidance only • Not legal advice
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="text-mutedText hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl leading-relaxed ${
                  m.role === "user"
                    ? "bg-sapphire/20 border border-sapphire/40 text-white ml-8"
                    : "bg-obsidian/80 border border-white/10 text-mutedText mr-6"
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="p-3 rounded-xl bg-obsidian/80 border border-white/10 text-gold mr-10">
                Thinking...
              </div>
            )}
          </div>

          <div className="px-3.5 py-2 bg-obsidian/70 border-t border-white/10 flex items-center justify-between text-[11px]">
            <Link href="/ask-query" className="text-gold hover:underline">
              Ask a Query →
            </Link>
            <Link href="/book" className="text-white hover:text-gold">
              Book Consultation →
            </Link>
          </div>

          <form
            onSubmit={sendMessage}
            className="p-3 bg-obsidian/95 border-t border-white/10 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about services, documents, booking..."
              className="flex-1 bg-charcoal border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
            />
            <button
              type="submit"
              disabled={loading}
              aria-label="Send message"
              className="p-2 rounded-lg bg-gold-gradient text-obsidian"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      <div data-tour="assistant" className="flex items-center gap-2.5">
        <a
          href="https://wa.me/919872355007?text=Hello%20Sunil%20Chawla%20%26%20Associates"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp contact"
          className="h-11 px-3.5 rounded-full bg-charcoal/90 border border-sapphire/40 text-white text-xs font-medium flex items-center gap-2 shadow-lg hover:border-gold transition-colors"
        >
          <PhoneCall className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">WhatsApp</span>
        </a>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label="Toggle AI assistant"
          className="w-12 h-12 rounded-full bg-gold-gradient text-obsidian flex items-center justify-center shadow-gold-glow hover:shadow-sapphire-glow transition-all"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
