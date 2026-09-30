import React, { useState } from "react";
import {
  Sparkles,
  Flame,
  Zap,
  Copy,
  Check,
  Send,
  RefreshCw,
  Hash,
  Lightbulb,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { ViralHookTemplate, SocialPlatform } from "./types";

interface AiHookStudioViewProps {
  platform: SocialPlatform;
  onApplyToComposer: (hook: string, caption: string, hashtags: string[]) => void;
}

const SAMPLE_HOOKS: Record<string, ViralHookTemplate[]> = {
  default: [
    {
      id: "hook-1",
      category: "provocative",
      label: "Contrarian / Disruptor",
      hookText: "Hör auf, deinen Code manuell zu schreiben – 95% der Entwickler machen ab jetzt diesen Fehler.",
      captionDraft: "Hör auf, deinen Code manuell zu schreiben – 95% der Entwickler machen ab jetzt diesen Fehler. Mit S.Y.N.T.A.X. Core orchestrieren wir 8 spezialisierte KI-Agenten synchron. Jeder übernimmt genau einen Part: Frontend, Backend, Testing und Deployment in Millisekunden. Was denkt ihr über den Wandel?",
      hashtags: ["#SYNTAXAI", "#CodingLife", "#WebDev", "#TechTok", "#FutureTech", "#AIRevolution"],
      score: 96,
      estimatedRetention: "92.4% Retention nach 3s",
    },
    {
      id: "hook-2",
      category: "curiosity",
      label: "The Curiosity Gap",
      hookText: "Ich habe eine KI gebaut, die schneller antwortet, als du tippen kannst – hier ist der Beweis.",
      captionDraft: "Ich habe eine KI gebaut, die schneller antwortet, als du tippen kannst – hier ist der Beweis. Durch direktes Streaming und Quantum Neural Routing liegt die Latenz bei unter 120ms. Schau dir die Live-Reaktion im Video an!",
      hashtags: ["#ArtificialIntelligence", "#TechDemo", "#LiveDemo", "#SpeedTest", "#Developer"],
      score: 93,
      estimatedRetention: "89.8% Retention nach 3s",
    },
    {
      id: "hook-3",
      category: "data",
      label: "Case Study / Proof",
      hookText: "Wie wir in 48 Stunden ein komplettes Spatial UI mit Hologrammen hochgezogen haben:",
      captionDraft: "Wie wir in 48 Stunden ein komplettes Spatial UI mit Hologrammen hochgezogen haben: Drei zentrale Architektur-Entscheidungen haben den Unterschied gemacht. Erstens: Modulare Micro-Widgets. Zweitens: Volle Canvas-Hardware-Beschleunigung. Drittens: S.Y.N.T.A.X. Multi-Core Engine. Speichere diesen Post für dein nächstes Projekt! 💾",
      hashtags: ["#BuildInPublic", "#StartupLife", "#UIUXDesign", "#SoftwareArchitecture", "#TechTrends"],
      score: 89,
      estimatedRetention: "86.5% Retention nach 3s",
    },
  ],
};

export const AiHookStudioView: React.FC<AiHookStudioViewProps> = ({
  platform,
  onApplyToComposer,
}) => {
  const [topicInput, setTopicInput] = useState("S.Y.N.T.A.X. Multi-Core KI-System & Entwickler-Zukunft");
  const [selectedStyle, setSelectedStyle] = useState<"viral" | "educational" | "story">("viral");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hooksList, setHooksList] = useState<ViralHookTemplate[]>(SAMPLE_HOOKS.default);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const topic = topicInput.trim() || "Künstliche Intelligenz";
      const newGenerated: ViralHookTemplate[] = [
        {
          id: `gen-${Date.now()}-1`,
          category: "provocative",
          label: "Extreme Contrarian",
          hookText: `Warum niemand über das wirkliche Problem bei ${topic} spricht:`,
          captionDraft: `Warum niemand über das wirkliche Problem bei ${topic} spricht:\n\nAlle fokussieren sich auf Standard-Tools, während echte Power-User bereits autonome Agenten-Schwärme nutzen. Wir haben das System getestet – hier sind die Ergebnisse, die dich überraschen werden. 👇`,
          hashtags: ["#SYNTAXAI", "#TrendingTech", "#TechTok", "#ViralKnowledge", `#${topic.replace(/\s+/g, "")}`],
          score: 97,
          estimatedRetention: "94.2% Hook-Stopp-Rate",
        },
        {
          id: `gen-${Date.now()}-2`,
          category: "curiosity",
          label: "The 3-Second Stopp",
          hookText: `Das verändert alles: So funktioniert ${topic} in der Praxis wirklich.`,
          captionDraft: `Das verändert alles: So funktioniert ${topic} in der Praxis wirklich.\n\nKein Hype, sondern echte Benchmarks und Live-Code. Speicher diesen Clip ab, bevor du dein nächstes Setup planst! 🔥`,
          hashtags: ["#CodingTips", "#SoftwareEngineer", "#AIWorkflow", "#ProductivityHack"],
          score: 91,
          estimatedRetention: "88.7% Hook-Stopp-Rate",
        },
        {
          id: `gen-${Date.now()}-3`,
          category: "data",
          label: "Direct High-Value",
          hookText: `3 Dinge, die ich gerne vor der Implementierung von ${topic} gewusst hätte:`,
          captionDraft: `3 Dinge, die ich gerne vor der Implementierung von ${topic} gewusst hätte:\n\n1. Latenz frisst Nutzervertrauen schneller als fehlende Features.\n2. Multimodale Prompts schlagen isolierte Abfragen um das 4-fache.\n3. Modulare Architektur spart dir hunderte Debugging-Stunden.\n\nTeile das mit deinem Team! 🚀`,
          hashtags: ["#TechEducation", "#Programming", "#LearnToCode", "#MatrixAI"],
          score: 88,
          estimatedRetention: "85.9% Hook-Stopp-Rate",
        },
      ];
      setHooksList(newGenerated);
      setIsGenerating(false);
    }, 800);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-200 p-4 space-y-4 overflow-y-auto custom-scrollbar font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              S.Y.N.T.A.X. Viral Hook & Script Lab
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            KI-optimierte Hooks für maximale Retention, FYP-Durchdringung und organische Klicks
          </p>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Algorithmus Ziel: &gt;90% 3s-Stopp</span>
        </div>
      </div>

      {/* Generator Prompt Bar */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            Dein Thema, Feature oder Projekt-Idee:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="z.B. AI Code Generation, Voice Assistant, Spatial UI..."
              className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleGenerate();
              }}
            />

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold text-xs cursor-pointer transition flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 flex-shrink-0"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>{isGenerating ? "Berechne..." : "Viral Hooks Generieren"}</span>
            </button>
          </div>
        </div>

        {/* Style Selector Chips */}
        <div className="flex items-center gap-2 text-xs pt-1">
          <span className="text-zinc-500 text-[11px]">Hook-Archetyp:</span>
          <button
            onClick={() => setSelectedStyle("viral")}
            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium transition ${
              selectedStyle === "viral" ? "bg-purple-500/20 text-purple-300 border border-purple-500/40" : "text-zinc-400 hover:text-white"
            }`}
          >
            🔥 High Virality (FYP)
          </button>
          <button
            onClick={() => setSelectedStyle("educational")}
            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium transition ${
              selectedStyle === "educational" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-zinc-400 hover:text-white"
            }`}
          >
            🧠 Deep Value / Teach
          </button>
          <button
            onClick={() => setSelectedStyle("story")}
            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium transition ${
              selectedStyle === "story" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "text-zinc-400 hover:text-white"
            }`}
          >
            📖 Story / Behind the Scenes
          </button>
        </div>
      </div>

      {/* Generated Hooks Showcase */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Empfohlene Hooks & fertige Skript-Entwürfe
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {hooksList.map((item) => (
            <div
              key={item.id}
              className="bg-zinc-900/80 border border-zinc-800 hover:border-purple-500/40 rounded-2xl p-4 transition space-y-3 shadow-sm"
            >
              {/* Card Header with Score */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10.5px] font-semibold">
                    {item.label}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {item.estimatedRetention}
                  </span>
                </div>

                <div className="flex items-center gap-1 font-mono text-xs text-amber-400 font-bold bg-zinc-950 px-2.5 py-1 rounded-xl border border-zinc-800">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Score {item.score}/100</span>
                </div>
              </div>

              {/* Hook Statement in prominent quote style */}
              <div className="p-3 rounded-xl bg-zinc-950/90 border border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">
                  1. Hook (Erste 3 Sekunden gesprochen / eingeblendet):
                </span>
                <p className="text-sm font-semibold text-white leading-snug">
                  "{item.hookText}"
                </p>
              </div>

              {/* Full Caption Draft */}
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block">
                  2. Caption & Call to Action (Post-Text):
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/50 p-2.5 rounded-xl border border-zinc-900 font-sans whitespace-pre-line">
                  {item.captionDraft}
                </p>
              </div>

              {/* Hashtag cluster */}
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase mr-1">
                  Tags:
                </span>
                {item.hashtags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-zinc-800 text-pink-300 text-[10.5px] font-mono font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-zinc-800/70 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(item.captionDraft, item.id)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Kopiert!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Text Kopieren</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onApplyToComposer(item.hookText, item.captionDraft, item.hashtags)}
                  className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>In Studio Composer übernehmen</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
