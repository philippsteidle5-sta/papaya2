import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, Check } from "lucide-react";
import { CommunicationScope } from "../types";

interface AgentModeSegmentControlProps {
  currentScope: CommunicationScope;
  onSelectScope: (scope: CommunicationScope) => void;
  lang?: "de" | "en";
  compact?: boolean;
}

export const AgentModeSegmentControl: React.FC<AgentModeSegmentControlProps> = ({
  currentScope,
  onSelectScope,
  lang = "de",
  compact = false,
}) => {
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [skipWarningSession, setSkipWarningSession] = useState(false);

  const isEn = lang === "en";

  const handleButtonClick = (modeKey: "SINGLE" | "THE_BIG_3" | "ALL") => {
    if (modeKey === "ALL" && currentScope !== "ALL" && !skipWarningSession) {
      setShowWarningModal(true);
    } else {
      onSelectScope(modeKey);
    }
  };

  const handleConfirmAll8 = () => {
    onSelectScope("ALL");
    setShowWarningModal(false);
  };

  const modalContent = showWarningModal && typeof document !== "undefined" ? (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="agent-modal-title"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in select-none"
      onClick={() => setShowWarningModal(false)}
    >
      <div
        className="w-full max-w-[410px] max-h-[90vh] my-auto flex flex-col bg-[#131115] border border-[#2a262e] rounded-[22px] p-5 sm:p-6 text-[#f4f0ea] shadow-[0_25px_80px_rgba(0,0,0,0.8),0_0_50px_rgba(255,138,61,0.18)] relative animate-scaleUp overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          fontFamily: '"Bricolage Grotesque", system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Close Button in Header */}
        <button
          type="button"
          onClick={() => setShowWarningModal(false)}
          className="absolute top-4 right-4 text-[#9a94a0] hover:text-[#f4f0ea] p-1.5 rounded-lg hover:bg-white/[0.08] transition cursor-pointer"
          title={isEn ? "Close" : "Schließen"}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Bolt Icon */}
        <div
          className="w-10 h-10 rounded-[12px] bg-[#ff8a3d]/[0.14] text-[#ff8a3d] flex items-center justify-center mb-3.5"
          aria-hidden="true"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
          </svg>
        </div>

        {/* Title */}
        <h2 id="agent-modal-title" className="m-0 mb-2 text-[20px] font-bold tracking-[-0.015em] text-[#f4f0ea]">
          {isEn ? "Activate all 8 agents?" : "Alle 8 Agenten aktivieren?"}
        </h2>

        {/* Lead text */}
        <p className="m-0 text-[13.5px] leading-[1.55] text-[#9a94a0]">
          {isEn ? (
            <>
              Every message goes to all agents simultaneously. Your Gemini quota will be consumed{" "}
              <b className="text-[#f4f0ea] font-medium">8 times faster</b>. For normal conversations, "Single" or "Big 3" is recommended.
            </>
          ) : (
            <>
              Jede Nachricht geht an alle Agenten gleichzeitig. Dein Gemini-Kontingent ist dadurch{" "}
              <b className="text-[#f4f0ea] font-medium">8-mal schneller</b> verbraucht. Für normale Gespräche reicht „Einzeln“ oder „Big 3“.
            </>
          )}
        </p>

        {/* Resource Meter Bars */}
        <div className="grid gap-3 my-5" aria-label="Verbrauch je Modus">
          <div>
            <div className="flex justify-between text-[12.5px] mb-1">
              <span className="text-[#f4f0ea]">{isEn ? "Single" : "Einzeln"}</span>
              <span className="text-[#9a94a0]">1x</span>
            </div>
            <div className="h-[5px] rounded-full bg-[#19161c] overflow-hidden">
              <div className="h-full rounded-full bg-[#5fd68a] w-[12.5%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[12.5px] mb-1">
              <span className="text-[#f4f0ea]">Big 3</span>
              <span className="text-[#9a94a0]">3x</span>
            </div>
            <div className="h-[5px] rounded-full bg-[#19161c] overflow-hidden">
              <div className="h-full rounded-full bg-[#ff8a3d] w-[37.5%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[12.5px] mb-1 font-bold">
              <span className="text-[#f4f0ea]">{isEn ? "All 8" : "Alle 8"}</span>
              <span className="text-[#ff5a36] font-medium">8x</span>
            </div>
            <div className="h-[5px] rounded-full bg-[#19161c] overflow-hidden">
              <div className="h-full rounded-full bg-[#ff5a36] w-full" />
            </div>
          </div>
        </div>

        {/* Checkbox: In dieser Sitzung nicht mehr warnen */}
        <label className="flex items-center gap-2.5 text-[12.5px] text-[#9a94a0] cursor-pointer select-none mb-5 hover:text-[#f4f0ea] transition">
          <input
            type="checkbox"
            checked={skipWarningSession}
            onChange={(e) => setSkipWarningSession(e.target.checked)}
            className="w-4 h-4 accent-[#ff8a3d] cursor-pointer rounded"
          />
          <span>{isEn ? "Don't warn me again this session" : "In dieser Sitzung nicht mehr warnen"}</span>
        </label>

        {/* Actions (Prominent OK Button) */}
        <div className="flex gap-2.5 mt-auto pt-2">
          <button
            type="button"
            onClick={handleConfirmAll8}
            className="flex-1 py-2.5 px-4 rounded-[11px] bg-[#ff8a3d] hover:bg-[#ff9a54] text-[#1b1006] text-[13.5px] font-bold cursor-pointer transition border border-[#ff8a3d] filter hover:brightness-105 active:scale-95 flex items-center justify-center gap-1.5 shadow-[0_4px_16px_rgba(255,138,61,0.35)]"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>OK, {isEn ? "Activate" : "Aktivieren"}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowWarningModal(false)}
            className="py-2.5 px-4 rounded-[11px] border border-[#2a262e] bg-transparent hover:bg-white/[0.06] text-[#f4f0ea] text-[13.5px] font-medium cursor-pointer transition active:scale-95 text-center"
          >
            {isEn ? "Cancel" : "Abbrechen"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* Segmented Control strictly based on user's PapayaOS Design */}
      <div
        className={`flex items-center bg-[#0a090c] border border-[#2a262e] rounded-[12px] p-[3px] gap-[3px] select-none ${
          compact ? "text-[12px]" : "text-[13px]"
        }`}
        role="group"
        aria-label={isEn ? "Agent Mode" : "Agenten-Modus"}
        style={{
          fontFamily: '"Bricolage Grotesque", system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Button 1: Einzeln */}
        <button
          type="button"
          onClick={() => handleButtonClick("SINGLE")}
          aria-pressed={currentScope === "SINGLE"}
          className={`flex-1 px-3 py-1.5 rounded-[9px] font-medium transition-all duration-150 cursor-pointer border-0 ${
            currentScope === "SINGLE"
              ? "bg-[#19161c] text-[#f4f0ea] shadow-[inset_0_0_0_1px_#2a262e]"
              : "bg-transparent text-[#9a94a0] hover:text-[#f4f0ea]"
          }`}
          title={isEn ? "Single agent focus (1x API load)" : "Einzelner Agent (1x API Last)"}
        >
          {isEn ? "Single" : "Einzeln"}
        </button>

        {/* Button 2: Big 3 */}
        <button
          type="button"
          onClick={() => handleButtonClick("THE_BIG_3")}
          aria-pressed={currentScope === "THE_BIG_3"}
          className={`flex-1 px-3 py-1.5 rounded-[9px] font-medium transition-all duration-150 cursor-pointer border-0 ${
            currentScope === "THE_BIG_3"
              ? "bg-[#19161c] text-[#f4f0ea] shadow-[inset_0_0_0_1px_#ff8a3d] text-[#ff8a3d]"
              : "bg-transparent text-[#9a94a0] hover:text-[#f4f0ea]"
          }`}
          title={isEn ? "The Big 3 Tri-Core (3x API load)" : "Big 3 Tri-Core (3x API Last)"}
        >
          Big 3
        </button>

        {/* Button 3: Alle 8 */}
        <button
          type="button"
          onClick={() => handleButtonClick("ALL")}
          aria-pressed={currentScope === "ALL"}
          className={`flex-1 px-3 py-1.5 rounded-[9px] font-medium transition-all duration-150 cursor-pointer border-0 ${
            currentScope === "ALL"
              ? "bg-[#19161c] text-[#ff5a36] shadow-[inset_0_0_0_1px_#ff5a36] font-bold"
              : "bg-transparent text-[#9a94a0] hover:text-[#f4f0ea]"
          }`}
          title={isEn ? "All 8 Agents Matrix (8x API load)" : "Alle 8 Agenten Matrix (8x API Last)"}
        >
          {isEn ? "All 8" : "Alle 8"}
        </button>
      </div>

      {/* Render Dialog via React Portal into document.body so it is ALWAYS viewport centered and not trapped in transformed containers */}
      {modalContent && createPortal(modalContent, document.body)}
    </>
  );
};
