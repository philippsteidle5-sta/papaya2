import React, { useState } from "react";
import {
  X,
  Printer,
  Download,
  Check,
  Copy,
  FileText,
  ShieldCheck,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import {
  InvoiceItemData,
  computeInvoiceBreakdown,
  formatInvoiceNumber,
  getInvoiceFeatures,
  downloadStyledInvoiceHtml,
  openPrintableInvoice,
} from "../utils/invoiceGenerator";
import { useTheme } from "../utils/themeStore";

interface InvoiceViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceItemData | null;
  profileInfo?: {
    name?: string;
    email?: string;
    slot?: number | string;
    token?: string;
  };
  lang?: "de" | "en";
}

export const InvoiceViewerModal: React.FC<InvoiceViewerModalProps> = ({
  isOpen,
  onClose,
  invoice,
  profileInfo,
  lang = "de",
}) => {
  const { isModern } = useTheme();
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedNum, setCopiedNum] = useState(false);

  if (!isOpen || !invoice) return null;

  const isEn = lang === "en";
  const { net, tax, gross } = computeInvoiceBreakdown(invoice.amount, invoice.netAmount, invoice.taxAmount);
  const invoiceNum = formatInvoiceNumber(invoice.number);
  const recipientName = invoice.recipientName || profileInfo?.name || "Philipp Steidle";
  const recipientEmail = invoice.recipientEmail || profileInfo?.email || "philippsteidle5@gmail.com";
  const recipientSlot = invoice.recipientSlot !== undefined ? invoice.recipientSlot : (profileInfo?.slot !== undefined ? profileInfo.slot : 1);
  const quantumToken = invoice.quantumToken || profileInfo?.token || "MZ-SUPERADMIN-FULLCORE-ROOT-9988";
  const features = invoice.features || getInvoiceFeatures(invoice.planName);

  let cleanPlanTitle = invoice.planName;
  if (!cleanPlanTitle.toLowerCase().startsWith("1x")) {
    cleanPlanTitle = `1x ${cleanPlanTitle}`;
  }
  if (!cleanPlanTitle.includes("Plan")) {
    cleanPlanTitle = `${cleanPlanTitle} Plan (monthly)`;
  }

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(invoiceNum);
    setCopiedNum(true);
    setTimeout(() => setCopiedNum(false), 2000);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(quantumToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className={`relative w-full max-w-3xl my-auto rounded-2xl flex flex-col overflow-hidden transition-all ${
        isModern
          ? "bg-zinc-950 border border-zinc-800 shadow-2xl text-zinc-100"
          : "bg-[#060b18] border border-cyan-500/30 shadow-[0_0_50px_rgba(0,240,255,0.15)] text-slate-100"
      }`}>
        {/* Top Floating Control Bar */}
        <div className={`flex items-center justify-between px-5 py-3.5 border-b ${
          isModern
            ? "border-zinc-800 bg-zinc-900"
            : "border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-slate-950/80"
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg border ${
              isModern
                ? "bg-zinc-800 border-zinc-700 text-zinc-200"
                : "bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.3)]"
            }`}>
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs uppercase ${
                  isModern ? "text-zinc-100 font-sans font-bold tracking-wider" : "font-mono font-black tracking-wider text-white"
                }`}>
                  {isEn ? "S.Y.N.T.A.X. INVOICE VIEWER" : "S.Y.N.T.A.X. RECHNUNGSVORSCHAU"}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                  isModern
                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                    : "bg-emerald-500/20 border border-emerald-400/40 text-emerald-300"
                }`}>
                  {invoice.status}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => openPrintableInvoice(invoice, profileInfo)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer active:scale-95 ${
                isModern
                  ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 shadow-sm"
                  : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]"
              }`}
              title={isEn ? "Print or Save as PDF" : "Drucken oder als PDF speichern"}
            >
              <Printer className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">{isEn ? "Print / PDF" : "Drucken / PDF"}</span>
            </button>

            <button
              onClick={() => downloadStyledInvoiceHtml(invoice, profileInfo)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer active:scale-95 ${
                isModern
                  ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-md border border-red-500/30"
                  : "bg-slate-900 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-400/60 text-cyan-300 font-mono font-bold"
              }`}
              title={isEn ? "Download standalone file" : "Datei herunterladen"}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isEn ? "Download" : "Herunterladen"}</span>
            </button>

            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                isModern
                  ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border-zinc-700"
                  : "bg-slate-900/80 hover:bg-slate-800 border-slate-700 hover:border-slate-600 text-slate-400 hover:text-white"
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Invoice Body Canvas (Matches PDF screenshot layout identically) */}
        <div className="p-6 sm:p-10 max-h-[80vh] overflow-y-auto custom-scrollbar space-y-7">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className={`text-xl sm:text-2xl font-bold tracking-wide ${
                isModern
                  ? "text-zinc-100 font-sans"
                  : "font-black text-cyan-400 drop-shadow-[0_0_12px_rgba(0,240,255,0.35)]"
              }`}>
                S.Y.N.T.A.X. SOVEREIGN OS
              </h1>
              <p className={`mt-1 font-medium uppercase ${
                isModern
                  ? "font-sans text-xs text-zinc-400 tracking-wider"
                  : "font-mono text-[9.5px] sm:text-[10px] tracking-[0.22em] text-slate-400"
              }`}>
                GETSYNTAX.AI MULTI-AGENT QUANTUM COMPUTING PLATFORM
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
                RECHNUNG
              </h2>
              <div className="flex items-center sm:justify-end gap-1.5">
                <span className={`font-mono text-xs sm:text-sm font-bold tracking-wider ${
                  isModern ? "text-zinc-100" : "text-cyan-400"
                }`}>
                  {invoiceNum}
                </span>
                <button
                  onClick={handleCopyNumber}
                  className={`transition ${isModern ? "text-zinc-400 hover:text-zinc-200" : "text-slate-500 hover:text-cyan-300"}`}
                  title="Rechnungsnummer kopieren"
                >
                  {copiedNum ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold tracking-wider border ${
                  isModern
                    ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                    : "border-emerald-500/50 bg-emerald-950/40 text-emerald-400"
                }`}>
                  {invoice.status === "PAID" ? "BEZAHLT / PAID" : "OFFEN / PENDING"}
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className={`h-px w-full ${
            isModern ? "bg-zinc-800" : "bg-gradient-to-r from-cyan-500/30 via-slate-800 to-cyan-500/20"
          }`} />

          {/* 2-Column Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Recipient Box */}
            <div className={`p-4 sm:p-5 rounded-xl border shadow-sm space-y-2 ${
              isModern ? "bg-zinc-900/80 border-zinc-800" : "bg-[#070d1e] border-slate-800/90"
            }`}>
              <div className={`text-[10px] font-bold tracking-widest uppercase ${
                isModern ? "font-sans text-zinc-400" : "font-mono text-slate-400"
              }`}>
                LEISTUNGSEMPFÄNGER
              </div>
              <div className="text-sm font-bold text-white">
                {recipientName}
              </div>
              <div className={`text-xs ${isModern ? "text-zinc-300" : "text-slate-300"}`}>
                {recipientEmail}
              </div>
              <div className={`text-xs ${isModern ? "text-zinc-400 font-sans" : "font-mono text-slate-400"}`}>
                Account Slot: #{recipientSlot}
              </div>
            </div>

            {/* Invoice Details Box */}
            <div className={`p-4 sm:p-5 rounded-xl border shadow-sm space-y-1.5 ${
              isModern ? "bg-zinc-900/80 border-zinc-800" : "bg-[#070d1e] border-slate-800/90"
            }`}>
              <div className={`text-[10px] font-bold tracking-widest uppercase mb-2 ${
                isModern ? "font-sans text-zinc-400" : "font-mono text-slate-400"
              }`}>
                RECHNUNGSDETAILS
              </div>
              <div className={`text-xs ${isModern ? "text-zinc-300" : "text-slate-300"}`}>
                <span className={isModern ? "text-zinc-400" : "text-slate-400"}>Datum:</span> {invoice.date}
              </div>
              <div className={`text-xs ${isModern ? "text-zinc-300" : "text-slate-300"}`}>
                <span className={isModern ? "text-zinc-400" : "text-slate-400"}>Zahlungsmethode:</span> {invoice.paymentMethodLabel.includes("PayPal") ? "PayPal" : invoice.paymentMethodLabel}
              </div>
              {recipientEmail && (
                <div className={`text-xs ${isModern ? "text-zinc-400 font-sans" : "text-slate-400 font-mono"}`}>
                  ({recipientEmail})
                </div>
              )}
              <div className="pt-1.5">
                <div className={`text-[11px] mb-0.5 ${isModern ? "text-zinc-400 font-sans" : "text-slate-400"}`}>Quantum Token:</div>
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded border ${
                  isModern ? "bg-zinc-950 border-zinc-800" : "bg-slate-950/80 border-slate-800"
                }`}>
                  <span className={`font-mono text-[11px] font-bold break-all flex-1 ${
                    isModern ? "text-zinc-200" : "text-cyan-400"
                  }`}>
                    {quantumToken}
                  </span>
                  <button
                    onClick={handleCopyToken}
                    className={`transition ${isModern ? "text-zinc-400 hover:text-zinc-200" : "text-slate-500 hover:text-cyan-300"}`}
                    title="Token kopieren"
                  >
                    {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Positions Table */}
          <div className={`rounded-xl border overflow-hidden ${isModern ? "border-zinc-800" : "border-slate-800"}`}>
            <div className={`flex items-center justify-between px-4 py-2.5 border-b uppercase ${
              isModern
                ? "bg-zinc-900 border-zinc-800 text-[11px] font-semibold tracking-wider text-zinc-400 font-sans"
                : "bg-[#081126] border-slate-800 font-mono text-[10px] font-bold tracking-widest text-slate-400"
            }`}>
              <span>POSITION / BESCHREIBUNG</span>
              <span>BETRAG (NETTO)</span>
            </div>

            <div className={`p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start gap-4 ${
              isModern ? "bg-zinc-950/60" : "bg-[#060b18]"
            }`}>
              <div className="space-y-2">
                <div className="text-sm font-bold text-white">
                  {cleanPlanTitle}
                </div>
                <ul className={`space-y-1 text-xs ${isModern ? "text-zinc-400" : "text-slate-400"}`}>
                  {features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className={`font-bold ${isModern ? "text-red-400" : "text-cyan-400"}`}>•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`text-sm font-bold text-white whitespace-nowrap self-end sm:self-start ${
                isModern ? "font-sans" : "font-mono"
              }`}>
                €{net.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Calculation Breakdown Block */}
          <div className="flex justify-end">
            <div className="w-full sm:w-80 space-y-2">
              <div className={`flex items-center justify-between text-xs ${isModern ? "text-zinc-400 font-sans" : "font-mono text-slate-400"}`}>
                <span>Gesamtbetrag (Netto):</span>
                <span className={`font-bold ${isModern ? "text-zinc-200" : "text-slate-200"}`}>€{net.toFixed(2)}</span>
              </div>
              <div className={`flex items-center justify-between text-xs ${isModern ? "text-zinc-400 font-sans" : "font-mono text-slate-400"}`}>
                <span>19% MwSt. / VAT:</span>
                <span className={`font-bold ${isModern ? "text-zinc-200" : "text-slate-200"}`}>€{tax.toFixed(2)}</span>
              </div>
              <div className={`h-px w-full my-1 ${isModern ? "bg-zinc-800" : "bg-slate-800"}`} />
              <div className="flex items-center justify-between pt-1">
                <span className={`text-sm font-bold ${isModern ? "text-zinc-100" : "text-cyan-400"}`}>Gesamtsumme:</span>
                <span className={`text-lg font-bold ${
                  isModern
                    ? "font-sans text-zinc-100 font-bold"
                    : "font-mono font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                }`}>
                  €{gross.toFixed(2)} {invoice.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className={`text-center pt-6 border-t space-y-1.5 ${isModern ? "border-zinc-800" : "border-slate-800/80"}`}>
            <p className={`text-xs ${isModern ? "text-zinc-400" : "text-slate-400"}`}>
              Transaktion erfolgreich verbucht. Vielen Dank für dein Vertrauen in S.Y.N.T.A.X.
            </p>
            <p className={`text-[10.5px] ${isModern ? "text-zinc-500 font-sans tracking-normal" : "font-mono text-slate-500 tracking-wider"}`}>
              Getsyntax.ai • Quantum Core Infrastructure • 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
