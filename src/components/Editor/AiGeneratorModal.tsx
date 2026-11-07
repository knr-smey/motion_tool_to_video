"use client";

import { useState } from "react";
import { Sparkles, Bot, X, Zap, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import type { SceneLayout } from "@/lib/segmentation";

export interface GeneratedSceneData {
  text: string;
  layout: SceneLayout;
  nodes?: [string, string, string];
  durationSeconds?: number;
}

interface AiGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyScenes: (script: string, scenes: GeneratedSceneData[]) => void;
}

const QUICK_PROMPTS = [
  { label: "⚡ How APIs Work", prompt: "Explain how REST API works between Client and Server with database", lang: "km" },
  { label: "🗄️ Database & Caching", prompt: "Explain how database queries and caching work", lang: "km" },
  { label: "🛡️ JWT Authentication", prompt: "Explain user login and JWT token authentication flow", lang: "km" },
  { label: "☁️ Cloud & Microservices", prompt: "Explain cloud computing and microservices architecture", lang: "km" },
  { label: "🇬🇧 API Explainer (EN)", prompt: "Explain how an API communicates between client and server", lang: "en" },
];

export function AiGeneratorModal({ isOpen, onClose, onApplyScenes }: AiGeneratorModalProps) {
  const [prompt, setPrompt] = useState("Explain how REST API works between Client and Server with database");
  const [language, setLanguage] = useState<"km" | "en">("km");
  const [source, setSource] = useState<"auto" | "local-ollama" | "builtin">("auto");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setStatusMessage("🧠 Analyzing concept & architecture flow...");

    try {
      setTimeout(() => {
        setStatusMessage("⚡ Generating nodes, connector lines & timing...");
      }, 700);

      const response = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          language,
          source: source === "local-ollama" ? "local-ollama" : "auto",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to generate video script.");
      }

      setStatusMessage("✨ Finalizing animated kinetic video!");
      setTimeout(() => {
        onApplyScenes(data.script, data.scenes);
        setIsLoading(false);
        onClose();
      }, 400);
    } catch (err) {
      setError((err as Error).message);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/20 text-accent ring-1 ring-accent/40 shadow-inner">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <span>AI Explainer Generator</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider bg-accent/15 text-accent px-2 py-0.5 rounded-full">
                  Smart Tech Flow
                </span>
              </h2>
              <p className="text-xs text-muted">
                Describe a topic. AI understands the architecture, connects nodes & generates the video.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg p-1.5 text-muted hover:bg-surface-raised hover:text-foreground transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 py-4">
          {/* Quick Prompt Pills */}
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">
              Popular Explainer Topics
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  disabled={isLoading}
                  onClick={() => {
                    setPrompt(p.prompt);
                    setLanguage(p.lang as "km" | "en");
                  }}
                  className="rounded-lg border border-border bg-surface-raised px-2.5 py-1 text-xs text-foreground hover:border-accent hover:text-accent transition disabled:opacity-40"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider">
              Topic or Raw Script
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
              rows={3}
              placeholder="e.g. Explain how REST API works between Client and Server, with animated connector lines and database query..."
              className="w-full resize-none rounded-xl border border-border bg-surface-raised p-3 text-sm font-[family-name:var(--font-poppins)] text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
            />
          </div>

          {/* Language and AI Engine Selector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted block mb-1.5">Language</label>
              <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-surface-raised p-1">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setLanguage("km")}
                  className={`rounded py-1.5 text-xs font-medium transition ${
                    language === "km"
                      ? "bg-accent text-accent-foreground font-semibold shadow-sm"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  🇰🇭 Khmer
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setLanguage("en")}
                  className={`rounded py-1.5 text-xs font-medium transition ${
                    language === "en"
                      ? "bg-accent text-accent-foreground font-semibold shadow-sm"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  🇬🇧 English
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted block mb-1.5">AI Engine</label>
              <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-surface-raised p-1">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setSource("auto")}
                  title="Instant smart explainer engine"
                  className={`rounded py-1.5 text-xs font-medium transition ${
                    source === "auto"
                      ? "bg-accent text-accent-foreground font-semibold shadow-sm"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  ⚡ Smart Built-in
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setSource("local-ollama")}
                  title="Local Ollama AI (localhost:11434)"
                  className={`rounded py-1.5 text-xs font-medium transition ${
                    source === "local-ollama"
                      ? "bg-accent text-accent-foreground font-semibold shadow-sm"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  🦙 Local Ollama
                </button>
              </div>
            </div>
          </div>

          {/* Status / Loading indicator */}
          {isLoading && (
            <div className="flex items-center gap-2.5 rounded-xl border border-accent/40 bg-accent/10 p-3 text-xs text-accent animate-pulse">
              <Loader2 size={16} className="animate-spin text-accent" />
              <span className="font-medium">{statusMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border/60">
          <div className="flex items-center gap-1.5 text-[11px] text-muted">
            <CheckCircle2 size={13} className="text-accent" />
            <span>Generates line connectors, icons & timing automatically</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground transition disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-bold text-accent-foreground shadow-lg shadow-accent/30 hover:opacity-95 transition disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Generate Explainer Video</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
