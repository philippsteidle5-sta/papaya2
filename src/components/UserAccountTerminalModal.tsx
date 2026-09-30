import React, { useState, useEffect } from "react";
import {
  User,
  Shield,
  ShieldCheck,
  CreditCard,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Trash2,
  Plus,
  Lock,
  Sparkles,
  ExternalLink,
  X,
  Mail,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  DollarSign,
  FileText,
  Key,
  Globe,
  ArrowRight,
  TrendingUp,
  Cpu,
  Activity,
  LogOut,
  ChevronRight,
  HelpCircle,
  QrCode,
  Layers,
  Wallet,
  Coins,
  Printer,
  Eye,
} from "lucide-react";
import {
  InvoiceViewerModal,
} from "./InvoiceViewerModal";
import { MatrixPricingCard } from "./MatrixPricingCard";
import {
  downloadStyledInvoiceHtml,
  openPrintableInvoice,
  computeInvoiceBreakdown,
  formatInvoiceNumber,
} from "../utils/invoiceGenerator";
import {
  FullUserProfileData,
  PaymentMethodItem,
  UserSubscriptionDetails,
  UserInvoiceItem,
  fetchUserTerminalProfile,
  updateUserPlan,
  cancelUserSubscription,
  reactivateUserSubscription,
  addUserPaymentMethod,
  removeUserPaymentMethod,
  setDefaultUserPaymentMethod,
  getCurrentUserEmail,
  setCurrentUserEmail,
  SUPERADMIN_EMAIL,
  isSuperAdminEmail,
} from "../utils/leadDatabase";
import { getDailyUsageMetrics } from "../utils/dailyUsageStore";
import { useTheme } from "../utils/themeStore";
import {
  playValidationBeep,
  playKeypressSound,
  playSuccessFanfare,
  playErrorTone,
  playClickSound,
} from "../utils/audioSynth";

export const SEPA_PLANS = {
  PRO_29: {
    id: "PRO_29" as const,
    name: "Pro Plan",
    eur: 29,
    badge: "Beliebt",
  },
  ENTERPRISE_99: {
    id: "ENTERPRISE_99" as const,
    name: "Enterprise Sovereign",
    eur: 99,
    badge: "Empfohlen (Alle 8 Cores)",
  },
  FLEET_299: {
    id: "FLEET_299" as const,
    name: "Dedicated Fleet",
    eur: 299,
    badge: "Maximaler Durchsatz",
  },
};

interface UserAccountTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchDashboard?: () => void;
  onOpenDailyUsage?: () => void;
  userEmail?: string;
  lang?: "de" | "en";
  initialTab?: "overview" | "subscription" | "payment" | "invoices" | "security";
}

export const UserAccountTerminalModal: React.FC<UserAccountTerminalModalProps> = ({
  isOpen,
  onClose,
  onLaunchDashboard,
  onOpenDailyUsage,
  userEmail,
  lang = "de",
  initialTab = "overview",
}) => {
  const { isModern } = useTheme();
  const [activeTab, setActiveTab] = useState<"overview" | "subscription" | "payment" | "invoices" | "security">(initialTab);
  const [profile, setProfile] = useState<FullUserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedToken, setCopiedToken] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "warn" | "error" } | null>(null);

  // Upgrade Plan State
  const [isUpgrading, setIsUpgrading] = useState<boolean>(false);
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState<"PRO_29" | "ENTERPRISE_99" | "FLEET_299">("ENTERPRISE_99");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [showUpgradeConfirm, setShowUpgradeConfirm] = useState<boolean>(false);

  // Cancel Subscription Modal State
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>("temporary");
  const [cancelFeedback, setCancelFeedback] = useState<string>("");
  const [isProcessingCancel, setIsProcessingCancel] = useState<boolean>(false);

  // Add Payment Method Modal State
  const [showAddPaymentModal, setShowAddPaymentModal] = useState<boolean>(false);
  const [paymentType, setPaymentType] = useState<"paypal" | "card" | "klarna" | "sepa">("paypal");
  const [paypalEmailInput, setPaypalEmailInput] = useState<string>("");
  const [cardName, setCardName] = useState<string>("");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [cardExpiry, setCardExpiry] = useState<string>("");
  const [cardCvc, setCardCvc] = useState<string>("");
  const [klarnaOption, setKlarnaOption] = useState<"pay_later" | "slice_it" | "pay_now">("pay_later");
  
  // SEPA Direct Debit State
  const [sepaIban, setSepaIban] = useState<string>("");
  const [sepaHolder, setSepaHolder] = useState<string>("");
  const [sepaBic, setSepaBic] = useState<string>("");
  const [sepaMandateAccepted, setSepaMandateAccepted] = useState<boolean>(true);
  const [setAsDefaultCheck, setSetAsDefaultCheck] = useState<boolean>(true);
  const [isProcessingPaymentAdd, setIsProcessingPaymentAdd] = useState<boolean>(false);

  // Security / Password State
  const [currentPasswordInput, setCurrentPasswordInput] = useState<string>("");
  const [newPasswordInput, setNewPasswordInput] = useState<string>("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState<boolean>(false);

  // Invoice Modal Viewer State
  const [selectedInvoice, setSelectedInvoice] = useState<UserInvoiceItem | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);

  const activeEmail = userEmail || getCurrentUserEmail() || SUPERADMIN_EMAIL;

  const showToast = (text: string, type: "success" | "warn" | "error" = "success") => {
    setToastMessage({ text, type });
    if (type === "error") {
      playErrorTone();
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadUserProfile = async () => {
    setIsLoading(true);
    try {
      const data = await fetchUserTerminalProfile(activeEmail);
      if (data) {
        try {
          const liveMetrics = getDailyUsageMetrics(activeEmail);
          data.resourceUsage = {
            ...data.resourceUsage,
            tokensUsed: liveMetrics.todayTokens,
            tokensLimit: liveMetrics.dailyLimitTokens || 50000,
            queriesToday: liveMetrics.todayQueries,
          };
        } catch {}
      }
      setProfile(data);
      if (data?.email && !paypalEmailInput) {
        setPaypalEmailInput(data.email);
      }
    } catch (e) {
      console.error("Failed to load user profile", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (initialTab) {
        setActiveTab(initialTab);
      }
      loadUserProfile();
    }
  }, [isOpen, activeEmail, initialTab]);

  if (!isOpen) return null;

  const handleCopyToken = () => {
    if (profile?.token) {
      navigator.clipboard.writeText(profile.token);
      setCopiedToken(true);
      playValidationBeep();
      showToast(lang === "de" ? "🔑 Quantum Token in die Zwischenablage kopiert!" : "🔑 Quantum Token copied to clipboard!", "success");
      setTimeout(() => setCopiedToken(false), 2500);
    }
  };

  const handleUpgradePlanSubmit = async () => {
    if (!profile) return;
    setIsUpgrading(true);
    try {
      const res = await updateUserPlan(profile.email, selectedUpgradePlan, billingCycle);
      if (res.ok && res.profile) {
        setProfile(res.profile);
        setShowUpgradeConfirm(false);
        playSuccessFanfare();
        showToast(
          lang === "de"
            ? `🚀 Upgrade auf ${res.profile.subscription.planName} erfolgreich aktiviert!`
            : `🚀 Upgrade to ${res.profile.subscription.planName} activated!`,
          "success"
        );
      } else {
        playErrorTone();
        showToast(res.message || "Fehler beim Upgrade", "error");
      }
    } catch (e: any) {
      playErrorTone();
      showToast("Upgrade fehlgeschlagen: " + e.message, "error");
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleCancelSubscriptionSubmit = async () => {
    if (!profile) return;
    setIsProcessingCancel(true);
    try {
      const fullReason = `${cancelReason}: ${cancelFeedback}`.trim();
      const res = await cancelUserSubscription(profile.email, fullReason);
      if (res.ok && res.profile) {
        setProfile(res.profile);
        setShowCancelModal(false);
        showToast(
          lang === "de"
            ? "Abo zum Ende der aktuellen Laufzeit gekündigt. Dein Zugriff bleibt bis dahin aktiv."
            : "Subscription cancelled at period end. Access remains active until then.",
          "warn"
        );
      } else {
        showToast(res.message || "Kündigung fehlgeschlagen", "error");
      }
    } catch (e: any) {
      showToast("Fehler: " + e.message, "error");
    } finally {
      setIsProcessingCancel(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!profile) return;
    try {
      const res = await reactivateUserSubscription(profile.email);
      if (res.ok && res.profile) {
        setProfile(res.profile);
        showToast(
          lang === "de" ? "⚡ Abo erfolgreich reaktiviert! Verlängerung ist wieder aktiv." : "⚡ Subscription reactivated!",
          "success"
        );
      }
    } catch (e: any) {
      showToast("Fehler beim Reaktivieren: " + e.message, "error");
    }
  };

  const handleAddPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsProcessingPaymentAdd(true);

    try {
      let label = "";
      let brand = "";
      let last4 = "";
      let expiry = "";
      let payPalEmail = "";

      if (paymentType === "paypal") {
        if (!paypalEmailInput.trim() || !paypalEmailInput.includes("@")) {
          showToast(lang === "de" ? "Bitte gib eine gültige PayPal E-Mail ein." : "Valid PayPal email required.", "error");
          setIsProcessingPaymentAdd(false);
          return;
        }
        label = `PayPal (${paypalEmailInput.trim()})`;
        brand = "PayPal";
        payPalEmail = paypalEmailInput.trim();
      } else if (paymentType === "card") {
        const cleanCard = cardNumber.replace(/\s/g, "");
        if (cleanCard.length < 15) {
          showToast(lang === "de" ? "Bitte gib eine vollständige Kreditkartennummer ein." : "Complete card number required.", "error");
          setIsProcessingPaymentAdd(false);
          return;
        }
        last4 = cleanCard.slice(-4);
        expiry = cardExpiry || "12/28";
        brand = cleanCard.startsWith("4") ? "Visa" : cleanCard.startsWith("5") ? "Mastercard" : "Amex";
        label = `${brand} •••• ${last4}`;
      } else if (paymentType === "klarna") {
        brand = "Klarna";
        label = klarnaOption === "pay_later" ? "Klarna Rechnung (30 Tage)" : klarnaOption === "slice_it" ? "Klarna Ratenkauf" : "Klarna Sofortüberweisung";
      } else if (paymentType === "sepa") {
        const cleanIban = sepaIban.replace(/\s/g, "").toUpperCase();
        if (cleanIban.length < 15) {
          showToast(lang === "de" ? "Bitte gib eine gültige IBAN ein." : "Valid IBAN required.", "error");
          setIsProcessingPaymentAdd(false);
          return;
        }
        last4 = cleanIban.slice(-4);
        brand = "SEPA Direct Debit";
        label = `SEPA •••• ${last4} (${sepaHolder.trim() || "Bankkonto"})`;
      }

      const res = await addUserPaymentMethod(profile.email, {
        type: paymentType,
        label,
        brand,
        last4,
        expiry,
        payPalEmail,
        klarnaType: klarnaOption,
        setAsDefault: setAsDefaultCheck,
      });

      if (res.ok && res.profile) {
        setProfile(res.profile);
        setShowAddPaymentModal(false);
        setCardNumber("");
        setCardExpiry("");
        setCardCvc("");
        setCardName("");
        setSepaIban("");
        setSepaHolder("");
        setSepaBic("");
        playSuccessFanfare();
        showToast(lang === "de" ? `⚡ Zahlungsmethode '${label}' erfolgreich verknüpft!` : `⚡ Payment method '${label}' added!`, "success");
      }
    } catch (e: any) {
      showToast("Fehler beim Hinzufügen: " + e.message, "error");
    } finally {
      setIsProcessingPaymentAdd(false);
    }
  };

  const handleRemovePaymentMethod = async (pmId: string) => {
    if (!profile) return;
    try {
      const res = await removeUserPaymentMethod(profile.email, pmId);
      if (res.ok && res.profile) {
        setProfile(res.profile);
        showToast(lang === "de" ? "Zahlungsmethode entfernt." : "Payment method removed.", "success");
      }
    } catch (e: any) {
      showToast("Fehler: " + e.message, "error");
    }
  };

  const handleSetDefaultPaymentMethod = async (pmId: string) => {
    if (!profile) return;
    try {
      const res = await setDefaultUserPaymentMethod(profile.email, pmId);
      if (res.ok && res.profile) {
        setProfile(res.profile);
        showToast(lang === "de" ? "Standard-Zahlungsmethode festgelegt." : "Default payment method set.", "success");
      }
    } catch (e: any) {
      showToast("Fehler: " + e.message, "error");
    }
  };

  const handleViewInvoice = (inv: UserInvoiceItem) => {
    setSelectedInvoice(inv);
    setIsInvoiceModalOpen(true);
  };

  const handlePrintInvoice = (inv: UserInvoiceItem) => {
    openPrintableInvoice(inv, {
      name: profile?.name,
      email: profile?.email,
      slot: profile?.slot,
      token: profile?.token,
    });
  };

  const handleDownloadInvoice = (inv: UserInvoiceItem) => {
    downloadStyledInvoiceHtml(inv, {
      name: profile?.name,
      email: profile?.email,
      slot: profile?.slot,
      token: profile?.token,
    });
    showToast(lang === "de" ? `📄 Rechnung ${inv.number} heruntergeladen!` : `📄 Invoice ${inv.number} downloaded!`, "success");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (newPasswordInput.length < 6) {
      showToast(lang === "de" ? "Neues Passwort muss mindestens 6 Zeichen haben." : "Password min 6 chars.", "error");
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      showToast(lang === "de" ? "Die Passwörter stimmen nicht überein." : "Passwords do not match.", "error");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: profile.email,
          currentPassword: currentPasswordInput,
          newPassword: newPasswordInput,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        showToast(lang === "de" ? "🔒 Passwort erfolgreich geändert!" : "🔒 Password successfully changed!", "success");
        setCurrentPasswordInput("");
        setNewPasswordInput("");
        setConfirmPasswordInput("");
      } else {
        showToast(data.message || "Fehler beim Ändern des Passworts.", "error");
      }
    } catch (e: any) {
      showToast("Fehler: " + e.message, "error");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleLogout = () => {
    setCurrentUserEmail("");
    try {
      localStorage.removeItem("maze_registered_vip_user");
      localStorage.removeItem("maze_current_user_email");
    } catch {}
    onClose();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-2xl overflow-y-auto animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-[200] px-4 py-3 rounded-2xl font-mono text-xs font-bold border shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-top-3 duration-300 ${
            toastMessage.type === "success"
              ? "bg-emerald-950/95 border-emerald-400/80 text-emerald-200 shadow-emerald-500/20"
              : toastMessage.type === "warn"
              ? "bg-amber-950/95 border-amber-400/80 text-amber-200 shadow-amber-500/20"
              : "bg-rose-950/95 border-rose-400/80 text-rose-200 shadow-rose-500/20"
          }`}
        >
          {toastMessage.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Terminal Window */}
      <div className={`relative w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh] ${
        isModern
          ? "bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl"
          : "bg-[#040714] border-2 border-cyan-500/50 rounded-3xl shadow-[0_0_80px_rgba(0,240,255,0.25)]"
      }`}>
        
        {/* Top Holographic Command Header */}
        <div className={`px-5 sm:px-7 py-4 flex flex-wrap items-center justify-between gap-4 border-b ${
          isModern
            ? "bg-zinc-900/90 border-zinc-800"
            : "bg-gradient-to-r from-[#070e28] via-[#0b1338] to-[#04081c] border-cyan-500/30"
        }`}>
          <div className="flex items-center gap-3.5">
            <div className={`relative w-12 h-12 rounded-2xl p-[1.5px] flex items-center justify-center ${
              isModern
                ? "bg-gradient-to-br from-red-600 to-zinc-700 shadow-sm"
                : "bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-600 shadow-[0_0_20px_rgba(0,240,255,0.4)]"
            }`}>
              <div className={`w-full h-full rounded-[14px] flex items-center justify-center ${
                isModern ? "bg-zinc-900" : "bg-[#030614]"
              }`}>
                <User className={`w-6 h-6 ${isModern ? "text-red-400" : "text-cyan-300"}`} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center" title="Online & Synchronisiert">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-display font-black text-lg sm:text-xl text-white tracking-wide flex items-center gap-2">
                  <span>{profile?.name || "Quantum User"}</span>
                  {profile?.isFullCoreAdmin && (
                    <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-mono text-[9.5px] font-black uppercase tracking-wider">
                      👑 ROOT ADMIN
                    </span>
                  )}
                </h2>
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                  isModern
                    ? "bg-red-500/10 border border-red-500/30 text-red-300"
                    : "bg-cyan-500/20 border border-cyan-400/40 text-cyan-300"
                }`}>
                  SLOT #{profile?.slot || "499"}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs text-slate-400 mt-0.5">
                <span className="text-slate-300">{profile?.email || activeEmail}</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>8/8 Cores Aktiv</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5">
            {onOpenDailyUsage && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDailyUsage();
                }}
                className={`hidden sm:flex px-3 py-2 rounded-xl font-mono text-xs font-bold transition items-center gap-1.5 cursor-pointer ${
                  isModern
                    ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
                    : "bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40"
                }`}
                title="Ø Daily Usage Telemetrie ansehen"
              >
                <Activity className={`w-3.5 h-3.5 ${isModern ? "text-red-400" : "text-cyan-400"}`} />
                <span>Ø USAGE</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className={`p-2 rounded-xl font-mono text-xs transition cursor-pointer ${
                isModern
                  ? "bg-zinc-800 hover:bg-red-950/40 text-zinc-400 hover:text-red-300 border border-zinc-700 hover:border-red-500/40"
                  : "bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 hover:border-rose-400"
              }`}
              title="Abmelden / Account wechseln"
            >
              <LogOut className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition cursor-pointer ${
                isModern
                  ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
              }`}
              title="Schließen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Rail */}
        <div className={`px-4 sm:px-6 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar font-mono text-xs border-b ${
          isModern ? "bg-zinc-950 border-zinc-800" : "bg-[#030612] border-slate-800/80"
        }`}>
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "overview"
                ? isModern
                  ? "bg-zinc-800 text-white border border-zinc-700 shadow-sm"
                  : "bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-[0_0_12px_rgba(0,240,255,0.3)]"
                : isModern
                ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Cpu className={`w-3.5 h-3.5 ${isModern ? "text-red-400" : "text-cyan-400"}`} />
            <span>ÜBERSICHT & TELEMETRIE</span>
          </button>

          <button
            onClick={() => setActiveTab("subscription")}
            className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "subscription"
                ? isModern
                  ? "bg-zinc-800 text-white border border-red-500/40 shadow-sm"
                  : "bg-purple-500/20 text-purple-300 border border-purple-400/60 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                : isModern
                ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isModern ? "text-red-400" : "text-purple-400"}`} />
            <span>ABO & UPGRADE</span>
          </button>

          <button
            onClick={() => setActiveTab("payment")}
            className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "payment"
                ? isModern
                  ? "bg-zinc-800 text-white border border-emerald-500/40 shadow-sm"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-400/60 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                : isModern
                ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
            <span>ZAHLUNGSMETHODEN</span>
            {profile && (
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-300 text-[10px]">
                {profile.paymentMethods?.length || 0}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("invoices")}
            className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "invoices"
                ? isModern
                  ? "bg-zinc-800 text-white border border-blue-500/40 shadow-sm"
                  : "bg-blue-500/20 text-blue-300 border border-blue-400/60 shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                : isModern
                ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>RECHNUNGEN & BELEGE</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "security"
                ? isModern
                  ? "bg-zinc-800 text-white border border-amber-500/40 shadow-sm"
                  : "bg-amber-500/20 text-amber-300 border border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                : isModern
                ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>SICHERHEIT & PASSWORT</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className={`flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 ${
          isModern ? "font-sans text-zinc-200" : "font-mono text-slate-200"
        }`}>
          
          {/* ================= TAB 1: OVERVIEW & TELEMETRY ================= */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-in fade-in duration-150">

              {/* 24H TRIAL & 50K TOKENS STATUS BANNER */}
              {(!profile?.paymentMethods || profile.paymentMethods.length === 0) && !profile?.isFullCoreAdmin && (
                <div className={`p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isModern
                    ? "bg-zinc-900 border border-zinc-800 shadow-sm"
                    : "bg-gradient-to-r from-emerald-950/60 via-cyan-950/50 to-purple-950/40 border border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.2)]"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isModern ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-emerald-500/20 border border-emerald-400/60"
                    }`}>
                      <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                    </div>
                    <div>
                      <div className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        isModern ? "text-emerald-400 font-sans" : "text-emerald-300 font-mono"
                      }`}>
                        <span>1 Tag Vollzugriff & 50.000 Gratis-Tokens aktiv</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono ${
                          isModern ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" : "bg-emerald-500/20 text-emerald-400"
                        }`}>TRIAL</span>
                      </div>
                      <p className={`text-[11px] mt-0.5 ${isModern ? "text-zinc-300" : "text-slate-300"}`}>
                        Du testest aktuell alle 8 Cores kostenlos. Hinterlege vor Ablauf der 24h eine Zahlungsmethode (PayPal, Kreditkarte, Klarna), um deinen Vollzugriff ohne Unterbrechung zu behalten.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab("payment")}
                    className={`px-3.5 py-2 rounded-xl text-xs transition shrink-0 cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                      isModern
                        ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold shadow-sm"
                        : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 font-mono"
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Zahlungsart wählen</span>
                  </button>
                </div>
              )}
              
              {/* Profile Card & Token */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`md:col-span-2 p-5 rounded-2xl border space-y-4 ${
                  isModern ? "bg-zinc-900/80 border-zinc-800" : "bg-[#070b1e] border-cyan-500/30"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      isModern ? "text-red-400" : "text-cyan-400"
                    }`}>
                      <Shield className="w-3.5 h-3.5" />
                      <span>Sovereign Quantum Identität</span>
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      isModern ? "text-emerald-300 bg-emerald-950/50 border border-emerald-800" : "text-emerald-400 bg-emerald-500/15 border border-emerald-500/30"
                    }`}>
                      256-BIT QUANTUM ENCRYPTED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className={`p-3 rounded-xl border ${isModern ? "bg-zinc-950 border-zinc-800" : "bg-slate-950/80 border-slate-800"}`}>
                      <div className="text-[10px] text-zinc-400">AKTIVER PLAN</div>
                      <div className={`font-bold text-sm mt-0.5 truncate ${isModern ? "text-red-300" : "text-cyan-300"}`}>
                        {profile?.subscription?.planName || "SOVEREIGN ENTERPRISE"}
                      </div>
                    </div>

                    <div className={`p-3 rounded-xl border ${isModern ? "bg-zinc-950 border-zinc-800" : "bg-slate-950/80 border-slate-800"}`}>
                      <div className="text-[10px] text-zinc-400">STATUS</div>
                      <div className="text-emerald-400 font-bold text-sm mt-0.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{profile?.paymentMethods && profile.paymentMethods.length > 0 ? "VOLLZUGRIFF" : "1-TAG TESTPHASE"}</span>
                      </div>
                    </div>

                    <div className={`p-3 rounded-xl border ${isModern ? "bg-zinc-950 border-zinc-800" : "bg-slate-950/80 border-slate-800"}`}>
                      <div className="text-[10px] text-zinc-400">KI-CORES</div>
                      <div className="text-white font-bold text-sm mt-0.5">8 / 8 Cores Live</div>
                    </div>
                  </div>

                  {/* Token Box */}
                  <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isModern ? "bg-zinc-950 border-zinc-800" : "bg-slate-950 border border-cyan-500/40"
                  }`}>
                    <div className="flex-1">
                      <div className="text-[10px] text-zinc-400 font-bold">DEIN PERSÖNLICHER ACCESS TOKEN</div>
                      <div className={`text-xs font-mono font-bold tracking-wider truncate mt-0.5 max-w-[400px] ${
                        isModern ? "text-red-300" : "text-cyan-300"
                      }`}>
                        {profile?.token || "MZ-QUANTUM-2026-ROOT"}
                      </div>
                    </div>
                    <button
                      onClick={handleCopyToken}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                        isModern
                          ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
                          : "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/50"
                      }`}
                    >
                      {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedToken ? "Kopiert!" : "Kopieren"}</span>
                    </button>
                  </div>
                </div>

                {/* Resource Usage Ring & Telemetry */}
                <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                  isModern ? "bg-zinc-900/80 border-zinc-800" : "bg-[#070b1e] border-purple-500/30"
                }`}>
                  <div>
                    <div className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      isModern ? "text-red-400" : "text-purple-400"
                    }`}>
                      <Activity className="w-3.5 h-3.5" />
                      <span>Tages-Telemetrie</span>
                    </div>
                    <div className="mt-3 space-y-2.5 text-xs">
                      <div>
                        <div className="flex justify-between text-[11px] text-zinc-400">
                          <span>Token Kontingent:</span>
                          <span className={`font-bold ${isModern ? "text-red-300" : "text-purple-300"}`}>
                            {profile?.resourceUsage?.tokensUsed?.toLocaleString() || "0"} / {profile?.resourceUsage?.tokensLimit?.toLocaleString() || "50.000"}
                          </span>
                        </div>
                        <div className={`w-full h-1.5 rounded-full mt-1 overflow-hidden ${isModern ? "bg-zinc-950" : "bg-slate-950"}`}>
                          <div
                            className={`h-full ${isModern ? "bg-gradient-to-r from-red-500 to-amber-500" : "bg-gradient-to-r from-cyan-500 to-purple-500"}`}
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(
                                  5,
                                  ((profile?.resourceUsage?.tokensUsed || 0) /
                                    (profile?.resourceUsage?.tokensLimit || 50000)) *
                                    100
                                )
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-zinc-400">
                          <span>Queries heute:</span>
                          <span className={`font-bold ${isModern ? "text-zinc-200" : "text-cyan-300"}`}>
                            {profile?.resourceUsage?.queriesToday || 0} / {profile?.resourceUsage?.queriesLimit || 1000}
                          </span>
                        </div>
                        <div className={`w-full h-1.5 rounded-full mt-1 overflow-hidden ${isModern ? "bg-zinc-950" : "bg-slate-950"}`}>
                          <div className={`h-full ${isModern ? "bg-red-500" : "bg-gradient-to-r from-cyan-400 to-emerald-400"} w-[5%]`} />
                        </div>
                      </div>

                      <div className={`pt-2 border-t flex justify-between text-[11px] ${isModern ? "border-zinc-800 text-zinc-400" : "border-slate-800 text-slate-400"}`}>
                        <span>System Uptime:</span>
                        <span className="text-emerald-400 font-bold">99.98%</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab("subscription")}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      isModern
                        ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
                        : "bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/50 font-mono"
                    }`}
                  >
                    <span>Plan Verwalten & Upgraden</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 8 Cores Live Matrix */}
              <div className={`p-5 rounded-2xl border space-y-3 ${
                isModern ? "bg-zinc-900/80 border-zinc-800" : "bg-[#060a1a] border-slate-800"
              }`}>
                <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider flex items-center justify-between">
                  <span>8 KI-Agenten Cores Zuordnung</span>
                  <span className={`text-[11px] ${isModern ? "text-red-400" : "text-cyan-400"}`}>Alle Cores online</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  {[
                    { name: "S.Y.N.T.A.X.", role: "Master Core", color: isModern ? "text-red-400" : "text-cyan-400" },
                    { name: "N.E.O.", role: "Matrix Boss", color: "text-pink-400" },
                    { name: "V.E.G.A.", role: "Data & Code", color: isModern ? "text-amber-400" : "text-red-400" },
                    { name: "O.D.I.N.", role: "Defense Matrix", color: "text-blue-400" },
                    { name: "C.H.R.O.N.O.S.", role: "Time & Sprints", color: "text-amber-400" },
                    { name: "P.U.L.S.E.", role: "Veo 3.1 Studio", color: "text-purple-400" },
                    { name: "O.R.A.C.L.E.", role: "Deep Search", color: "text-emerald-400" },
                    { name: "G.L.O.B.E.", role: "Maps & Logistics", color: "text-indigo-400" },
                  ].map((ag, i) => (
                    <div key={i} className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      isModern ? "bg-zinc-950 border-zinc-800" : "bg-slate-950 border border-slate-800/80"
                    }`}>
                      <div>
                        <div className={`font-bold text-[11px] ${ag.color}`}>{ag.name}</div>
                        <div className="text-[9.5px] text-zinc-500">{ag.role}</div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ================= TAB 2: SUBSCRIPTION & PLAN MANAGEMENT ================= */}
          {activeTab === "subscription" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Current Active Plan Status Banner */}
              <div className={`p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                isModern
                  ? "bg-zinc-900 border border-zinc-800 shadow-sm"
                  : "bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-950 border border-purple-500/40"
              }`}>
                <div className="space-y-1">
                  <div className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                    isModern ? "text-zinc-400 font-sans" : "text-purple-300 font-mono"
                  }`}>
                    <Sparkles className={`w-3.5 h-3.5 ${isModern ? "text-red-400" : "text-purple-300"}`} />
                    <span>Aktuelles Abonnement</span>
                  </div>
                  <div className="text-xl font-bold text-white flex items-center gap-2">
                    <span>{profile?.subscription?.planName || "SOVEREIGN ENTERPRISE"}</span>
                    <span className={`text-sm font-normal ${isModern ? "text-zinc-400" : "text-slate-400"}`}>
                      ({profile?.subscription?.priceMonthly ? `€${profile.subscription.priceMonthly}/Monat` : "Root Lifetime"})
                    </span>
                  </div>
                  <div className={`text-xs flex items-center gap-3 pt-1 ${isModern ? "text-zinc-300" : "text-slate-300"}`}>
                    <span>
                      Status:{" "}
                      <strong className={profile?.subscription?.status === "CANCELLED_PERIOD_END" ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
                        {profile?.subscription?.status === "CANCELLED_PERIOD_END" ? "Gekündigt zum Periodenende" : "Aktiv (Automatische Verlängerung)"}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>Nächste Abrechnung: <strong className="text-white">{profile?.subscription?.nextBillingDate || "18.09.2026"}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {profile?.subscription?.status === "CANCELLED_PERIOD_END" ? (
                    <button
                      onClick={handleReactivateSubscription}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        isModern
                          ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                          : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20"
                      }`}
                    >
                      Abo Reaktivieren
                    </button>
                  ) : (
                    !profile?.isFullCoreAdmin && (
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className={`px-4 py-2 rounded-xl font-semibold text-xs transition cursor-pointer ${
                          isModern
                            ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 border border-zinc-700"
                            : "bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 font-bold"
                        }`}
                      >
                        Abo Kündigen
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* 8-CORE MATRIX ACCESS HERO PRICING COMPONENT */}
              <div className="mb-6">
                <MatrixPricingCard
                  lang={lang}
                  mode="dashboard"
                  onCheckout={() => {
                    setSelectedUpgradePlan("PRO_29");
                    setShowUpgradeConfirm(true);
                  }}
                />
              </div>

              {/* Upgrade / Tier Comparison Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-bold uppercase tracking-wider ${
                    isModern ? "text-zinc-100 font-sans" : "text-white font-mono"
                  }`}>
                    Verfügbare Tarife & Upgrades
                  </h3>
                  
                  {/* Billing Cycle Switch */}
                  <div className={`flex items-center p-1 rounded-xl text-xs ${
                    isModern ? "bg-zinc-900 border border-zinc-800" : "bg-slate-950 border border-slate-800"
                  }`}>
                    <button
                      onClick={() => setBillingCycle("monthly")}
                      className={`px-3 py-1 rounded-lg transition cursor-pointer font-semibold ${
                        billingCycle === "monthly"
                          ? isModern
                            ? "bg-zinc-800 text-white shadow-sm border border-zinc-700"
                            : "bg-cyan-500 text-slate-950 font-bold"
                          : isModern
                          ? "text-zinc-400 hover:text-zinc-200"
                          : "text-slate-400"
                      }`}
                    >
                      Monatlich
                    </button>
                    <button
                      onClick={() => setBillingCycle("yearly")}
                      className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 font-semibold ${
                        billingCycle === "yearly"
                          ? isModern
                            ? "bg-zinc-800 text-white shadow-sm border border-zinc-700"
                            : "bg-cyan-500 text-slate-950 font-bold"
                          : isModern
                          ? "text-zinc-400 hover:text-zinc-200"
                          : "text-slate-400"
                      }`}
                    >
                      <span>Jährlich</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        isModern ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-emerald-500 text-slate-950 font-black"
                      }`}>-20%</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Pro Plan */}
                  <div className={`p-5 rounded-2xl border transition flex flex-col justify-between ${
                    isModern
                      ? profile?.subscription?.planId === "PRO_29"
                        ? "bg-zinc-900 border-zinc-700 shadow-md"
                        : "bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 shadow-sm"
                      : profile?.subscription?.planId === "PRO_29"
                      ? "bg-cyan-950/20 border-cyan-400/80 shadow-[0_0_20px_rgba(0,240,255,0.15)]"
                      : "bg-[#060a1a] border-slate-800"
                  }`}>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-bold ${isModern ? "text-zinc-300 font-sans uppercase tracking-wider" : "text-cyan-400"}`}>
                          PRO SOVEREIGN CORE
                        </span>
                        {profile?.subscription?.planId === "PRO_29" && (
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            isModern ? "bg-zinc-800 text-zinc-300 border border-zinc-700" : "bg-cyan-500/20 text-cyan-300"
                          }`}>AKTUELL</span>
                        )}
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {billingCycle === "yearly" ? "€23" : "€29"} <span className={`text-xs font-normal ${isModern ? "text-zinc-400" : "text-slate-400"}`}>/ Monat</span>
                      </div>
                      <ul className={`text-xs space-y-2 pt-2 border-t ${
                        isModern ? "text-zinc-300 border-zinc-800" : "text-slate-300 border-slate-800"
                      }`}>
                        <li className="flex items-center gap-2"><Check className={`w-3.5 h-3.5 ${isModern ? "text-zinc-400" : "text-cyan-400"}`} /> 8 KI-Agenten Cores</li>
                        <li className="flex items-center gap-2"><Check className={`w-3.5 h-3.5 ${isModern ? "text-zinc-400" : "text-cyan-400"}`} /> Standard Speicher & Tokens</li>
                        <li className="flex items-center gap-2"><Check className={`w-3.5 h-3.5 ${isModern ? "text-zinc-400" : "text-cyan-400"}`} /> 1-Klick Video Export</li>
                      </ul>
                    </div>

                    <button
                      disabled={profile?.subscription?.planId === "PRO_29"}
                      onClick={() => {
                        setSelectedUpgradePlan("PRO_29");
                        setShowUpgradeConfirm(true);
                      }}
                      className={`w-full mt-5 py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer ${
                        profile?.subscription?.planId === "PRO_29"
                          ? isModern
                            ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-800"
                            : "bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-800"
                          : isModern
                          ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 shadow-sm"
                          : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-lg"
                      }`}
                    >
                      {profile?.subscription?.planId === "PRO_29" ? "Aktiver Tarif" : "Zu Pro wechseln"}
                    </button>
                  </div>

                  {/* Enterprise Plan (Recommended) */}
                  <div className={`relative p-5 rounded-2xl border-2 transition flex flex-col justify-between ${
                    isModern
                      ? profile?.subscription?.planId === "ENTERPRISE_99"
                        ? "bg-zinc-900 border-red-500/60 shadow-lg"
                        : "bg-zinc-900/90 border-red-500/40 hover:border-red-500/60 shadow-md"
                      : profile?.subscription?.planId === "ENTERPRISE_99"
                      ? "bg-purple-950/30 border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.25)]"
                      : "bg-[#080d26] border-purple-500/50 shadow-lg"
                  }`}>
                    <div className={`absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-bold shadow-md ${
                      isModern
                        ? "bg-gradient-to-r from-red-600 to-rose-600 text-white border border-red-500/40"
                        : "bg-gradient-to-r from-purple-500 to-cyan-500 text-slate-950 font-black"
                    }`}>
                      EMPFOHLEN
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-bold ${isModern ? "text-zinc-200 uppercase tracking-wider" : "text-purple-300"}`}>
                          SOVEREIGN ENTERPRISE
                        </span>
                        {profile?.subscription?.planId === "ENTERPRISE_99" && (
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            isModern ? "bg-red-500/20 text-red-300 border border-red-500/30" : "bg-purple-500/20 text-purple-300"
                          }`}>AKTUELL</span>
                        )}
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {billingCycle === "yearly" ? "€79" : "€99"} <span className={`text-xs font-normal ${isModern ? "text-zinc-400" : "text-slate-400"}`}>/ Monat</span>
                      </div>
                      <ul className={`text-xs space-y-2 pt-2 border-t ${
                        isModern ? "text-zinc-200 border-zinc-800" : "text-slate-200 border-purple-500/30"
                      }`}>
                        <li className="flex items-center gap-2"><Check className={`w-3.5 h-3.5 ${isModern ? "text-red-400" : "text-purple-400"}`} /> Alle 8 Spezialisten 100% aktiv</li>
                        <li className="flex items-center gap-2"><Check className={`w-3.5 h-3.5 ${isModern ? "text-red-400" : "text-purple-400"}`} /> Unlimitierte Veo 3.1 Video-Assets</li>
                        <li className="flex items-center gap-2"><Check className={`w-3.5 h-3.5 ${isModern ? "text-red-400" : "text-purple-400"}`} /> Live-Sprachkonferenz mit 8 Agenten</li>
                        <li className="flex items-center gap-2"><Check className={`w-3.5 h-3.5 ${isModern ? "text-red-400" : "text-purple-400"}`} /> Priorisierte Rechenpower & Latenz</li>
                      </ul>
                    </div>

                    <button
                      disabled={profile?.subscription?.planId === "ENTERPRISE_99"}
                      onClick={() => {
                        setSelectedUpgradePlan("ENTERPRISE_99");
                        setShowUpgradeConfirm(true);
                      }}
                      className={`w-full mt-5 py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer ${
                        profile?.subscription?.planId === "ENTERPRISE_99"
                          ? isModern
                            ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-800"
                            : "bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-800"
                          : isModern
                          ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-md border border-red-500/30"
                          : "bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-slate-950 font-black shadow-lg"
                      }`}
                    >
                      {profile?.subscription?.planId === "ENTERPRISE_99" ? "Aktiver Tarif" : "Jetzt Upgrade auf Enterprise"}
                    </button>
                  </div>

                  {/* Dedicated Fleet Plan */}
                  <div className={`p-5 rounded-2xl border transition flex flex-col justify-between ${
                    isModern
                      ? profile?.subscription?.planId === "FLEET_299"
                        ? "bg-zinc-900 border-zinc-700 shadow-md"
                        : "bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 shadow-sm"
                      : profile?.subscription?.planId === "FLEET_299"
                      ? "bg-amber-950/20 border-amber-400/80"
                      : "bg-[#060a1a] border-slate-800"
                  }`}>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-bold ${isModern ? "text-zinc-300 font-sans uppercase tracking-wider" : "text-amber-400"}`}>
                          QUANTUM DEDICATED FLEET
                        </span>
                        {profile?.subscription?.planId === "FLEET_299" && (
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            isModern ? "bg-zinc-800 text-zinc-300 border border-zinc-700" : "bg-amber-500/20 text-amber-300"
                          }`}>AKTUELL</span>
                        )}
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {billingCycle === "yearly" ? "€239" : "€299"} <span className={`text-xs font-normal ${isModern ? "text-zinc-400" : "text-slate-400"}`}>/ Monat</span>
                      </div>
                      <ul className={`text-xs space-y-2 pt-2 border-t ${
                        isModern ? "text-zinc-300 border-zinc-800" : "text-slate-300 border-slate-800"
                      }`}>
                        <li className="flex items-center gap-2"><Check className={`w-3.5 h-3.5 ${isModern ? "text-zinc-400" : "text-amber-400"}`} /> Eigener dedizierter Quantum Node</li>
                        <li className="flex items-center gap-2"><Check className={`w-3.5 h-3.5 ${isModern ? "text-zinc-400" : "text-amber-400"}`} /> Custom API Key Integration</li>
                        <li className="flex items-center gap-2"><Check className={`w-3.5 h-3.5 ${isModern ? "text-zinc-400" : "text-amber-400"}`} /> 24/7 VIP Priority Support</li>
                      </ul>
                    </div>

                    <button
                      disabled={profile?.subscription?.planId === "FLEET_299"}
                      onClick={() => {
                        setSelectedUpgradePlan("FLEET_299");
                        setShowUpgradeConfirm(true);
                      }}
                      className={`w-full mt-5 py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer ${
                        profile?.subscription?.planId === "FLEET_299"
                          ? isModern
                            ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-800"
                            : "bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-800"
                          : isModern
                          ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 shadow-sm"
                          : "bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg"
                      }`}
                    >
                      {profile?.subscription?.planId === "FLEET_299" ? "Aktiver Tarif" : "Fleet Anfordern"}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ================= TAB 3: PAYMENT METHODS (PAYPAL, KREDITKARTE, KLARNA, CRYPTO) ================= */}
          {activeTab === "payment" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className={`text-sm font-bold uppercase tracking-wider ${
                    isModern ? "text-zinc-100 font-sans" : "text-white font-mono"
                  }`}>
                    Hinterlegte Zahlungsmethoden
                  </h3>
                  <p className={`text-xs mt-0.5 ${isModern ? "text-zinc-400" : "text-slate-400"}`}>
                    Verwalte deine Zahlungsarten für automatische Verlängerungen und Rechnungen.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddPaymentModal(true)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                    isModern
                      ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-md border border-red-500/30"
                      : "bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 font-mono"
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Zahlungsmethode hinzufügen</span>
                </button>
              </div>

              {/* Payment Methods List */}
              <div className="space-y-3">
                {profile?.paymentMethods && profile.paymentMethods.length > 0 ? (
                  profile.paymentMethods.map((pm) => (
                    <div
                      key={pm.id}
                      className={`p-4 rounded-2xl transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        isModern
                          ? "bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 shadow-sm"
                          : "bg-[#070b1e] border border-slate-800 hover:border-cyan-500/40 text-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg ${
                          isModern ? "bg-zinc-950 border border-zinc-800" : "bg-slate-950 border border-slate-800"
                        }`}>
                          {pm.type === "paypal" ? (
                            <span className="font-bold text-blue-400">P</span>
                          ) : pm.type === "klarna" ? (
                            <span className="font-bold text-pink-400">K</span>
                          ) : pm.type === "crypto" ? (
                            <span className="font-bold text-purple-400 text-xs font-mono">{pm.cryptoCurrency || "SOL"}</span>
                          ) : (
                            <CreditCard className="w-6 h-6 text-emerald-400" />
                          )}
                        </div>

                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-2">
                            <span>{pm.label}</span>
                            {pm.isDefault && (
                              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                                isModern
                                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                  : "bg-emerald-500/20 text-emerald-300"
                              }`}>
                                STANDARD
                              </span>
                            )}
                            {pm.type === "crypto" && (
                              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                                isModern
                                  ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                                  : "bg-purple-500/20 text-purple-300"
                              }`}>
                                WEB3 WALLET
                              </span>
                            )}
                          </div>
                          <div className={`text-xs mt-0.5 ${isModern ? "text-zinc-400 font-sans" : "text-slate-400"}`}>
                            {pm.type === "card" && `Gültig bis ${pm.expiry || "12/28"}`}
                            {pm.type === "paypal" && `Verifiziertes PayPal Konto`}
                            {pm.type === "klarna" && `Klarna Käuferschutz`}
                            {pm.type === "crypto" && `Unterstützt alle Wallets (${pm.walletProvider || "Phantom"}) • ${pm.cryptoCurrency || "SOL"}`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {!pm.isDefault && (
                          <button
                            onClick={() => handleSetDefaultPaymentMethod(pm.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                              isModern
                                ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
                                : "bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold border border-slate-700"
                            }`}
                          >
                            Als Standard
                          </button>
                        )}

                        <button
                          onClick={() => handleRemovePaymentMethod(pm.id)}
                          className={`p-2 rounded-lg transition cursor-pointer ${
                            isModern
                              ? "bg-zinc-800 hover:bg-red-950/40 text-zinc-400 hover:text-red-300 border border-zinc-700 hover:border-red-500/40"
                              : "bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 border border-rose-500/30"
                          }`}
                          title="Entfernen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="space-y-4">
                    <div className={`p-6 rounded-2xl ${
                      isModern
                        ? "bg-zinc-900 border border-zinc-800 shadow-sm text-zinc-200"
                        : "bg-gradient-to-r from-emerald-950/40 via-cyan-950/30 to-slate-950 border border-emerald-500/40"
                    }`}>
                      <div className={`flex items-center gap-2.5 font-bold text-sm ${
                        isModern ? "text-zinc-100 font-sans" : "text-emerald-400"
                      }`}>
                        <Sparkles className={`w-4 h-4 ${isModern ? "text-red-400" : "text-emerald-400"}`} />
                        <span>Keine Zahlungsmethode hinterlegt — Freie Wahl</span>
                      </div>
                      <p className={`text-xs mt-1.5 leading-relaxed ${isModern ? "text-zinc-300 font-sans" : "text-slate-300"}`}>
                        Du hast aktuell <strong>1 Tag (24h) Vollzugriff</strong> und <strong>50.000 Gratis-Tokens</strong>.
                        Es ist vorab nichts abgebucht. 
                      </p>
                      <div className={`mt-3 p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                        isModern
                          ? "bg-amber-500/10 border border-amber-500/30 text-amber-200"
                          : "bg-amber-950/40 border border-amber-500/40 text-amber-200"
                      }`}>
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-amber-300 font-bold">24H-Slot-Sicherung:</strong>
                          <p className={`mt-0.5 ${isModern ? "text-zinc-300" : "text-slate-300"}`}>
                            Da die 500 Plätze stark nachgefragt sind, wird der Account nach 24 Stunden gelöscht und dein Slot für Nachrücker freigegeben, sofern keine Zahlungsmethode hinterlegt wird. Hinterlege einfach 1 Zahlungsart deiner Wahl, um deinen Slot dauerhaft zu sichern:
                          </p>
                        </div>
                      </div>

                      {/* Fast choice buttons (4 Methods: PayPal, Card, Klarna, Crypto) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                        <button
                          onClick={() => {
                            setPaymentType("paypal");
                            setShowAddPaymentModal(true);
                          }}
                          className={`p-3.5 rounded-xl transition flex items-center gap-3 text-left cursor-pointer group ${
                            isModern
                              ? "bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 shadow-sm"
                              : "bg-slate-950/90 hover:bg-blue-950/40 border border-slate-800 hover:border-blue-500/50"
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-base ${
                            isModern ? "bg-blue-500/15 border border-blue-500/30 text-blue-400" : "bg-blue-500/20 border border-blue-400/40 text-blue-400 font-black"
                          }`}>
                            P
                          </div>
                          <div>
                            <div className={`text-xs font-bold ${isModern ? "text-zinc-100 group-hover:text-white" : "text-white group-hover:text-blue-300"}`}>PayPal</div>
                            <div className={`text-[10px] ${isModern ? "text-zinc-400" : "text-slate-400"}`}>1-Klick Verknüpfung</div>
                          </div>
                        </button>

                        <button
                          onClick={() => {
                            setPaymentType("card");
                            setShowAddPaymentModal(true);
                          }}
                          className={`p-3.5 rounded-xl transition flex items-center gap-3 text-left cursor-pointer group ${
                            isModern
                              ? "bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 shadow-sm"
                              : "bg-slate-950/90 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/50"
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            isModern ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400" : "bg-emerald-500/20 border border-emerald-400/40 text-emerald-400"
                          }`}>
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div>
                            <div className={`text-xs font-bold ${isModern ? "text-zinc-100 group-hover:text-white" : "text-white group-hover:text-emerald-300"}`}>Kreditkarte</div>
                            <div className={`text-[10px] ${isModern ? "text-zinc-400" : "text-slate-400"}`}>Visa, Mastercard, Amex</div>
                          </div>
                        </button>

                        <button
                          onClick={() => {
                            setPaymentType("klarna");
                            setShowAddPaymentModal(true);
                          }}
                          className={`p-3.5 rounded-xl transition flex items-center gap-3 text-left cursor-pointer group ${
                            isModern
                              ? "bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 shadow-sm"
                              : "bg-slate-950/90 hover:bg-pink-950/40 border border-slate-800 hover:border-pink-500/50"
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-base ${
                            isModern ? "bg-pink-500/15 border border-pink-500/30 text-pink-400" : "bg-pink-500/20 border border-pink-400/40 text-pink-400 font-black"
                          }`}>
                            K
                          </div>
                          <div>
                            <div className={`text-xs font-bold ${isModern ? "text-zinc-100 group-hover:text-white" : "text-white group-hover:text-pink-300"}`}>Klarna</div>
                            <div className={`text-[10px] ${isModern ? "text-zinc-400" : "text-slate-400"}`}>Rechnung oder Sofort</div>
                          </div>
                        </button>

                        <button
                          onClick={() => {
                            setPaymentType("sepa");
                            setShowAddPaymentModal(true);
                          }}
                          className={`p-3.5 rounded-xl transition flex items-center gap-3 text-left cursor-pointer group ${
                            isModern
                              ? "bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 shadow-sm"
                              : "bg-purple-950/30 hover:bg-purple-900/40 border-2 border-purple-500/60 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            isModern ? "bg-purple-500/15 border border-purple-500/30 text-purple-400" : "bg-purple-500/20 border border-purple-400/50 text-purple-300"
                          }`}>
                            <Layers className="w-5 h-5" />
                          </div>
                          <div>
                            <div className={`text-xs font-bold flex items-center gap-1 ${
                              isModern ? "text-zinc-100 group-hover:text-white" : "text-white group-hover:text-purple-300"
                            }`}>
                              <span>SEPA-Lastschrift</span>
                              <span className={`text-[9px] px-1 rounded ${
                                isModern ? "bg-zinc-800 text-zinc-300 border border-zinc-700" : "bg-purple-500/30 text-purple-200"
                              }`}>IBAN / Bank</span>
                            </div>
                            <div className={`text-[10px] ${isModern ? "text-zinc-400" : "text-purple-300"}`}>Bequem per Bankkonto</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Supported Payment Providers Info */}
              <div className={`p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs ${
                isModern
                  ? "bg-zinc-900/60 border border-zinc-800 text-zinc-400 font-sans"
                  : "bg-slate-950/80 border border-slate-800/80 text-slate-400 font-mono"
              }`}>
                <div className="flex items-center gap-2">
                  <ShieldCheck className={`w-4 h-4 ${isModern ? "text-red-400" : "text-cyan-400"}`} />
                  <span>Sichere 256-bit SSL/TLS Zahlungsverschlüsselung & PSD2 Konformität</span>
                </div>
                <div className={`flex items-center gap-4 font-bold ${isModern ? "text-zinc-300" : "text-slate-300"}`}>
                  <span>PayPal</span>
                  <span>Visa</span>
                  <span>Mastercard</span>
                  <span>Klarna</span>
                  <span className={isModern ? "text-zinc-300" : "text-purple-400"}>SEPA Direct Debit (IBAN)</span>
                </div>
              </div>

            </div>
          )}

          {/* ================= TAB 4: INVOICES & RECEIPTS ================= */}
          {activeTab === "invoices" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${
                    isModern ? "text-zinc-100 font-sans" : "text-white font-mono"
                  }`}>
                    <FileText className={`w-4 h-4 ${isModern ? "text-red-400" : "text-cyan-400"}`} />
                    <span>Rechnungsübersicht & Belege</span>
                  </h3>
                  <p className={`text-xs mt-0.5 ${isModern ? "text-zinc-400" : "text-slate-400"}`}>
                    Offizielle steuerkonforme S.Y.N.T.A.X. Sovereign OS Rechnungen mit 19% MwSt.-Ausweisung.
                  </p>
                </div>
                {profile?.invoices && profile.invoices.length > 0 && (
                  <span className={`self-start sm:self-auto px-2.5 py-1 rounded-full text-[10.5px] font-mono font-bold ${
                    isModern
                      ? "bg-zinc-800 border border-zinc-700 text-zinc-300"
                      : "bg-cyan-950/60 border border-cyan-500/30 text-cyan-300"
                  }`}>
                    {profile.invoices.length} {profile.invoices.length === 1 ? "Dokument" : "Dokumente"}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {profile?.invoices && profile.invoices.length > 0 ? (
                  profile.invoices.map((inv) => {
                    const breakdown = computeInvoiceBreakdown(inv.amount, inv.netAmount, inv.taxAmount);
                    const formattedNum = formatInvoiceNumber(inv.number);

                    return (
                      <div
                        key={inv.id}
                        className={`p-4 sm:p-5 rounded-2xl transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-xs group ${
                          isModern
                            ? "bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 shadow-sm text-zinc-200"
                            : "bg-[#060b18] border border-cyan-500/20 hover:border-cyan-400/50 hover:shadow-[0_0_25px_rgba(0,240,255,0.12)] text-slate-100"
                        }`}
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="font-bold text-sm flex flex-wrap items-center gap-2">
                            <span className={`font-mono tracking-wide ${
                              isModern ? "text-zinc-100 font-bold" : "text-cyan-400 font-extrabold"
                            }`}>
                              {formattedNum}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-semibold ${
                              isModern
                                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                                : "bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold"
                            }`}>
                              {inv.status === "PAID" ? "BEZAHLT / PAID" : inv.status}
                            </span>
                          </div>

                          <div className={`text-xs ${isModern ? "font-medium text-zinc-200 font-sans" : "font-semibold text-slate-200"}`}>
                            {inv.planName}
                          </div>

                          <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] ${
                            isModern ? "text-zinc-400 font-sans" : "text-slate-400"
                          }`}>
                            <span>📅 Datum: <strong className={isModern ? "text-zinc-200 font-semibold" : "text-slate-300"}>{inv.date}</strong></span>
                            <span>•</span>
                            <span>💳 {inv.paymentMethodLabel}</span>
                            <span>•</span>
                            <span>Netto: <strong className={isModern ? "text-zinc-200 font-semibold" : "text-slate-300"}>€{breakdown.net.toFixed(2)}</strong></span>
                            <span>•</span>
                            <span>19% MwSt: <strong className={isModern ? "text-zinc-200 font-semibold" : "text-slate-300"}>€{breakdown.tax.toFixed(2)}</strong></span>
                          </div>
                        </div>

                        {/* Amount and Action Buttons */}
                        <div className={`flex items-center justify-between lg:justify-end gap-3 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 ${
                          isModern ? "border-zinc-800" : "border-slate-800/80"
                        }`}>
                          <div className="text-left lg:text-right">
                            <div className={`text-[10px] uppercase ${isModern ? "text-zinc-400 font-sans" : "font-mono text-slate-400"}`}>
                              Gesamtsumme
                            </div>
                            <div className={`text-base ${
                              isModern ? "font-sans font-bold text-zinc-100" : "font-mono font-black text-cyan-300"
                            }`}>
                              €{breakdown.gross.toFixed(2)} {inv.currency}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewInvoice(inv)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                                isModern
                                  ? "bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 shadow-sm"
                                  : "bg-slate-900 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-400 text-slate-200 hover:text-cyan-300 font-bold"
                              }`}
                              title="Rechnung in Vorschau ansehen"
                            >
                              <Eye className={`w-3.5 h-3.5 ${isModern ? "text-zinc-300" : "text-cyan-400"}`} />
                              <span className="hidden sm:inline">Vorschau</span>
                            </button>

                            <button
                              onClick={() => handlePrintInvoice(inv)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                                isModern
                                  ? "bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 shadow-sm"
                                  : "bg-slate-900 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-400 text-slate-200 hover:text-cyan-300 font-bold"
                              }`}
                              title="Drucken oder als PDF sichern"
                            >
                              <Printer className={`w-3.5 h-3.5 ${isModern ? "text-zinc-300" : "text-cyan-400"}`} />
                              <span className="hidden sm:inline">Drucken / PDF</span>
                            </button>

                            <button
                              onClick={() => handleDownloadInvoice(inv)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                                isModern
                                  ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-md border border-red-500/30"
                                  : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-black shadow-[0_0_12px_rgba(0,240,255,0.3)]"
                              }`}
                              title="HTML/PDF Beleg herunterladen"
                            >
                              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Herunterladen</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className={`p-8 text-center rounded-2xl text-xs ${
                    isModern
                      ? "bg-zinc-900/40 border border-zinc-800 text-zinc-400 font-sans"
                      : "bg-slate-950/60 border border-slate-800 text-slate-400"
                  }`}>
                    Noch keine Rechnungen vorhanden.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 5: SECURITY & PASSWORD ================= */}
          {activeTab === "security" && (
            <div className="space-y-6 animate-in fade-in duration-150 max-w-xl">
              <div>
                <h3 className={`text-sm font-bold uppercase tracking-wider ${
                  isModern ? "text-zinc-100 font-sans" : "text-white font-mono"
                }`}>
                  Passwort & Sicherheit
                </h3>
                <p className={`text-xs mt-0.5 ${isModern ? "text-zinc-400" : "text-slate-400"}`}>
                  Ändere dein Login-Passwort für deinen S.Y.N.T.A.X. Account.
                </p>
              </div>

              <form onSubmit={handleChangePassword} className={`space-y-4 p-5 rounded-2xl border ${
                isModern ? "bg-zinc-900 border-zinc-800 text-zinc-200 font-sans" : "bg-[#070b1e] border-slate-800 text-slate-200 font-mono"
              }`}>
                <div>
                  <label className={`text-[11px] font-bold block mb-1 ${isModern ? "text-zinc-400" : "text-slate-400"}`}>AKTUELLES PASSWORT</label>
                  <input
                    type="password"
                    value={currentPasswordInput}
                    onChange={(e) => setCurrentPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full px-4 py-2.5 rounded-xl text-xs outline-none ${
                      isModern
                        ? "bg-zinc-950 border border-zinc-800 text-white focus:border-red-500"
                        : "bg-slate-950 border border-slate-700 text-white font-mono focus:border-cyan-400"
                    }`}
                  />
                </div>

                <div>
                  <label className={`text-[11px] font-bold block mb-1 ${isModern ? "text-zinc-400" : "text-slate-400"}`}>NEUES PASSWORT (MIN. 6 ZEICHEN)</label>
                  <input
                    type="password"
                    required
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Mindestens 6 Zeichen"
                    className={`w-full px-4 py-2.5 rounded-xl text-xs outline-none ${
                      isModern
                        ? "bg-zinc-950 border border-zinc-800 text-white focus:border-red-500"
                        : "bg-slate-950 border border-slate-700 text-white font-mono focus:border-cyan-400"
                    }`}
                  />
                </div>

                <div>
                  <label className={`text-[11px] font-bold block mb-1 ${isModern ? "text-zinc-400" : "text-slate-400"}`}>NEUES PASSWORT BESTÄTIGEN</label>
                  <input
                    type="password"
                    required
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    placeholder="Wiederhole das neue Passwort"
                    className={`w-full px-4 py-2.5 rounded-xl text-xs outline-none ${
                      isModern
                        ? "bg-zinc-950 border border-zinc-800 text-white focus:border-red-500"
                        : "bg-slate-950 border border-slate-700 text-white font-mono focus:border-cyan-400"
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className={`w-full py-3 rounded-xl font-semibold text-xs uppercase tracking-wider transition cursor-pointer shadow-md active:scale-95 ${
                    isModern
                      ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white"
                      : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold"
                  }`}
                >
                  {isUpdatingPassword ? "Speichere..." : "Passwort Aktualisieren"}
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

      {/* ================= MODAL: UPGRADE CONFIRMATION ================= */}
      {showUpgradeConfirm && (
        <div className="fixed inset-0 z-[180] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 ${
            isModern
              ? "bg-zinc-950 border border-zinc-800 text-zinc-200 font-sans"
              : "bg-[#070e28] border-2 border-purple-500/60 font-mono text-slate-200"
          }`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${
              isModern ? "bg-red-500/15 border border-red-500/30 text-red-400" : "bg-purple-500/20 border border-purple-400 text-purple-400"
            }`}>
              <Sparkles className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-white uppercase tracking-wider">Upgrade Bestätigen</h3>
              <p className={`text-xs mt-1 ${isModern ? "text-zinc-300" : "text-slate-300"}`}>
                Möchtest du dein Abonnement auf <strong>{selectedUpgradePlan === "ENTERPRISE_99" ? "Sovereign Enterprise" : selectedUpgradePlan === "PRO_29" ? "Pro Sovereign Core" : "Dedicated Fleet"}</strong> ({billingCycle}) umstellen?
              </p>
            </div>

            <div className={`p-3 rounded-xl text-xs space-y-1.5 border ${
              isModern ? "bg-zinc-900 border-zinc-800" : "bg-slate-950 border-slate-800"
            }`}>
              <div className={`flex justify-between ${isModern ? "text-zinc-400" : "text-slate-400"}`}>
                <span>Zahlungsmethode:</span>
                <span className={`font-bold ${isModern ? "text-red-300" : "text-cyan-300"}`}>{profile?.paymentMethods.find((p) => p.isDefault)?.label || "PayPal"}</span>
              </div>
              <div className={`flex justify-between ${isModern ? "text-zinc-400" : "text-slate-400"}`}>
                <span>Sofortiger Zugriff:</span>
                <span className="text-emerald-400 font-bold">100% Freigeschaltet</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowUpgradeConfirm(false)}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer ${
                  isModern
                    ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
                    : "bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold uppercase"
                }`}
              >
                Abbrechen
              </button>
              <button
                type="button"
                disabled={isUpgrading}
                onClick={handleUpgradePlanSubmit}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider cursor-pointer shadow-md transition ${
                  isModern
                    ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white"
                    : "bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-slate-950 font-black"
                }`}
              >
                {isUpgrading ? "Aktiviert..." : "Jetzt Upgraden"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CANCEL SUBSCRIPTION ================= */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[180] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 ${
            isModern
              ? "bg-zinc-950 border border-zinc-800 text-zinc-200 font-sans"
              : "bg-[#16050b] border-2 border-rose-500/60 font-mono text-slate-200"
          }`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${
              isModern ? "bg-red-500/15 border border-red-500/30 text-red-400" : "bg-rose-500/20 border border-rose-400 text-rose-400"
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-white uppercase tracking-wider">Abo wirklich kündigen?</h3>
              <p className={`text-xs mt-1 ${isModern ? "text-zinc-300" : "text-slate-300"}`}>
                Dein Zugang zu allen 8 Cores bleibt bis zum Ende der aktuellen Abrechnungsperiode (<strong>{profile?.subscription?.nextBillingDate || "30 Tage"}</strong>) voll aktiv.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <label className={`block font-semibold ${isModern ? "text-zinc-400" : "text-slate-400 font-bold"}`}>GRUND FÜR DIE KÜNDIGUNG</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-xs outline-none ${
                  isModern ? "bg-zinc-900 border border-zinc-800 text-zinc-200" : "bg-slate-950 border border-slate-800 text-slate-200"
                }`}
              >
                <option value="temporary">Vorübergehend pausieren</option>
                <option value="too_expensive">Zu teuer für mich</option>
                <option value="feature_missing">Benötigte Funktion fehlt</option>
                <option value="other">Sonstiges</option>
              </select>

              <textarea
                value={cancelFeedback}
                onChange={(e) => setCancelFeedback(e.target.value)}
                placeholder="Optionales Feedback an das S.Y.N.T.A.X. Team..."
                className={`w-full p-2.5 rounded-xl text-xs outline-none h-16 resize-none ${
                  isModern ? "bg-zinc-900 border border-zinc-800 text-zinc-200" : "bg-slate-950 border border-slate-800 text-slate-200"
                }`}
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer ${
                  isModern ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700" : "bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold uppercase"
                }`}
              >
                Behalten
              </button>
              <button
                type="button"
                disabled={isProcessingCancel}
                onClick={handleCancelSubscriptionSubmit}
                className={`flex-1 py-2.5 rounded-xl text-white font-semibold text-xs uppercase tracking-wider cursor-pointer shadow-md transition ${
                  isModern ? "bg-red-600 hover:bg-red-500" : "bg-rose-600 hover:bg-rose-500 font-black shadow-lg"
                }`}
              >
                {isProcessingCancel ? "Kündige..." : "Kündigung Bestätigen"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD PAYMENT METHOD ================= */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 z-[180] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`w-full max-w-3xl md:max-w-4xl max-h-[92vh] overflow-y-auto custom-scrollbar rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 ${
            isModern
              ? "bg-zinc-950 border border-zinc-800 text-zinc-200 font-sans"
              : "bg-[#04081c] border-2 border-emerald-500/60 font-mono text-slate-200"
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${
              isModern ? "border-zinc-800" : "border-slate-800"
            }`}>
              <div className="flex items-center gap-2.5">
                <CreditCard className={`w-5 h-5 ${isModern ? "text-red-400" : "text-emerald-400"}`} />
                <h3 className="text-base md:text-lg font-bold text-white uppercase tracking-wider">Zahlungsmethode hinzufügen</h3>
              </div>
              <button
                onClick={() => setShowAddPaymentModal(false)}
                className={`p-1 rounded-lg transition cursor-pointer ${
                  isModern ? "text-zinc-400 hover:text-white hover:bg-zinc-900" : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Method Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <button
                type="button"
                onClick={() => setPaymentType("paypal")}
                className={`py-3 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  paymentType === "paypal"
                    ? isModern
                      ? "bg-zinc-800 text-white border border-blue-500/40 shadow-sm"
                      : "bg-blue-600 text-white shadow-lg border border-blue-400/40"
                    : isModern
                    ? "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700"
                    : "bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700"
                }`}
              >
                <span>PayPal</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentType("card")}
                className={`py-3 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  paymentType === "card"
                    ? isModern
                      ? "bg-zinc-800 text-white border border-emerald-500/40 shadow-sm"
                      : "bg-emerald-600 text-white shadow-lg border border-emerald-400/40"
                    : isModern
                    ? "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700"
                    : "bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700"
                }`}
              >
                <span>Kreditkarte</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentType("klarna")}
                className={`py-3 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  paymentType === "klarna"
                    ? isModern
                      ? "bg-zinc-800 text-white border border-pink-500/40 shadow-sm"
                      : "bg-pink-600 text-white shadow-lg border border-pink-400/40"
                    : isModern
                    ? "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700"
                    : "bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700"
                }`}
              >
                <span>Klarna</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentType("sepa")}
                className={`py-3 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  paymentType === "sepa"
                    ? isModern
                      ? "bg-zinc-800 text-white border border-purple-500/40 shadow-sm"
                      : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] border border-purple-400/50"
                    : isModern
                    ? "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700"
                    : "bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700"
                }`}
              >
                <Layers className="w-4 h-4 text-purple-400" />
                <span>SEPA Lastschrift</span>
              </button>
            </div>

            {/* Form per method */}
            <form onSubmit={handleAddPaymentSubmit} className="space-y-4 text-xs">
              {paymentType === "sepa" && (
                <div className={`space-y-3.5 p-4 rounded-2xl border ${
                  isModern
                    ? "bg-zinc-900/80 border-zinc-800 shadow-sm text-zinc-200"
                    : "bg-gradient-to-b from-[#080d28] via-[#05091e] to-[#030612] border-2 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.2)]"
                }`}>
                  <div className="flex items-center gap-2 text-purple-300 font-bold">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <span>SEPA-Lastschriftmandat (Bankeinzug)</span>
                  </div>

                  <div>
                    <label className={`block mb-1 font-semibold ${isModern ? "text-zinc-300" : "text-slate-300"}`}>
                      Kontoinhaber (Vollständiger Name)
                    </label>
                    <input
                      type="text"
                      required
                      value={sepaHolder}
                      onChange={(e) => setSepaHolder(e.target.value)}
                      placeholder="z.B. Max Mustermann"
                      className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                        isModern ? "bg-zinc-950 border-zinc-800 text-white" : "bg-[#030612] border-slate-700 text-white"
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block mb-1 font-semibold ${isModern ? "text-zinc-300" : "text-slate-300"}`}>
                      IBAN (International Bank Account Number)
                    </label>
                    <input
                      type="text"
                      required
                      value={sepaIban}
                      onChange={(e) => setSepaIban(e.target.value)}
                      placeholder="DE89 3704 0044 0532 0130 00"
                      className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-mono ${
                        isModern ? "bg-zinc-950 border-zinc-800 text-white" : "bg-[#030612] border-slate-700 text-white"
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block mb-1 font-semibold ${isModern ? "text-zinc-300" : "text-slate-300"}`}>
                      BIC / SWIFT (Optional für europäische Konten)
                    </label>
                    <input
                      type="text"
                      value={sepaBic}
                      onChange={(e) => setSepaBic(e.target.value)}
                      placeholder="z.B. COBADEFFXXX"
                      className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-mono ${
                        isModern ? "bg-zinc-950 border-zinc-800 text-white" : "bg-[#030612] border-slate-700 text-white"
                      }`}
                    />
                  </div>

                  <div className={`p-3 rounded-xl border text-[11px] leading-relaxed ${
                    isModern ? "bg-zinc-950 border-zinc-800 text-zinc-400" : "bg-black/50 border-slate-800 text-slate-400"
                  }`}>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sepaMandateAccepted}
                        onChange={(e) => setSepaMandateAccepted(e.target.checked)}
                        className="mt-0.5 accent-purple-500"
                        required
                      />
                      <span>
                        Ich ermächtige SYNTAX QUANTUM, Zahlungen von meinem Konto mittels Lastschrift einzuziehen. Zugleich weise ich mein Kreditinstitut an, die von SYNTAX QUANTUM auf mein Konto gezogenen Lastschriften einzulösen.
                      </span>
                    </label>
                  </div>
                </div>
              )}
              {paymentType === "paypal" && (
                <div className={`space-y-3 p-4 rounded-2xl border ${
                  isModern ? "bg-zinc-900 border-zinc-800" : "bg-slate-950 border border-slate-800"
                }`}>
                  <div className="flex items-center gap-2 text-blue-400 font-bold">
                    <span>PayPal E-Mail Adresse</span>
                  </div>
                  <input
                    type="email"
                    required
                    value={paypalEmailInput}
                    onChange={(e) => setPaypalEmailInput(e.target.value)}
                    placeholder="paypal-account@domain.de"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-white outline-none ${
                      isModern ? "bg-zinc-950 border border-zinc-800 focus:border-blue-500" : "bg-[#060a1a] border border-slate-700 focus:border-blue-400"
                    }`}
                  />
                  <p className={`text-[11px] ${isModern ? "text-zinc-400" : "text-slate-400"}`}>
                    Mit Klick auf Speichern wird dein PayPal Account sicher für zukünftige Abbuchungen autorisiert.
                  </p>
                </div>
              )}

              {paymentType === "card" && (
                <div className={`space-y-3 p-4 rounded-2xl border ${
                  isModern ? "bg-zinc-900 border-zinc-800" : "bg-slate-950 border border-slate-800"
                }`}>
                  <div>
                    <label className={`block mb-1 font-semibold ${isModern ? "text-zinc-400" : "text-slate-400"}`}>KARTENINHABER</label>
                    <input
                      type="text"
                      required
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Name auf der Karte"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-white outline-none ${
                        isModern ? "bg-zinc-950 border border-zinc-800 focus:border-red-500" : "bg-[#060a1a] border border-slate-700 focus:border-emerald-400"
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block mb-1 font-semibold ${isModern ? "text-zinc-400" : "text-slate-400"}`}>KARTENNUMMER</label>
                    <input
                      type="text"
                      required
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
                        setCardNumber(val);
                      }}
                      placeholder="4532 •••• •••• 4242"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-white outline-none font-mono ${
                        isModern ? "bg-zinc-950 border border-zinc-800 focus:border-red-500" : "bg-[#060a1a] border border-slate-700 focus:border-emerald-400"
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block mb-1 font-semibold ${isModern ? "text-zinc-400" : "text-slate-400"}`}>GÜLTIG BIS</label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, "");
                          if (val.length > 2) val = val.slice(0, 2) + "/" + val.slice(2, 4);
                          setCardExpiry(val);
                        }}
                        placeholder="MM/YY"
                        className={`w-full px-3.5 py-2.5 rounded-xl text-white outline-none text-center font-mono ${
                          isModern ? "bg-zinc-950 border border-zinc-800 focus:border-red-500" : "bg-[#060a1a] border border-slate-700 focus:border-emerald-400"
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block mb-1 font-semibold ${isModern ? "text-zinc-400" : "text-slate-400"}`}>CVC / CVV</label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ""))}
                        placeholder="123"
                        className={`w-full px-3.5 py-2.5 rounded-xl text-white outline-none text-center font-mono ${
                          isModern ? "bg-zinc-950 border border-zinc-800 focus:border-red-500" : "bg-[#060a1a] border border-slate-700 focus:border-emerald-400"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentType === "klarna" && (
                <div className={`space-y-3 p-4 rounded-2xl border ${
                  isModern ? "bg-zinc-900 border-zinc-800" : "bg-slate-950 border border-slate-800"
                }`}>
                  <div className="text-pink-400 font-bold">Klarna Zahlungsoption wählen</div>
                  <div className="space-y-2">
                    {[
                      { id: "pay_later", label: "Rechnung (Erst in 30 Tagen zahlen)", badge: "0% Zinsen" },
                      { id: "slice_it", label: "Ratenkauf (Flexibel in Raten)", badge: "Monatlich" },
                      { id: "pay_now", label: "Sofortüberweisung / Direkt", badge: "Live" },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        onClick={() => setKlarnaOption(opt.id as any)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                          klarnaOption === opt.id
                            ? isModern
                              ? "bg-zinc-800 border-pink-500/60 text-white"
                              : "bg-pink-950/30 border-pink-500 text-white"
                            : isModern
                            ? "bg-zinc-950 border-zinc-800 text-zinc-300"
                            : "bg-[#060a1a] border-slate-800 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="klarna_opt"
                            checked={klarnaOption === opt.id}
                            onChange={() => setKlarnaOption(opt.id as any)}
                          />
                          <span>{opt.label}</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300">{opt.badge}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <label className={`flex items-center gap-2 cursor-pointer pt-1 ${isModern ? "text-zinc-300" : "text-slate-300"}`}>
                <input
                  type="checkbox"
                  checked={setAsDefaultCheck}
                  onChange={(e) => setSetAsDefaultCheck(e.target.checked)}
                />
                <span>Als Standard-Zahlungsmethode festlegen</span>
              </label>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPaymentModal(false)}
                  className={`flex-1 py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer ${
                    isModern ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700" : "bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold uppercase"
                  }`}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={isProcessingPaymentAdd}
                  className={`flex-1 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider cursor-pointer shadow-md transition ${
                    isModern
                      ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white"
                      : paymentType === "crypto"
                      ? "bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 hover:from-purple-300 hover:to-emerald-300 text-slate-950 font-black shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                      : "bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black shadow-lg"
                  }`}
                >
                  {isProcessingPaymentAdd
                    ? "Speichere..."
                    : paymentType === "crypto"
                    ? `Zahlung bestätigen & 20% Rabatt sichern`
                    : "Zahlungsart Speichern"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Cyberpunk Tax Invoice Viewer Modal */}
      <InvoiceViewerModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        invoice={selectedInvoice}
        profileInfo={{
          name: profile?.name,
          email: profile?.email,
          slot: profile?.slot,
          token: profile?.token,
        }}
        lang={lang}
      />

    </div>
  );
};
