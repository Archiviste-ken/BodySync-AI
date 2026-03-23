"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Activity, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AICoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Protocol initialized. I've analyzed your BCA data and generated your plan. What adjustments or questions do you have?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      const data = await res.json();

      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
      }
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative mx-auto flex h-[calc(100vh-5rem)] max-w-4xl flex-col py-6"
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 14, -8, 0], y: [0, -10, 8, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/2 top-0 h-[320px] w-[540px] -translate-x-1/2 rounded-full bg-neon-green/[0.04] blur-[125px]"
        />
      </div>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-panel mb-5 flex shrink-0 items-center gap-3 border-b border-white/[0.06] px-4 pb-4 pt-3"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neon-green/10 border border-neon-green/15">
          <Activity className="h-5 w-5 text-neon-green" />
        </div>
        <div className="flex-1">
          <h1 className="font-heading text-xl font-bold text-white">
            BodySync <span className="text-gradient">AI Coach</span>
          </h1>
          <p className="text-xs text-gray-500">
            Real-time protocol adjustments
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-neon-green/15 bg-neon-green/5 px-3 py-1.5">
          <Sparkles className="h-3.5 w-3.5 text-neon-green" />
          <span className="text-xs font-medium text-neon-green">Online</span>
        </div>
      </motion.div>

      {/* ── Chat Area ── */}
      <div className="glass-panel relative mb-4 flex-1 space-y-5 overflow-y-auto p-4 md:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,240,252,0.08),transparent_45%)]" />
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`relative z-10 flex items-start gap-3 ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                  msg.role === "user"
                    ? "border-electric-blue/20 bg-electric-blue/10"
                    : "border-neon-green/20 bg-neon-green/10"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="h-4 w-4 text-electric-blue" />
                ) : (
                  <Bot className="h-4 w-4 text-neon-green" />
                )}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "rounded-tr-md bg-electric-blue/[0.08] text-white border border-electric-blue/10"
                    : "rounded-tl-md bg-white/[0.04] text-gray-200 border border-white/[0.06]"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 flex items-start gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-neon-green/20 bg-neon-green/10">
              <Bot className="h-4 w-4 text-neon-green" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-white/[0.06] bg-white/[0.04] px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-neon-green" />
              <span className="text-sm text-gray-300">Analyzing...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Area ── */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        onSubmit={sendMessage}
        className="relative shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your macros, swap an exercise..."
          className="glass-panel-hover w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] py-4 pl-5 pr-14 text-sm text-white outline-none backdrop-blur-xl transition-all placeholder:text-gray-500 focus:border-neon-green/30 focus:shadow-[0_0_20px_rgba(57,255,20,0.08)]"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl bg-gradient-to-r from-neon-green to-electric-blue text-black transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(57,255,20,0.25)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </motion.form>
    </motion.div>
  );
}
