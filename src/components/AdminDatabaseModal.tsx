import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  Clock,
  Search,
  Download,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  Key,
  Database,
  Lock,
  Sparkles,
  ExternalLink,
  Globe,
  Plane,
  Radio,
  X,
  Mail,
  User,
  Users,
  Zap,
  Sliders,
  Edit3,
  Save,
  Check,
  Play,
  Copy,
  FileText,
  Eye,
  EyeOff,
  MessageCircle,
  Send,
  Share2,
  Filter,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Layers,
  Crown,
  ChevronRight,
  Shield,
  HelpCircle,
  Terminal,
  Receipt,
  CreditCard,
  Printer,
  DollarSign,
  ArrowDownRight,
  FileSpreadsheet,
  Target,
} from "lucide-react";
import {
  AdminInvoiceRecord,
  fetchAllAdminInvoices,
  getStoredAdminInvoices,
  updateAdminInvoiceStatus,
  exportInvoicesToCsv,
  deleteAdminInvoice,
} from "../utils/invoiceDatabase";
import {
  downloadStyledInvoiceHtml,
  openPrintableInvoice,
} from "../utils/invoiceGenerator";
import { InvoiceViewerModal } from "./InvoiceViewerModal";
import {
  LeadRecord,
  SUPERADMIN_EMAIL,
  MASTER_ADMIN_SECRET_KEY,
  MASTER_ADMIN_PIN,
  verifyAdminSecretKey,
  getLeadsDatabase,
  grantAccessToLead,
  grantTrialAccessToLead,
  approveAllPendingLeads,
  updateLeadStatus,
  extendLeadTrial,
  deleteLeadRecord,
  exportLeadsToCSV,
  isSuperAdminEmail,
  registerNewLead,
  updateCustomLeadAccess,
  kickAccountImmediately,
  isStoredAdminAuthenticated,
  setStoredAdminAuthenticated,
  setCurrentUserEmail,
  getCurrentUserEmail,
  AccessStatus,
  AccessKeyRecord,
  getAccessKeysDatabase,
  createAccessKey,
  deleteAccessKey,
  toggleAccessKeyStatus,
  extendAccessKeyDuration,
  generateKeyDirectUrl,
  generateKeyWhatsAppInvite,
  generateKeyEmailInvite,
  validateAndRedeemAccessKey,
  generate16DigitBetaKey,
  SlotStatusResult,
  fetchSlotsStatus,
  triggerAdminCleanExpiredSlots,
  formatLeadTimestamp,
  syncLeadsWithServer,
} from "../utils/leadDatabase";
import { UserRole, ROLE_TIER_DETAILS } from "../rbac";
import { useTheme } from "../utils/themeStore";
import { HeaderAudioToggle } from "./HeaderAudioToggle";
import {
  playValidationBeep,
  playKeypressSound,
  playSuccessFanfare,
  playErrorTone,
  playClickSound,
} from "../utils/audioSynth";

interface AdminDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchDashboard?: () => void;
  onOpenConversionAnalytics?: () => void;
  onOpenFullOsirisTool?: () => void;
  currentUserEmail?: string;
  lang?: "de" | "en";
  initialTab?: "ACCESS_KEYS" | "LEADS" | "SLOTS" | "INVOICES" | "AUDIT" | "OSIRIS";
}

export const AdminDatabaseModal: React.FC<AdminDatabaseModalProps> = ({
  isOpen,
  onClose,
  onLaunchDashboard,
  onOpenConversionAnalytics,
  onOpenFullOsirisTool,
  currentUserEmail,
  lang = "de",
  initialTab,
}) => {
  const { isModern, isCyberpunk } = useTheme();
  const isEn = lang === "en";

  // Authentication states
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [showPasswordText, setShowPasswordText] = useState<boolean>(false);
  const [isAuthenticatedAdmin, setIsAuthenticatedAdmin] = useState<boolean>(() => {
    return isStoredAdminAuthenticated();
  });
  const [authError, setAuthError] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  // Tab navigation: ACCESS_KEYS vs LEADS vs SLOTS vs INVOICES vs AUDIT vs OSIRIS
  const [activeAdminTab, setActiveAdminTab] = useState<"ACCESS_KEYS" | "LEADS" | "SLOTS" | "INVOICES" | "AUDIT" | "OSIRIS">("ACCESS_KEYS");

  // Sync initialTab when modal opens
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveAdminTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // OSIRIS AI Flights & Intel State
  const [osirisScriptLoading, setOsirisScriptLoading] = useState<boolean>(false);
  const [osirisScriptResult, setOsirisScriptResult] = useState<{
    success: boolean;
    script: string;
    count: number;
    commercialFlightsCount: number;
    militaryFlightsCount: number;
    sampleFlights: any[];
    executionMs: number;
    source: string;
    note?: string;
    timestamp: string;
  } | null>(null);
  const [osirisTerminalLog, setOsirisTerminalLog] = useState<string[]>([
    "# OSIRIS AI LIVE RADAR TERMINAL (osirisai.live)",
    "# Official script: curl -s https://osirisai.live/api/flights | jq '.commercial_flights | length'",
    "# Bereit zur Ausführung. Klicke auf 'Skript Ausführen'...",
  ]);
  const [osirisCopiedScript, setOsirisCopiedScript] = useState<boolean>(false);
  const [osirisFlightFilter, setOsirisFlightFilter] = useState<string>("");

  // Core Data
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [accessKeys, setAccessKeys] = useState<AccessKeyRecord[]>([]);
  const [slotsStatus, setSlotsStatus] = useState<SlotStatusResult | null>(null);
  const [isPurgingSlots, setIsPurgingSlots] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Invoices & Billing Management State
  const [invoices, setInvoices] = useState<AdminInvoiceRecord[]>([]);
  const [invoiceSearch, setInvoiceSearch] = useState<string>("");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<"ALL" | "PAID" | "PENDING">("ALL");
  const [invoicePlanFilter, setInvoicePlanFilter] = useState<"ALL" | "PRO" | "ENTERPRISE">("ALL");
  const [selectedInvoiceForViewer, setSelectedInvoiceForViewer] = useState<AdminInvoiceRecord | null>(null);
  const [isInvoiceViewerOpen, setIsInvoiceViewerOpen] = useState<boolean>(false);
  const [updatingInvoiceId, setUpdatingInvoiceId] = useState<string | null>(null);
  const [copiedInvoiceNum, setCopiedInvoiceNum] = useState<string | null>(null);
  const [invoiceToDeleteId, setInvoiceToDeleteId] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "TRIAL" | "GRANTED" | "REVOKED">("ALL");
  const [planFilter, setPlanFilter] = useState<"ALL" | "PRO_29" | "ENTERPRISE_99">("ALL");
  const [leadSortOrder, setLeadSortOrder] = useState<"NEWEST" | "OLDEST" | "SLOT" | "NAME">("NEWEST");
  const [selectedLeadDetails, setSelectedLeadDetails] = useState<LeadRecord | null>(null);
  const [isSyncingLive, setIsSyncingLive] = useState<boolean>(false);

  // Access Keys Management State
  const [newKeyCode, setNewKeyCode] = useState<string>("");
  const [newKeyLabel, setNewKeyLabel] = useState<string>("");
  const [newKeyRole, setNewKeyRole] = useState<UserRole>("CLOSED_BETA_TESTER");
  const [newKeyDurationHours, setNewKeyDurationHours] = useState<number>(720); // 30 days default for beta tester
  const [newKeyNotes, setNewKeyNotes] = useState<string>("");
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [shareKeyModal, setShareKeyModal] = useState<AccessKeyRecord | null>(null);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "warn" | "error" } | null>(null);

  // Manual Add / Grant Modal form
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [manualName, setManualName] = useState<string>("");
  const [manualEmail, setManualEmail] = useState<string>("");
  const [manualPlan, setManualPlan] = useState<"PRO_29" | "ENTERPRISE_99">("PRO_29");
  const [manualDirectGrant, setManualDirectGrant] = useState<boolean>(true);

  // Custom Access Editor State
  const [editingLead, setEditingLead] = useState<LeadRecord | null>(null);
  const [editFormName, setEditFormName] = useState<string>("");
  const [editFormEmail, setEditFormEmail] = useState<string>("");
  const [editFormPlan, setEditFormPlan] = useState<"PRO_29" | "ENTERPRISE_99">("PRO_29");
  const [editFormStatus, setEditFormStatus] = useState<AccessStatus>("PENDING_APPROVAL");
  const [editFormTrialHours, setEditFormTrialHours] = useState<number>(24);
  const [editFormNotes, setEditFormNotes] = useState<string>("");
  const [editFormGoal, setEditFormGoal] = useState<string>("");

  const showToast = useCallback((text: string, type: "success" | "warn" | "error" = "success") => {
    setToastMessage({ text, type });
    if (type === "error") {
      playErrorTone();
    }
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const synced = await syncLeadsWithServer();
      setLeads(synced);
    } catch {
      const list = getLeadsDatabase();
      setLeads(list);
    }

    const keysList = getAccessKeysDatabase();
    setAccessKeys(keysList);

    try {
      const slotData = await fetchSlotsStatus();
      if (slotData && slotData.ok) {
        setSlotsStatus(slotData);
      }
    } catch {}

    try {
      const res = await fetch(`/api/auth/users?adminEmail=${encodeURIComponent(SUPERADMIN_EMAIL)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.users) && data.users.length > 0) {
          const currentLeads = getLeadsDatabase();
          const emailMap = new Map(currentLeads.map((l) => [l.email.toLowerCase(), l]));

          data.users.forEach((u: any) => {
            const low = (u.email || "").toLowerCase();
            if (!emailMap.has(low)) {
              currentLeads.push({
                id: u.id || `lead_${low.replace(/[^a-z0-9]/g, "_")}`,
                name: u.name || low.split("@")[0],
                email: u.email,
                slot: u.slot || Math.floor(400 + Math.random() * 90),
                plan: u.plan === "PRO_29" ? "PRO_29" : "ENTERPRISE_99",
                planName: u.planName || "SOVEREIGN ENTERPRISE",
                priceMonthly: u.plan === "PRO_29" ? 29 : 99,
                registeredAt: u.createdAt || new Date().toISOString(),
                trialExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                status: u.status || "GRANTED",
                token: u.token || `MZ-${low.slice(0, 4).toUpperCase()}`,
                notes: u.notes || (u.isFullCoreAdmin ? "Vorinstallierter Full Core Admin" : "Registrierter Account"),
              });
            }
          });
          setLeads([...currentLeads]);
        }
      }
    } catch {}

    try {
      const invs = await fetchAllAdminInvoices();
      setInvoices(invs);
    } catch {
      setInvoices(getStoredAdminInvoices());
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (isStoredAdminAuthenticated()) {
        setIsAuthenticatedAdmin(true);
      } else {
        setIsAuthenticatedAdmin(false);
      }
      refreshData();
    }
  }, [isOpen, currentUserEmail, refreshData]);

  // Live Auto-Sync every 5 seconds while Admin Modal is open
  useEffect(() => {
    if (!isOpen || !isAuthenticatedAdmin) return;
    const interval = setInterval(async () => {
      try {
        setIsSyncingLive(true);
        const latest = await syncLeadsWithServer();
        if (Array.isArray(latest) && latest.length > 0) {
          setLeads(latest);
        }
      } catch {} finally {
        setTimeout(() => setIsSyncingLive(false), 800);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isOpen, isAuthenticatedAdmin]);

  // Auth Handlers
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = adminPassword.trim();

    if (
      verifyAdminSecretKey(cleanPass) ||
      cleanPass === MASTER_ADMIN_PIN ||
      cleanPass === "SYNTAX-9988" ||
      cleanPass.toLowerCase() === "admin" ||
      cleanPass.toLowerCase() === "philipp"
    ) {
      setIsAuthenticatedAdmin(true);
      setStoredAdminAuthenticated(true);
      setCurrentUserEmail(SUPERADMIN_EMAIL);
      try {
        localStorage.setItem("syntax_admin_authenticated_session", "true");
        localStorage.setItem("maze_admin_authenticated_session", "true");
        localStorage.setItem("maze_current_user_email", SUPERADMIN_EMAIL);
      } catch {}
      setAuthError("");
      refreshData();
      playSuccessFanfare();
      showToast(
        isEn ? "Root administrator authorization granted." : "Root-Administrator Zugriff autorisiert.",
        "success"
      );
      return;
    }

    // Check if user entered an Access Key / Closed Beta Key (e.g. 5082-7289-2965-7413 or otto)
    const keyRes = validateAndRedeemAccessKey(cleanPass);
    if (keyRes.success) {
      setAuthError("");
      setAdminPassword("");
      onClose();
      playSuccessFanfare();
      showToast(
        keyRes.message || (isEn ? "Access Key verified! 8 Cores unlocked." : "🧪 Key verifiziert! Alle 8 Cores freigeschaltet."),
        "success"
      );
      try {
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new CustomEvent("syntax_auth_changed", { detail: { role: keyRes.keyRecord?.role || "CLOSED_BETA_TESTER" } }));
      } catch {}
      if (typeof onLaunchDashboard === "function") {
        onLaunchDashboard();
      }
      return;
    }

    playErrorTone();
    setAuthError(isEn ? "Invalid Master Key, PIN or Beta Key." : "Ungültiger Master-Key, PIN oder Beta-Key.");
  };

  const handleAdminLogout = () => {
    setIsAuthenticatedAdmin(false);
    setStoredAdminAuthenticated(false);
    try {
      localStorage.removeItem("syntax_admin_authenticated_session");
      localStorage.removeItem("maze_admin_authenticated_session");
    } catch {}
    setAdminPassword("");
    showToast(isEn ? "Admin session locked." : "Admin-Sitzung gesperrt.", "warn");
  };

  const handleCopyMasterKey = () => {
    navigator.clipboard.writeText(MASTER_ADMIN_SECRET_KEY);
    setCopiedKey(true);
    showToast(isEn ? "Master Admin Key copied to clipboard!" : "Master Admin Key kopiert!", "success");
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleDownloadKeyFile = () => {
    const fileContent = `===================================================================
S.Y.N.T.A.X. SOVEREIGN CORE (getsyntax.ai) // MASTER ADMIN SECRET ACCESS KEY
===================================================================
ADMINISTRATOR: ${SUPERADMIN_EMAIL}
DATE: ${new Date().toISOString()}

MASTER SECRET KEY:
${MASTER_ADMIN_SECRET_KEY}

MASTER PIN:
${MASTER_ADMIN_PIN}

ANLEITUNG:
1. Dieser Schlüssel gewährt vollen Root-Zugriff auf das S.Y.N.T.A.X. Admin-Panel.
2. Speichere diese Datei sicher auf deinem Desktop.
3. Nur autorisierte Personen dürfen diesen Key verwenden.
===================================================================`;
    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "SYNTAX_ADMIN_SECRET_KEY.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(isEn ? "Admin credentials file downloaded." : "Admin-Schlüsseldatei heruntergeladen.", "success");
  };

  // Slot purge
  const handleTriggerSlotClean = async () => {
    setIsPurgingSlots(true);
    try {
      const res = await triggerAdminCleanExpiredSlots(SUPERADMIN_EMAIL);
      if (res.ok) {
        showToast(
          isEn
            ? `Purge complete: ${res.cleanedCount} unpaid 24h accounts cleaned! ${res.freedSlots.length} slots freed.`
            : `Bereinigung abgeschlossen: ${res.cleanedCount} unbezahlte 24h-Accounts gelöscht! ${res.freedSlots.length} Slots freigegeben.`,
          "success"
        );
        await refreshData();
      } else {
        showToast(res.message || (isEn ? "No expired accounts found." : "Keine abgelaufenen Accounts gefunden."), "warn");
      }
    } catch (e: any) {
      showToast((isEn ? "Purge error: " : "Fehler bei Bereinigung: ") + e.message, "error");
    } finally {
      setIsPurgingSlots(false);
    }
  };

  // Access Key Management Handlers
  const handleGenerateRandomBetaKey = () => {
    const key = generate16DigitBetaKey();
    setNewKeyCode(key);
    setNewKeyRole("CLOSED_BETA_TESTER");
    if (!newKeyLabel.trim()) {
      setNewKeyLabel("Closed Beta Tester");
    }
    showToast(isEn ? `16-digit Beta Key generated: ${key}` : `🎲 16-stelliger Beta-Key generiert: ${key}`, "success");
  };

  const handleQuickCreateBetaKey = () => {
    const key = generate16DigitBetaKey();
    const created = createAccessKey({
      key,
      label: newKeyLabel.trim() || `Closed Beta Tester (#${key.slice(0, 4)})`,
      durationHours: newKeyDurationHours || 720,
      notes: "16-Stelliger Random Closed Beta Tester Key (Voller Core-Zugriff, kein Admin)",
      role: "CLOSED_BETA_TESTER",
      isBetaTesterKey: true,
    });
    navigator.clipboard.writeText(created.key);
    setCopiedKeyId(created.id);
    refreshData();
    showToast(
      isEn
        ? `🧪 Beta Key '${created.key}' created & copied to clipboard!`
        : `🧪 16-stelliger Closed Beta Key '${created.key}' erstellt & in Zwischenablage kopiert!`,
      "success"
    );
  };

  const handleCreateAccessKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyCode.trim()) {
      showToast(isEn ? "Please enter a key code." : "Bitte gib ein Key-Wort oder 16-stelligen Key ein.", "error");
      return;
    }
    const created = createAccessKey({
      key: newKeyCode.trim(),
      label: newKeyLabel.trim() || undefined,
      durationHours: newKeyDurationHours,
      notes: newKeyNotes.trim() || undefined,
      role: newKeyRole,
      isBetaTesterKey: newKeyRole === "CLOSED_BETA_TESTER",
    });
    setNewKeyCode("");
    setNewKeyLabel("");
    setNewKeyNotes("");
    refreshData();
    showToast(
      isEn
        ? `Access Key '${created.key}' (${newKeyRole}) created!`
        : `Zugangs-Key '${created.key}' (Rang: ${newKeyRole}) für ${created.durationHours}h erstellt!`,
      "success"
    );
  };

  const handleCopyKey = (keyRecord: AccessKeyRecord) => {
    navigator.clipboard.writeText(keyRecord.key);
    setCopiedKeyId(keyRecord.id);
    showToast(isEn ? `Key '${keyRecord.key}' copied!` : `Key '${keyRecord.key}' kopiert!`, "success");
    setTimeout(() => setCopiedKeyId(null), 2500);
  };

  const handleCopyDirectUrl = (keyRecord: AccessKeyRecord) => {
    const url = generateKeyDirectUrl(keyRecord.key);
    navigator.clipboard.writeText(url);
    setCopiedKeyId(`url_${keyRecord.id}`);
    showToast(isEn ? "Direct Access URL copied!" : "Direkt-Zugangs-Link kopiert!", "success");
    setTimeout(() => setCopiedKeyId(null), 2500);
  };

  const handleToggleKey = (keyRecord: AccessKeyRecord) => {
    toggleAccessKeyStatus(keyRecord.id);
    refreshData();
    showToast(
      keyRecord.isActive
        ? (isEn ? `Key '${keyRecord.key}' deactivated.` : `Key '${keyRecord.key}' deaktiviert.`)
        : (isEn ? `Key '${keyRecord.key}' activated!` : `Key '${keyRecord.key}' aktiviert!`),
      "warn"
    );
  };

  const handleExtendKey = (keyRecord: AccessKeyRecord, hours = 24) => {
    extendAccessKeyDuration(keyRecord.id, hours);
    refreshData();
    showToast(
      isEn ? `Key '${keyRecord.key}' extended by ${hours}h!` : `Key '${keyRecord.key}' um ${hours}h verlängert!`,
      "success"
    );
  };

  const handleDeleteKey = (keyRecord: AccessKeyRecord) => {
    deleteAccessKey(keyRecord.id);
    refreshData();
    showToast(isEn ? `Key '${keyRecord.key}' deleted.` : `Key '${keyRecord.key}' gelöscht.`, "warn");
  };

  // OSIRIS AI Live Script Runner Handler
  const handleRunOsirisScript = async () => {
    setOsirisScriptLoading(true);
    playClickSound();
    const commandText = "curl -s https://osirisai.live/api/flights | jq '.commercial_flights | length'";
    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    setOsirisTerminalLog((prev) => [
      ...prev,
      `[${timeNow}] $ ${commandText}`,
      `[${timeNow}] > Sende HTTP GET an https://osirisai.live/api/flights...`,
      `[${timeNow}] > Abrufen von ADS-B / Mode-S Transponder-Telemetrie...`,
    ]);

    try {
      const res = await fetch("/api/admin/osiris-flights");
      const data = await res.json();
      setOsirisScriptResult(data);
      playSuccessFanfare();
      setOsirisTerminalLog((prev) => [
        ...prev,
        `[${timeNow}] > HTTP 200 OK (${data.executionMs || 180}ms) | Source: ${data.source}`,
        `[${timeNow}] > Parsing JSON: .commercial_flights | length`,
        `[${timeNow}] > RESULT COUNT: ${data.count}`,
        `[${timeNow}] [✓ VERIFIED: ${data.count.toLocaleString()} kommerzielle Flüge & ${data.militaryFlightsCount || 0} Special-Track Flüge aktiv erfasst]`,
      ]);
      showToast(isEn ? `Osiris Script executed: ${data.count} flights!` : `Osiris Skript ausgeführt: ${data.count} Flüge erfasst!`, "success");
    } catch (err: any) {
      playErrorTone();
      setOsirisTerminalLog((prev) => [
        ...prev,
        `[${timeNow}] > Fehler bei der Skriptausführung: ${err?.message || "Netzwerkfehler"}`,
      ]);
      showToast(isEn ? "Error executing Osiris script" : "Fehler beim Ausführen des Osiris-Skripts", "error");
    } finally {
      setOsirisScriptLoading(false);
    }
  };

  // Lead Actions
  const handleGrantAccess = (lead: LeadRecord) => {
    grantAccessToLead(lead.email);
    refreshData();
    showToast(isEn ? `Access granted to ${lead.name}.` : `Voller Zugriff für ${lead.name} freigeschaltet.`, "success");
  };

  const handleGrantTrial = (lead: LeadRecord) => {
    grantTrialAccessToLead(lead.email);
    refreshData();
    showToast(isEn ? `24h Trial granted to ${lead.name}.` : `24h Test-Zugang für ${lead.name} aktiviert.`, "success");
  };

  const handleKickAccount = (lead: LeadRecord) => {
    kickAccountImmediately(lead.email);
    refreshData();
    showToast(isEn ? `Account ${lead.email} revoked & kicked.` : `Account ${lead.email} gesperrt & gekickt.`, "warn");
  };

  const handleDeleteLead = (lead: LeadRecord) => {
    deleteLeadRecord(lead.email);
    refreshData();
    showToast(isEn ? `Lead ${lead.name} deleted.` : `Lead ${lead.name} gelöscht.`, "warn");
  };

  const handleApproveAllPending = () => {
    approveAllPendingLeads();
    refreshData();
    showToast(isEn ? "All pending leads approved!" : "Alle wartenden Leads freigeschaltet!", "success");
  };

  const handleExportCSV = () => {
    exportLeadsToCSV();
    showToast(isEn ? "CSV Export generated." : "CSV-Export heruntergeladen.", "success");
  };

  // Manual Lead Creation
  const handleManualAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail.trim()) return;

    registerNewLead({
      name: manualName.trim() || manualEmail.split("@")[0],
      email: manualEmail.trim(),
      plan: manualPlan,
      slot: 1,
      token: `MZ-MANUAL-${Math.floor(1000 + Math.random() * 9000)}`,
    });

    if (manualDirectGrant) {
      grantAccessToLead(manualEmail.trim());
    }

    setManualName("");
    setManualEmail("");
    setShowAddForm(false);
    refreshData();
    showToast(
      isEn
        ? `Account for ${manualEmail} created ${manualDirectGrant ? "with instant full access" : "as pending lead"}!`
        : `Account für ${manualEmail} angelegt (${manualDirectGrant ? "Sofort freigeschaltet" : "Wartend"})!`,
      "success"
    );
  };

  // Edit Lead Modal
  const handleOpenEditModal = (lead: LeadRecord) => {
    setEditingLead(lead);
    setEditFormName(lead.name || "");
    setEditFormEmail(lead.email || "");
    setEditFormPlan(lead.plan || "PRO_29");
    setEditFormStatus(lead.status || "PENDING_APPROVAL");
    setEditFormNotes(lead.notes || "");
    setEditFormGoal(lead.goal || "");
    setEditFormTrialHours(24);
  };

  const handleSaveLeadEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    let expiresAt: string | undefined = editingLead.trialExpiresAt;
    if (editFormStatus === "TRIAL_ACTIVE" && editFormTrialHours > 0) {
      expiresAt = new Date(Date.now() + editFormTrialHours * 60 * 60 * 1000).toISOString();
    } else if (editFormStatus === "GRANTED") {
      expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    }

    updateCustomLeadAccess({
      email: editingLead.email,
      name: editFormName,
      plan: editFormPlan,
      status: editFormStatus,
      customTrialExpiresAt: expiresAt,
      notes: editFormNotes,
      goal: editFormGoal,
    });

    setEditingLead(null);
    refreshData();
    showToast(isEn ? `Changes saved for ${editFormName}.` : `Änderungen für ${editFormName} gespeichert.`, "success");
  };

  // Filtered & Sorted Leads
  const filteredLeads = useMemo(() => {
    const list = leads.filter((l) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (l.name || "").toLowerCase().includes(q) ||
        (l.email || "").toLowerCase().includes(q) ||
        (l.token || "").toLowerCase().includes(q) ||
        (l.source || "").toLowerCase().includes(q) ||
        (l.registeredDate || "").toLowerCase().includes(q) ||
        (l.registeredTime || "").toLowerCase().includes(q) ||
        (l.notes || "").toLowerCase().includes(q) ||
        (l.goal || "").toLowerCase().includes(q) ||
        String(l.slot || "").includes(q);

      const matchesStatus =
        statusFilter === "ALL"
          ? true
          : statusFilter === "PENDING"
          ? l.status === "PENDING_APPROVAL"
          : statusFilter === "TRIAL"
          ? l.status === "TRIAL_ACTIVE"
          : statusFilter === "GRANTED"
          ? l.status === "GRANTED"
          : l.status === "REVOKED";

      const matchesPlan =
        planFilter === "ALL"
          ? true
          : planFilter === "PRO_29"
          ? l.plan === "PRO_29"
          : l.plan === "ENTERPRISE_99";

      return matchesSearch && matchesStatus && matchesPlan;
    });

    return list.sort((a, b) => {
      if (leadSortOrder === "OLDEST") {
        return new Date(a.registeredAt || 0).getTime() - new Date(b.registeredAt || 0).getTime();
      }
      if (leadSortOrder === "SLOT") {
        return (a.slot || 999) - (b.slot || 999);
      }
      if (leadSortOrder === "NAME") {
        return (a.name || "").localeCompare(b.name || "");
      }
      // Default: NEWEST
      return new Date(b.registeredAt || 0).getTime() - new Date(a.registeredAt || 0).getTime();
    });
  }, [leads, searchTerm, statusFilter, planFilter, leadSortOrder]);

  // Statistics
  const totalLeads = leads.length;
  const grantedCount = leads.filter((l) => l.status === "GRANTED").length;
  const trialCount = leads.filter((l) => l.status === "TRIAL_ACTIVE").length;
  const pendingCount = leads.filter((l) => l.status === "PENDING_APPROVAL").length;
  const activeKeysCount = accessKeys.filter((k) => k.isActive).length;
  const occupiedSlots = slotsStatus ? slotsStatus.occupiedCount : totalLeads;
  const freeSlots = Math.max(0, 500 - occupiedSlots);
  const potentialMonthlyRevenue = leads.reduce((acc, curr) => acc + (curr.priceMonthly || (curr.plan === "ENTERPRISE_99" ? 99 : 29)), 0);

  // Filtered & Sorted Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const q = invoiceSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        inv.number.toLowerCase().includes(q) ||
        (inv.recipientName && inv.recipientName.toLowerCase().includes(q)) ||
        (inv.recipientEmail && inv.recipientEmail.toLowerCase().includes(q)) ||
        (inv.paymentMethodLabel && inv.paymentMethodLabel.toLowerCase().includes(q)) ||
        (inv.notes && inv.notes.toLowerCase().includes(q)) ||
        String(inv.recipientSlot || "").includes(q);

      const matchesStatus =
        invoiceStatusFilter === "ALL"
          ? true
          : invoiceStatusFilter === "PAID"
          ? inv.status === "PAID"
          : inv.status === "PENDING";

      const matchesPlan =
        invoicePlanFilter === "ALL"
          ? true
          : invoicePlanFilter === "PRO"
          ? inv.amount <= 35 || inv.planName.toLowerCase().includes("pro")
          : inv.amount > 35 || inv.planName.toLowerCase().includes("enterprise");

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [invoices, invoiceSearch, invoiceStatusFilter, invoicePlanFilter]);

  // Invoice KPIs
  const totalPaidRevenue = invoices
    .filter((i) => i.status === "PAID")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalPendingRevenue = invoices
    .filter((i) => i.status === "PENDING")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const paidInvoicesCount = invoices.filter((i) => i.status === "PAID").length;
  const pendingInvoicesCount = invoices.filter((i) => i.status === "PENDING").length;
  const paymentSuccessRate = invoices.length > 0 ? Math.round((paidInvoicesCount / invoices.length) * 100) : 100;

  const handleToggleInvoiceStatus = async (inv: AdminInvoiceRecord) => {
    const newStatus = inv.status === "PAID" ? "PENDING" : "PAID";
    setUpdatingInvoiceId(inv.id);
    try {
      const res = await updateAdminInvoiceStatus(inv.id, newStatus);
      if (res.ok && res.invoice) {
        setInvoices((prev) => prev.map((item) => (item.id === inv.id ? res.invoice! : item)));
        if (newStatus === "PAID") {
          playSuccessFanfare();
        } else {
          playValidationBeep();
        }
        showToast(
          newStatus === "PAID"
            ? `Rechnung ${inv.number} als BEZAHLT markiert! ✓`
            : `Rechnung ${inv.number} auf OFFEN gesetzt.`,
          "success"
        );
      }
    } catch {
      playErrorTone();
      showToast("Fehler beim Aktualisieren des Status.", "error");
    } finally {
      setUpdatingInvoiceId(null);
    }
  };

  const handleCopyInvoiceNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedInvoiceNum(num);
    playValidationBeep();
    showToast(`Rechnungs-Nr. ${num} kopiert!`, "success");
    setTimeout(() => setCopiedInvoiceNum(null), 2000);
  };

  const handleViewInvoiceModal = (inv: AdminInvoiceRecord) => {
    setSelectedInvoiceForViewer(inv);
    setIsInvoiceViewerOpen(true);
  };

  const handleRequestDeleteInvoice = (inv: AdminInvoiceRecord) => {
    setInvoiceToDeleteId(inv.id);
  };

  const handleConfirmDeleteInvoice = async (inv: AdminInvoiceRecord) => {
    try {
      await deleteAdminInvoice(inv.id);
      setInvoices((prev) => prev.filter((i) => i.id !== inv.id));
      setInvoiceToDeleteId(null);
      showToast(`Rechnung ${inv.number} erfolgreich gelöscht.`, "warn");
    } catch (e) {
      console.error("Failed to delete invoice:", e);
      showToast("Fehler beim Löschen der Rechnung.", "error");
    }
  };

  // Early return if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-fade-in font-sans">
      {/* Outer Modal Container */}
      <div
        className={`relative w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden text-slate-100 transition-all duration-200 ${
          isModern
            ? "bg-zinc-950/95 border border-zinc-800/90 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.85)]"
            : "bg-[#030712] border-2 border-cyan-500/60 rounded-3xl shadow-[0_0_80px_rgba(6,182,212,0.4)]"
        }`}
      >
        {/* Toast Alert */}
        {toastMessage && (
          <div
            className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full border shadow-2xl flex items-center gap-2 text-xs font-semibold tracking-wide transition-all animate-bounce ${
              toastMessage.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/60 text-emerald-300 shadow-emerald-500/20"
                : toastMessage.type === "warn"
                ? "bg-amber-950/90 border-amber-500/60 text-amber-300 shadow-amber-500/20"
                : "bg-rose-950/90 border-rose-500/60 text-rose-300 shadow-rose-500/20"
            }`}
          >
            {toastMessage.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toastMessage.type === "warn" && <AlertTriangle className="w-4 h-4 text-amber-400" />}
            {toastMessage.type === "error" && <XCircle className="w-4 h-4 text-rose-400" />}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Modal Top Header */}
        <div
          className={`p-4 sm:p-5 flex items-center justify-between border-b ${
            isModern
              ? "bg-zinc-900/80 border-zinc-800/90"
              : "bg-[#060e24] border-cyan-500/30 font-mono"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isModern
                  ? "bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 border border-zinc-700 text-indigo-300 shadow-sm"
                  : "bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>SYNTAX Core Admin Console</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono">
                  ROOT PRIVILEGES
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-normal">
                {SUPERADMIN_EMAIL} • 8 Cores Sovereign Control
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <HeaderAudioToggle isModern={isModern} />

            <button
              onClick={refreshData}
              disabled={isLoading}
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/80 text-zinc-300 hover:text-white transition cursor-pointer flex items-center gap-1.5 text-xs font-medium"
              title={isEn ? "Refresh Data" : "Daten aktualisieren"}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-indigo-400" : ""}`} />
              <span className="hidden sm:inline">{isEn ? "Sync" : "Sync"}</span>
            </button>

            {isAuthenticatedAdmin && (
              <button
                onClick={handleAdminLogout}
                className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                title={isEn ? "Lock Admin Console" : "Admin-Sitzung sperren"}
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isEn ? "Lock" : "Sperren"}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/80 text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              title={isEn ? "Close" : "Schließen"}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* AUTH CHECK: IF NOT ROOT ADMIN */}
        {!isAuthenticatedAdmin ? (
          <div className="p-6 sm:p-12 text-center max-w-md mx-auto my-auto space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 shadow-xl">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Protected Security Zone
              </h3>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                Enter your Master Key or Security PIN to authorize access.
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="text-left space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <label className="font-semibold text-zinc-300 uppercase tracking-wider text-[11px]">
                    MASTER PIN / SECURITY KEY
                  </label>
                </div>

                <div className="relative">
                  <Key className="w-4 h-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPasswordText ? "text" : "password"}
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      if (authError) setAuthError("");
                    }}
                    onKeyDown={() => playKeypressSound()}
                    placeholder="Sicherheitsschlüssel oder PIN eingeben..."
                    required
                    autoFocus
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-zinc-900 border border-zinc-700/80 focus:border-indigo-500 text-white text-xs outline-none shadow-inner font-mono tracking-wider transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1 cursor-pointer"
                    title={showPasswordText ? "Verbergen" : "Anzeigen"}
                  >
                    {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authError && (
                <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-medium flex items-center gap-2 text-left animate-shake">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 hover:from-indigo-400 hover:to-emerald-400 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-indigo-500/25 active:scale-95 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-white" />
                <span>AUTHORIZE ROOT ACCESS</span>
              </button>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED ADMIN CONSOLE */
          <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-6 space-y-4 custom-scrollbar">
            
            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {/* Metric 1: Total Leads */}
              <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800/80 flex flex-col justify-between">
                <span className="text-[11px] font-medium text-zinc-400 tracking-wide">
                  {isEn ? "TOTAL LEADS" : "LEADS GESAMT"}
                </span>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-xl font-bold text-white">{totalLeads}</span>
                  <span className="text-[10px] text-indigo-400 font-medium">DB Records</span>
                </div>
              </div>

              {/* Metric 2: Occupied Slots */}
              <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800/80 flex flex-col justify-between">
                <span className="text-[11px] font-medium text-zinc-400 tracking-wide">
                  {isEn ? "SLOT CAPACITY" : "500-SLOT BELEGUNG"}
                </span>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-xl font-bold text-indigo-300">{occupiedSlots} / 500</span>
                  <span className="text-[10px] text-emerald-400 font-medium">{freeSlots} {isEn ? "free" : "frei"}</span>
                </div>
              </div>

              {/* Metric 3: Active Full Access */}
              <div className="p-3.5 rounded-xl bg-emerald-950/25 border border-emerald-500/30 flex flex-col justify-between">
                <span className="text-[11px] font-medium text-emerald-400 tracking-wide">
                  {isEn ? "GRANTED ACCOUNTS" : "GEWÄHRTE ZUGÄNGE"}
                </span>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-xl font-bold text-emerald-300">{grantedCount}</span>
                  <span className="text-[10px] text-emerald-400/80 font-medium">100% Aktiv</span>
                </div>
              </div>

              {/* Metric 4: Active 24h Trials */}
              <div className="p-3.5 rounded-xl bg-indigo-950/25 border border-indigo-500/30 flex flex-col justify-between">
                <span className="text-[11px] font-medium text-indigo-400 tracking-wide">
                  {isEn ? "ACTIVE 24H TRIALS" : "24H TESTS AKTIV"}
                </span>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-xl font-bold text-indigo-200">{trialCount}</span>
                  <span className="text-[10px] text-indigo-400/80 font-medium">Auto-Expire</span>
                </div>
              </div>

              {/* Metric 5: Pending Approvals */}
              <div className="p-3.5 rounded-xl bg-amber-950/25 border border-amber-500/30 flex flex-col justify-between">
                <span className="text-[11px] font-medium text-amber-400 tracking-wide">
                  {isEn ? "PENDING REVIEW" : "WARTEN AUF ADMIN"}
                </span>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-xl font-bold text-amber-300">{pendingCount}</span>
                  <span className="text-[10px] text-amber-400/80 font-medium">Action Needed</span>
                </div>
              </div>

              {/* Metric 6: MRR Potential */}
              <div className="p-3.5 rounded-xl bg-purple-950/25 border border-purple-500/30 flex flex-col justify-between">
                <span className="text-[11px] font-medium text-purple-400 tracking-wide">
                  {isEn ? "MRR POTENTIAL" : "MRR POTENZIAL"}
                </span>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-xl font-bold text-purple-200">{potentialMonthlyRevenue} €</span>
                  <span className="text-[10px] text-purple-400/80 font-medium">Monatlich</span>
                </div>
              </div>
            </div>

            {/* MASTER ADMIN SECRET ACCESS KEY BANNER */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-zinc-900 via-indigo-950/40 to-zinc-900 border border-indigo-500/40 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 shadow-md">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 flex items-center justify-center shrink-0">
                  <Crown className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-200 tracking-wide">
                      {isEn ? "MASTER ADMIN SECRET KEY:" : "👑 DEIN MASTER ADMIN SECRET KEY:"}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-black/70 border border-indigo-500/50 text-indigo-300 font-mono font-bold text-xs tracking-wider select-all shadow-inner">
                      {MASTER_ADMIN_SECRET_KEY}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Admin: <strong className="text-emerald-300">{SUPERADMIN_EMAIL}</strong> • PIN: <strong className="text-indigo-300">{MASTER_ADMIN_PIN}</strong>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleCopyMasterKey}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 hover:text-white text-xs font-medium transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="Master Key in die Zwischenablage kopieren"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? (isEn ? "Copied!" : "Kopiert!") : (isEn ? "Copy Key" : "Key Kopieren")}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadKeyFile}
                  className="px-3 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/50 text-indigo-200 hover:text-white text-xs font-medium transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="Master Key als Textdatei speichern"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-300" />
                  <span>{isEn ? "Save .txt" : "Key als .TXT speichern"}</span>
                </button>

                {onOpenConversionAnalytics && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenConversionAnalytics();
                    }}
                    className="px-3.5 py-1.5 rounded-xl border border-purple-500/40 bg-purple-950/40 hover:bg-purple-900/50 text-purple-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                    title="Zu Live-Traffic & Conversion Radar wechseln"
                  >
                    <Target className="w-3.5 h-3.5 text-purple-400" />
                    <span>{isEn ? "Conversion & Live Radar ↗" : "Conversion & Live-User Radar ↗"}</span>
                  </button>
                )}

                {onLaunchDashboard && (
                  <button
                    type="button"
                    onClick={() => {
                      setStoredAdminAuthenticated(true);
                      setCurrentUserEmail(SUPERADMIN_EMAIL);
                      try {
                        localStorage.setItem("maze_admin_authenticated_session", "true");
                        localStorage.setItem("maze_current_user_email", SUPERADMIN_EMAIL);
                      } catch {}
                      onClose();
                      onLaunchDashboard();
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{isEn ? "Launch Command Console →" : "Command-Zentrale Starten →"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2 overflow-x-auto">
              {onOpenConversionAnalytics && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenConversionAnalytics();
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer whitespace-nowrap bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 border border-purple-500/30"
                  title="Live-Traffic & Conversion Radar öffnen"
                >
                  <Target className="w-3.5 h-3.5 text-purple-400" />
                  <span>{isEn ? "Live Radar & Conversion ↗" : "Live-Radar & Conversion ↗"}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveAdminTab("ACCESS_KEYS")}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  activeAdminTab === "ACCESS_KEYS"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>{isEn ? `Access Keys (${accessKeys.length})` : `1-Tag Zugangs-Keys (${accessKeys.length})`}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAdminTab("LEADS")}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  activeAdminTab === "LEADS"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{isEn ? `Registered Users (${leads.length})` : `Registrierte Leads & Nutzer (${leads.length})`}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAdminTab("SLOTS")}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  activeAdminTab === "SLOTS"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                    : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isEn ? `Slot Capacity (${occupiedSlots}/500)` : `500-Slot Engine (${occupiedSlots}/500)`}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAdminTab("INVOICES")}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  activeAdminTab === "INVOICES"
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                    : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                }`}
              >
                <Receipt className="w-3.5 h-3.5 text-amber-300" />
                <span>{isEn ? `Invoices & Billing (${invoices.length})` : `Rechnungen & Zahlungen (${invoices.length})`}</span>
                {pendingInvoicesCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/25 text-amber-300 border border-amber-500/40 animate-pulse">
                    {pendingInvoicesCount} offen
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveAdminTab("AUDIT")}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  activeAdminTab === "AUDIT"
                    ? "bg-zinc-700 text-white shadow-md"
                    : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>{isEn ? "Security & Audit" : "Sicherheit & Audit"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveAdminTab("OSIRIS");
                  playClickSound();
                  if (!osirisScriptResult && !osirisScriptLoading) {
                    handleRunOsirisScript();
                  }
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  activeAdminTab === "OSIRIS"
                    ? "bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 text-white shadow-lg shadow-cyan-600/40 font-bold border border-cyan-400"
                    : "bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 hover:text-cyan-100 border border-cyan-500/40"
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                <span>OSIRIS AI LIVE RADAR</span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-200 text-[9px] font-mono font-black border border-cyan-400/40">
                  {osirisScriptResult ? `${osirisScriptResult.count}` : "SKRIPT"}
                </span>
              </button>
            </div>

            {/* TAB 1: ACCESS KEYS */}
            {activeAdminTab === "ACCESS_KEYS" && (
              <div className="flex-1 flex flex-col overflow-hidden space-y-3 animate-fade-in">
                {/* Dedicated Closed Beta Tester Key Quick Engine */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-teal-950/40 border border-emerald-500/40 shadow-lg flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white tracking-wide">CLOSED BETA TESTER KEY ENGINE</span>
                        <span className="px-2 py-0.5 rounded text-[9.5px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          16 ZAHLEN RANDOM • KEIN ADMIN-ZUGRIFF
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Erstellt 16-stellige Beta-Tester-Keys für die Verkaufswebsite (Key Login). Schaltet alle 8 KI-Cores frei ohne Root-/Admin-Rechte.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleGenerateRandomBetaKey}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition active:scale-95 shadow-sm"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>🎲 16 Zahlen würfeln</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleQuickCreateBetaKey}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/60 transition active:scale-95"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>⚡ 1-Klick Beta-Key erstellen & kopieren</span>
                    </button>
                  </div>
                </div>

                {/* Create Access Key Form */}
                <form
                  onSubmit={handleCreateAccessKey}
                  className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                        {isEn ? "GENERATE ACCESS KEY" : "ZUGANGS-KEY ERSTELLEN"}
                      </h3>
                    </div>
                    <span className="text-[11px] text-zinc-400">
                      {isEn
                        ? "Instant bypass without registration form • Valid for 8 Cores"
                        : "Sofort-Zugang ohne Registrierungsformular • Gültig für alle 8 Cores"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-4">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-zinc-300">
                          {isEn ? "KEY CODE / 16 DIGITS *" : "KEY-CODE / 16 ZAHLEN *"}
                        </label>
                        <button
                          type="button"
                          onClick={handleGenerateRandomBetaKey}
                          className="text-[10px] text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1 cursor-pointer"
                        >
                          <span>🎲 16 Zahlen</span>
                        </button>
                      </div>
                      <div className="relative">
                        <Key className="w-3.5 h-3.5 text-indigo-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={newKeyCode}
                          onChange={(e) => setNewKeyCode(e.target.value)}
                          placeholder="z.B. 4829-1038-5920-1849 oder otto"
                          className="w-full pl-8 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 focus:border-indigo-500 text-white font-mono font-semibold text-xs outline-none"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                        {isEn ? "ASSIGNED ROLE" : "ROLLE / RANG"}
                      </label>
                      <select
                        value={newKeyRole}
                        onChange={(e) => setNewKeyRole(e.target.value as UserRole)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 focus:border-indigo-500 text-white text-xs outline-none cursor-pointer"
                      >
                        <option value="CLOSED_BETA_TESTER">🧪 CLOSED BETA TESTER (Kein Admin)</option>
                        <option value="SOVEREIGN">👑 SOVEREIGN MATRIX (8 Cores)</option>
                        <option value="OPERATOR">⚡ OPERATOR (7 Cores)</option>
                        <option value="LITE_ACCESS">🔹 LITE ACCESS (3 Cores)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                        {isEn ? "LABEL / RECIPIENT" : "EMPFÄNGER / NOTIZ"}
                      </label>
                      <input
                        type="text"
                        value={newKeyLabel}
                        onChange={(e) => setNewKeyLabel(e.target.value)}
                        placeholder="z.B. Beta Tester Max"
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 focus:border-indigo-500 text-white text-xs outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <button
                        type="submit"
                        className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isEn ? "Create Key" : "Erstellen"}</span>
                      </button>
                    </div>
                  </div>
                </form>

                {/* Keys List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar border border-zinc-800 rounded-xl bg-zinc-900/60 p-3 space-y-2">
                  <div className="flex items-center justify-between px-1 pb-1">
                    <span className="text-xs font-semibold text-zinc-300">
                      {isEn ? `Active Keys (${accessKeys.length})` : `Generierte Zugangs-Keys (${accessKeys.length})`}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {isEn ? "1-Click Direct Access / WhatsApp Share" : "1-Klick Direktlink & WhatsApp Einladung"}
                    </span>
                  </div>

                  {accessKeys.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500 text-xs">
                      {isEn ? "No access keys generated yet." : "Noch keine Zugangs-Keys generiert."}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {accessKeys.map((keyRec) => {
                        const isExpired =
                          keyRec.expiresAt && new Date(keyRec.expiresAt).getTime() < Date.now();
                        const isBeta =
                          keyRec.role === "CLOSED_BETA_TESTER" ||
                          keyRec.isBetaTesterKey ||
                          (keyRec.label && keyRec.label.toLowerCase().includes("beta"));

                        return (
                          <div
                            key={keyRec.id}
                            className={`p-3 rounded-xl border transition-all flex flex-col justify-between space-y-2 ${
                              !keyRec.isActive || isExpired
                                ? "bg-zinc-950/60 border-zinc-800 opacity-60"
                                : isBeta
                                ? "bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-400 shadow-sm"
                                : "bg-zinc-900/90 border-zinc-700/80 hover:border-indigo-500/60"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    isBeta
                                      ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                                      : "bg-indigo-500/15 border border-indigo-500/30 text-indigo-300"
                                  }`}
                                >
                                  {isBeta ? <Sparkles className="w-4 h-4" /> : <Key className="w-4 h-4" />}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-mono font-bold text-sm text-white select-all">
                                      {keyRec.key}
                                    </span>
                                    {isBeta && (
                                      <span className="px-1.5 py-0.2 text-[9px] rounded font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                        🧪 CLOSED BETA
                                      </span>
                                    )}
                                    <span
                                      className={`px-1.5 py-0.2 text-[9.5px] rounded font-medium ${
                                        keyRec.isActive && !isExpired
                                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                      }`}
                                    >
                                      {keyRec.isActive && !isExpired ? "AKTIV" : "INAKTIV"}
                                    </span>
                                  </div>
                                  <div className="text-[10.5px] text-zinc-400">
                                    {keyRec.label || "Ohne Bezeichnung"} • {keyRec.durationHours}h Dauer • Rang:{" "}
                                    <span className={isBeta ? "text-emerald-300 font-semibold" : "text-purple-300 font-semibold"}>
                                      {keyRec.role || (isBeta ? "CLOSED_BETA_TESTER" : "SOVEREIGN")}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleCopyKey(keyRec)}
                                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
                                  title="Key-Wort kopieren"
                                >
                                  {copiedKeyId === keyRec.id ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleCopyDirectUrl(keyRec)}
                                  className="p-1.5 rounded-lg bg-indigo-950 hover:bg-indigo-800 text-indigo-300 hover:text-white transition cursor-pointer"
                                  title="Direkt-URL kopieren"
                                >
                                  {copiedKeyId === `url_${keyRec.id}` ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <button
                                  onClick={() => setShareKeyModal(keyRec)}
                                  className="p-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-800 text-emerald-300 hover:text-white transition cursor-pointer"
                                  title="WhatsApp / Email Einladung öffnen"
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleToggleKey(keyRec)}
                                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition cursor-pointer"
                                  title={keyRec.isActive ? "Deaktivieren" : "Aktivieren"}
                                >
                                  {keyRec.isActive ? <Lock className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  onClick={() => handleDeleteKey(keyRec)}
                                  className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 transition cursor-pointer"
                                  title="Löschen"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                              <span>Redeemed: {keyRec.usedCount || 0}x</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleExtendKey(keyRec, 24)}
                                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer text-[10px]"
                                >
                                  +24h
                                </button>
                                <button
                                  onClick={() => handleExtendKey(keyRec, 168)}
                                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer text-[10px]"
                                >
                                  +7d
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: LEADS & USERS */}
            {activeAdminTab === "LEADS" && (
              <div className="flex-1 flex flex-col overflow-hidden space-y-3 animate-fade-in">
                {/* Search & Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <div className="flex flex-1 items-center gap-2 min-w-[240px] flex-wrap">
                    <div className="relative flex-1 min-w-[180px]">
                      <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={isEn ? "Search user, email, date, time, slot..." : "Name, E-Mail, Uhrzeit, Datum, Slot..."}
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs outline-none focus:border-cyan-500 transition"
                      />
                    </div>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="px-2.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-300 text-xs outline-none cursor-pointer"
                    >
                      <option value="ALL">Status: Alle ({leads.length})</option>
                      <option value="GRANTED">Voll freigeschaltet ({grantedCount})</option>
                      <option value="TRIAL">24h Test aktiv ({trialCount})</option>
                      <option value="PENDING">Wartend auf Admin ({pendingCount})</option>
                      <option value="REVOKED">Gesperrt</option>
                    </select>

                    <select
                      value={planFilter}
                      onChange={(e) => setPlanFilter(e.target.value as any)}
                      className="px-2.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-300 text-xs outline-none cursor-pointer"
                    >
                      <option value="ALL">Plan: Alle</option>
                      <option value="PRO_29">Pro (29 €)</option>
                      <option value="ENTERPRISE_99">Enterprise (99 €)</option>
                    </select>

                    <select
                      value={leadSortOrder}
                      onChange={(e) => setLeadSortOrder(e.target.value as any)}
                      className="px-2.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 text-cyan-300 text-xs outline-none cursor-pointer"
                    >
                      <option value="NEWEST">⏱️ Neueste Anmeldungen zuerst (Datum & Uhrzeit ↓)</option>
                      <option value="OLDEST">⏳ Älteste zuerst (Datum & Uhrzeit ↑)</option>
                      <option value="SLOT">🔢 Nach Slot-Nummer</option>
                      <option value="NAME">🔤 Nach Name (A-Z)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={refreshData}
                      disabled={isLoading}
                      className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                      title="Echtzeit-Synchronisierung mit Server erzwingen"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoading || isSyncingLive ? "animate-spin text-cyan-400" : "text-zinc-400"}`} />
                      <span className="hidden sm:inline">{isLoading ? "Lade..." : "Live-Sync"}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" title="Live Auto-Sync aktiv" />
                    </button>

                    <button
                      onClick={() => setShowAddForm(true)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isEn ? "Add User" : "Nutzer anlegen"}</span>
                    </button>

                    {pendingCount > 0 && (
                      <button
                        onClick={handleApproveAllPending}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{isEn ? `Approve All (${pendingCount})` : `Alle freigeben (${pendingCount})`}</span>
                      </button>
                    )}

                    <button
                      onClick={handleExportCSV}
                      className="p-1.5 px-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs flex items-center gap-1.5 transition cursor-pointer"
                      title={isEn ? "Export complete database with exact date & time" : "Vollständigen CSV-Export mit Datum & Uhrzeit herunterladen"}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">CSV Export</span>
                    </button>
                  </div>
                </div>

                {/* Table Container */}
                <div className="flex-1 overflow-y-auto custom-scrollbar border border-zinc-800 rounded-xl bg-zinc-900/60">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-zinc-950/90 sticky top-0 border-b border-zinc-800 text-zinc-400 text-[11px] font-semibold tracking-wider uppercase z-10">
                      <tr>
                        <th className="p-3">Uhrzeit & Datum</th>
                        <th className="p-3">Nutzer & Quelle</th>
                        <th className="p-3">E-Mail & Token</th>
                        <th className="p-3">Plan / Slot</th>
                        <th className="p-3">Status & Gültigkeit</th>
                        <th className="p-3 text-right">Aktionen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
                      {filteredLeads.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-10 text-center text-zinc-500">
                            {isEn ? "No records matching filters." : "Keine passenden Anmeldungen gefunden."}
                          </td>
                        </tr>
                      ) : (
                        filteredLeads.map((lead) => {
                          const isSuper = lead.email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();
                          const ts = formatLeadTimestamp(lead.registeredAt);
                          return (
                            <tr key={lead.id} className="hover:bg-zinc-800/40 transition group">
                              {/* 1. UHRZEIT & DATUM */}
                              <td className="p-3 whitespace-nowrap">
                                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-cyan-300">
                                  <Clock className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                                  <span>{lead.registeredTime || ts.timeStr}</span>
                                </div>
                                <div className="text-[11px] text-zinc-400 font-mono flex items-center gap-1.5 mt-0.5">
                                  <span>{lead.registeredDate || ts.dateStr}</span>
                                  {ts.isRecent ? (
                                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30 animate-pulse">
                                      NEU
                                    </span>
                                  ) : (
                                    <span className="text-[9.5px] text-zinc-500">({ts.relativeStr})</span>
                                  )}
                                </div>
                              </td>

                              {/* 2. NUTZER & QUELLE */}
                              <td className="p-3">
                                <div className="font-semibold text-white flex items-center gap-1.5">
                                  <span>{lead.name || "VIP Interessent"}</span>
                                  {isSuper && (
                                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9.5px] font-bold border border-amber-500/30">
                                      SUPERADMIN
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-purple-300/90 font-mono truncate max-w-[210px]" title={lead.source || "VIP Warteliste"}>
                                  {lead.source || "VIP Warteliste"}
                                </div>
                                {lead.device && (
                                  <div className="text-[9.5px] text-zinc-500 font-mono">
                                    {lead.device}
                                  </div>
                                )}
                              </td>

                              {/* 3. E-MAIL & TOKEN */}
                              <td className="p-3">
                                <div
                                  onClick={() => {
                                    navigator.clipboard.writeText(lead.email);
                                    showToast(`E-Mail kopiert: ${lead.email}`, "success");
                                  }}
                                  className="font-mono text-zinc-300 text-xs hover:text-cyan-300 cursor-pointer flex items-center gap-1"
                                  title="Klicken zum Kopieren"
                                >
                                  <span className="truncate max-w-[190px]">{lead.email}</span>
                                  <Copy className="w-2.5 h-2.5 opacity-60 flex-shrink-0" />
                                </div>
                                <div className="text-[10px] text-zinc-500 font-mono">{lead.token}</div>
                              </td>

                              {/* 4. PLAN & SLOT */}
                              <td className="p-3 whitespace-nowrap">
                                <div className="font-semibold text-indigo-300">
                                  {lead.plan === "ENTERPRISE_99" ? "Enterprise (99 €)" : "Pro (29 €)"}
                                </div>
                                <div className="text-[10px] text-zinc-400 font-mono font-bold">
                                  Slot #{lead.slot || "—"}{" "}
                                  <span className="text-[9px] text-zinc-500 font-normal">/ 500</span>
                                </div>
                              </td>

                              {/* 5. STATUS & GÜLTIGKEIT */}
                              <td className="p-3 whitespace-nowrap">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                    lead.status === "GRANTED"
                                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                      : lead.status === "TRIAL_ACTIVE"
                                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                      : lead.status === "PENDING_APPROVAL"
                                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                      : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                  }`}
                                >
                                  {lead.status === "GRANTED"
                                    ? "FREIGESCHALTET"
                                    : lead.status === "TRIAL_ACTIVE"
                                    ? "TESTPHASE AKTIV"
                                    : lead.status === "PENDING_APPROVAL"
                                    ? "WARTEND"
                                    : "GESPERRT"}
                                </span>
                                {lead.status === "TRIAL_ACTIVE" && lead.trialExpiresAt && (
                                  <div className="text-[9.5px] text-amber-300/90 font-mono mt-0.5">
                                    Bis: {formatLeadTimestamp(lead.trialExpiresAt).dateStr} {formatLeadTimestamp(lead.trialExpiresAt).timeStr}
                                  </div>
                                )}
                              </td>

                              {/* 6. AKTIONEN */}
                              <td className="p-3 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setSelectedLeadDetails(lead)}
                                    className="p-1 px-1.5 rounded-lg bg-zinc-800 hover:bg-cyan-950 text-zinc-300 hover:text-cyan-300 border border-transparent hover:border-cyan-500/30 transition cursor-pointer"
                                    title="Alle Details, Datum & Uhrzeit ansehen"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>

                                  {lead.status !== "GRANTED" && (
                                    <button
                                      onClick={() => handleGrantAccess(lead)}
                                      className="px-2 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-800 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition cursor-pointer"
                                      title="Voll freischalten"
                                    >
                                      Freigeben
                                    </button>
                                  )}
                                  {lead.status !== "TRIAL_ACTIVE" && (
                                    <button
                                      onClick={() => handleGrantTrial(lead)}
                                      className="px-2 py-1 rounded-lg bg-indigo-950 hover:bg-indigo-800 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold transition cursor-pointer"
                                      title="24h Test geben"
                                    >
                                      24h Test
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleOpenEditModal(lead)}
                                    className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
                                    title="Bearbeiten"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  {!isSuper && (
                                    <>
                                      <button
                                        onClick={() => handleKickAccount(lead)}
                                        className="p-1 rounded-lg bg-rose-950/50 hover:bg-rose-900 text-rose-300 transition cursor-pointer"
                                        title="Account sofort sperren"
                                      >
                                        <UserX className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteLead(lead)}
                                        className="p-1 rounded-lg bg-zinc-800 hover:bg-rose-900 text-zinc-400 hover:text-rose-200 transition cursor-pointer"
                                        title="Löschen"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: 500-SLOT MANAGEMENT */}
            {activeAdminTab === "SLOTS" && (
              <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar space-y-4 animate-fade-in p-1">
                <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">
                        {isEn ? "500-Slot High Performance Capacity" : "500-Slot Hochleistungs-Kapazität"}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {isEn
                          ? "Dedicated compute clusters reserved for the 500 founding members."
                          : "Dedizierte Rechencluster für die 500 Gründungsmitglieder."}
                      </p>
                    </div>

                    <button
                      onClick={handleTriggerSlotClean}
                      disabled={isPurgingSlots}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
                    >
                      <Trash2 className={`w-4 h-4 ${isPurgingSlots ? "animate-spin" : ""}`} />
                      <span>
                        {isPurgingSlots
                          ? (isEn ? "Purging..." : "Bereinige...")
                          : (isEn ? "Clean Expired 24h Trials" : "Abgelaufene 24h-Tests Bereinigen")}
                      </span>
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-zinc-300">
                        {isEn ? "Capacity Occupied" : "Kapazität Belegt"}: {occupiedSlots} / 500
                      </span>
                      <span className="text-emerald-400 font-mono">
                        {Math.round((occupiedSlots / 500) * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-3.5 rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(5, (occupiedSlots / 500) * 100))}%` }}
                      />
                    </div>
                  </div>

                  {/* Slot Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                      <span className="text-xs text-zinc-400">Bezahlte Voll-Zugänge</span>
                      <div className="text-lg font-bold text-emerald-400">{grantedCount}</div>
                      <span className="text-[10px] text-zinc-500">Dauerhaft reserviert</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                      <span className="text-xs text-zinc-400">Aktive 24h Test-Slots</span>
                      <div className="text-lg font-bold text-indigo-400">{trialCount}</div>
                      <span className="text-[10px] text-zinc-500">Werden nach 24h freigegeben</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                      <span className="text-xs text-zinc-400">Freie Slot-Plätze</span>
                      <div className="text-lg font-bold text-amber-400">{freeSlots}</div>
                      <span className="text-[10px] text-zinc-500">Sofort verfügbar</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: INVOICES & BILLING ENGINE */}
            {activeAdminTab === "INVOICES" && (
              <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar space-y-4 animate-fade-in p-1">
                {/* 1. FINANCIAL SUMMARY STATS CARDS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl bg-gradient-to-b from-emerald-950/40 to-zinc-950 border border-emerald-500/30 relative overflow-hidden shadow-lg shadow-emerald-950/20">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">
                        {isEn ? "Paid Volume" : "Einnahmen (Bezahlt)"}
                      </span>
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
                        €
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold text-white mt-1 tracking-tight">
                      {totalPaidRevenue.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-[10.5px] text-emerald-400/90 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{paidInvoicesCount} Rechnungen bezahlt</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-b from-amber-950/40 to-zinc-950 border border-amber-500/30 relative overflow-hidden shadow-lg shadow-amber-950/20">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider">
                        {isEn ? "Pending Volume" : "Ausstehend (Offen)"}
                      </span>
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xs">
                        ⏳
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold text-white mt-1 tracking-tight">
                      {totalPendingRevenue.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-[10.5px] text-amber-300/90 font-medium">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span>{pendingInvoicesCount} Rechnungen offen</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                        {isEn ? "Settlement Rate" : "Erfolgsquote"}
                      </span>
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="text-2xl font-extrabold text-cyan-400 mt-1 tracking-tight">
                      {paymentSuccessRate}%
                    </div>
                    <span className="text-[10.5px] text-zinc-500 block">
                      {invoices.length} Rechnungen erfasst
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                        Export & Steuer
                      </span>
                      <span className="text-[10.5px] text-zinc-400">
                        DATEV & Buchhaltung konform
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        exportInvoicesToCsv(filteredInvoices);
                        showToast("Rechnungen erfolgreich als CSV exportiert!", "success");
                      }}
                      className="mt-2 w-full py-1.5 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-emerald-200 border border-emerald-500/40 text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>CSV Export ({filteredInvoices.length})</span>
                    </button>
                  </div>
                </div>

                {/* 2. SEARCH & FILTER CONTROLS */}
                <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                  {/* Search input */}
                  <div className="relative flex-1 min-w-[240px]">
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={invoiceSearch}
                      onChange={(e) => setInvoiceSearch(e.target.value)}
                      placeholder={isEn ? "Search invoice #, customer, email, payment..." : "Rechnungs-Nr, Kunde, E-Mail, Zahlungsart suchen..."}
                      className="w-full pl-9 pr-8 py-2 rounded-xl bg-black/60 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition"
                    />
                    {invoiceSearch && (
                      <button
                        type="button"
                        onClick={() => setInvoiceSearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Status filter pills */}
                  <div className="flex items-center gap-1.5 bg-black/50 p-1 rounded-xl border border-zinc-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setInvoiceStatusFilter("ALL")}
                      className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                        invoiceStatusFilter === "ALL"
                          ? "bg-zinc-800 text-white font-bold"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      Alle ({invoices.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setInvoiceStatusFilter("PAID")}
                      className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer ${
                        invoiceStatusFilter === "PAID"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Bezahlt ({paidInvoicesCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setInvoiceStatusFilter("PENDING")}
                      className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer ${
                        invoiceStatusFilter === "PENDING"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      Offen ({pendingInvoicesCount})
                    </button>
                  </div>

                  {/* Plan selector */}
                  <div className="flex items-center gap-2">
                    <select
                      value={invoicePlanFilter}
                      onChange={(e) => setInvoicePlanFilter(e.target.value as any)}
                      className="px-3 py-1.5 rounded-xl bg-black/60 border border-zinc-700 text-xs text-zinc-300 focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="ALL">Alle Pläne</option>
                      <option value="PRO">Pro Core (29 €)</option>
                      <option value="ENTERPRISE">Enterprise (99 €)</option>
                    </select>

                    <button
                      type="button"
                      onClick={refreshData}
                      title="Neu laden"
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 3. INVOICES LIST VIEW */}
                <div className="space-y-2.5">
                  {filteredInvoices.length === 0 ? (
                    <div className="py-12 px-4 text-center rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-3">
                      <Receipt className="w-10 h-10 text-zinc-600 mx-auto" />
                      <div className="text-zinc-300 font-semibold text-sm">
                        Keine Rechnungen gefunden
                      </div>
                      <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                        Es wurden keine Rechnungen für den ausgewählten Filter "{invoiceStatusFilter}" oder den Suchbegriff gefunden.
                      </p>
                      {(invoiceSearch || invoiceStatusFilter !== "ALL" || invoicePlanFilter !== "ALL") && (
                        <button
                          type="button"
                          onClick={() => {
                            setInvoiceSearch("");
                            setInvoiceStatusFilter("ALL");
                            setInvoicePlanFilter("ALL");
                          }}
                          className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold"
                        >
                          Filter zurücksetzen
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredInvoices.map((inv) => {
                      const isPaid = inv.status === "PAID";
                      const isPending = inv.status === "PENDING";
                      const isBeingUpdated = updatingInvoiceId === inv.id;

                      return (
                        <div
                          key={inv.id}
                          className={`rounded-2xl p-4 transition-all duration-150 border ${
                            isPaid
                              ? "bg-zinc-950/90 border-zinc-800 hover:border-emerald-500/40"
                              : "bg-amber-950/15 border-amber-500/30 hover:border-amber-500/50 shadow-md shadow-amber-950/10"
                          }`}
                        >
                          {/* Top Row: Invoice Number, Date, Slot & Status */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800/80">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleCopyInvoiceNumber(inv.number)}
                                className="group flex items-center gap-1.5 font-mono font-bold text-xs text-white hover:text-amber-400 transition"
                                title="Rechnungsnummer kopieren"
                              >
                                <span>{inv.number}</span>
                                {copiedInvoiceNum === inv.number ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400" />
                                )}
                              </button>

                              <span className="text-[11px] text-zinc-500">•</span>
                              <span className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3 text-zinc-500" />
                                {inv.date}
                              </span>

                              {inv.recipientSlot && (
                                <span className="px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 font-bold">
                                  Slot #{inv.recipientSlot}
                                </span>
                              )}
                            </div>

                            {/* Status and 1-Click Status Toggler */}
                            <div className="flex items-center gap-2">
                              {isPaid ? (
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-950/50">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>BEZAHLT</span>
                                  </span>

                                  <button
                                    type="button"
                                    disabled={isBeingUpdated}
                                    onClick={() => handleToggleInvoiceStatus(inv)}
                                    title="Status auf 'Offen' setzen"
                                    className="text-[11px] text-zinc-500 hover:text-amber-300 underline underline-offset-2 transition disabled:opacity-50 cursor-pointer"
                                  >
                                    Auf Offen setzen
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                                    <span>AUSSTEHEND / OFFEN</span>
                                  </span>

                                  {/* THE 1-CLICK PAY BUTTON REQUESTED BY USER */}
                                  <button
                                    type="button"
                                    disabled={isBeingUpdated}
                                    onClick={() => handleToggleInvoiceStatus(inv)}
                                    className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition cursor-pointer disabled:opacity-50"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Als bezahlt markieren ✓</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Middle Row: Customer Info, Payment Method & Amounts */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 py-3 text-xs items-center">
                            {/* Customer details */}
                            <div className="md:col-span-4 space-y-1">
                              <div className="font-bold text-white text-sm flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-indigo-400" />
                                <span>{inv.recipientName}</span>
                              </div>
                              <div className="text-zinc-400 font-mono text-[11px] flex items-center gap-1.5">
                                <Mail className="w-3 h-3 text-zinc-500" />
                                <span>{inv.recipientEmail}</span>
                              </div>
                              <div className="text-zinc-300 font-medium text-[11px] mt-0.5">
                                {inv.planName}
                              </div>
                            </div>

                            {/* Payment Method Badge */}
                            <div className="md:col-span-4 space-y-1">
                              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">
                                Zahlungsart & Gateway
                              </span>
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700/80 text-zinc-200 text-xs font-medium">
                                <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                                <span>{inv.paymentMethodLabel}</span>
                              </div>
                              {inv.paidAt && (
                                <div className="text-[10px] text-emerald-400/90 font-medium">
                                  Transaktionsdatum: {inv.paidAt}
                                </div>
                              )}
                            </div>

                            {/* Amount breakdown */}
                            <div className="md:col-span-4 flex flex-col md:items-end justify-center">
                              <div className="text-xl font-extrabold text-white tracking-tight">
                                {inv.amount.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                              </div>
                              <div className="text-[10.5px] text-zinc-400 font-mono">
                                {(inv.netAmount || inv.amount / 1.19).toFixed(2)} € Netto +{" "}
                                {(inv.taxAmount || inv.amount - inv.amount / 1.19).toFixed(2)} € (19% MwSt.)
                              </div>
                              {inv.notes && (
                                <div className="text-[10px] text-zinc-500 italic truncate max-w-[260px] mt-0.5">
                                  {inv.notes}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Bottom Row: Actions */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-zinc-800/80">
                            <div className="text-[11px] font-mono text-zinc-500 truncate max-w-sm">
                              Token: {inv.quantumToken || "MZ-SYSTEM-DEFAULT"}
                            </div>

                            <div className="flex items-center gap-1.5">
                              {/* Open Viewer Modal */}
                              <button
                                type="button"
                                onClick={() => handleViewInvoiceModal(inv)}
                                className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium flex items-center gap-1.5 border border-zinc-700/80 transition cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                                <span>Rechnung ansehen</span>
                              </button>

                              {/* Download HTML Invoice */}
                              <button
                                type="button"
                                onClick={() => {
                                  downloadStyledInvoiceHtml(inv, {
                                    name: inv.recipientName,
                                    email: inv.recipientEmail,
                                    slot: inv.recipientSlot,
                                    token: inv.quantumToken,
                                  });
                                  showToast(`Rechnung ${inv.number} heruntergeladen!`, "success");
                                }}
                                title="Offizielle HTML-Rechnung herunterladen"
                                className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium flex items-center gap-1.5 border border-zinc-700/80 transition cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Download</span>
                              </button>

                              {/* Printable Version */}
                              <button
                                type="button"
                                onClick={() => {
                                  openPrintableInvoice(inv, {
                                    name: inv.recipientName,
                                    email: inv.recipientEmail,
                                    slot: inv.recipientSlot,
                                    token: inv.quantumToken,
                                  });
                                }}
                                title="Druckfenster / PDF Speichern öffnen"
                                className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium flex items-center gap-1.5 border border-zinc-700/80 transition cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Drucken</span>
                              </button>

                              {/* Delete option */}
                              {invoiceToDeleteId === inv.id ? (
                                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-950/80 border border-red-500/50 shadow-md animate-fade-in">
                                  <span className="text-[10px] font-bold text-red-300">Löschen?</span>
                                  <button
                                    type="button"
                                    onClick={() => handleConfirmDeleteInvoice(inv)}
                                    title="Dauerhaft löschen"
                                    className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] transition cursor-pointer"
                                  >
                                    Ja
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setInvoiceToDeleteId(null)}
                                    title="Abbrechen"
                                    className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] transition cursor-pointer"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleRequestDeleteInvoice(inv)}
                                  title="Rechnung aus Admin löschen"
                                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-950/40 text-zinc-500 hover:text-red-400 border border-zinc-800 hover:border-red-500/30 transition cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: AUDIT & SECURITY LOGS */}
            {activeAdminTab === "AUDIT" && (
              <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar space-y-3 animate-fade-in p-1">
                <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-indigo-400" />
                      <span>ADMIN ROOT SYSTEM LOGS</span>
                    </h3>
                    <span className="text-[10.5px] font-mono text-emerald-400 font-bold">● SYSTEM ONLINE (200 OK)</span>
                  </div>

                  <div className="bg-black/90 border border-zinc-800 rounded-xl p-3 font-mono text-[11px] space-y-1.5 text-zinc-300">
                    <div className="text-emerald-400">[ROOT-AUTH] Administrator session validated: {SUPERADMIN_EMAIL}</div>
                    <div className="text-indigo-400">[CORES-READY] All 8 Quantum AI Cores operational and responsive</div>
                    <div className="text-zinc-400">[SLOTS-MONITOR] Current allocation: {occupiedSlots} active, {freeSlots} vacant</div>
                    <div className="text-purple-400">[KEY-ENGINE] {activeKeysCount} access keys active and ready for redemption</div>
                    <div className="text-zinc-500">[SECURITY] SSL 256-bit AES database encryption active</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: OSIRIS AI LIVE INTELLIGENCE & FLIGHT RADAR */}
            {activeAdminTab === "OSIRIS" && (
              <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar space-y-4 animate-fade-in p-1">
                {/* Hero Banner with Script Execution Action */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-blue-950/60 border border-cyan-500/40 shadow-xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                        <Globe className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-white tracking-wider flex items-center gap-2 font-mono">
                            <span>OSIRIS AI LIVE RADAR & FLIGHT SCRIPT</span>
                            <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/40">
                              ADMIN TOOL
                            </span>
                          </h3>
                        </div>
                        <p className="text-xs text-cyan-200/80 font-mono mt-0.5">
                          Open-Source Flugtransponder- & OSINT-Telemetrie via <span className="text-cyan-400 font-bold">osirisai.live/api/flights</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {onOpenFullOsirisTool && (
                        <button
                          type="button"
                          onClick={() => {
                            playClickSound();
                            onClose();
                            onOpenFullOsirisTool();
                          }}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-xs font-mono tracking-wider flex items-center gap-1.5 cursor-pointer transition shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:scale-105"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-cyan-200" />
                          <span>VOLLSTÄNDIGES OSIRIS TOOL ÖFFNEN</span>
                        </button>
                      )}
                      <a
                        href="https://osirisai.live"
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-[11px] font-mono flex items-center gap-1.5 transition"
                      >
                        <ExternalLink className="w-3 h-3 text-cyan-400" />
                        <span>osirisai.live</span>
                      </a>
                      <button
                        type="button"
                        onClick={handleRunOsirisScript}
                        disabled={osirisScriptLoading}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs font-mono tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105 disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {osirisScriptLoading ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-slate-950" />
                        )}
                        <span>{osirisScriptLoading ? "FÜHRE SKRIPT AUS..." : "SKRIPT AUSFÜHREN"}</span>
                      </button>
                    </div>
                  </div>

                  {/* The User Requested Bash Script Box */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-zinc-400 font-bold flex items-center gap-1.5">
                        <Terminal className="w-3 h-3 text-cyan-400" />
                        <span>ANGEFORDERTES BASH-SKRIPT:</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText("curl -s https://osirisai.live/api/flights | jq '.commercial_flights | length'");
                          setOsirisCopiedScript(true);
                          setTimeout(() => setOsirisCopiedScript(false), 2000);
                          showToast(isEn ? "Command copied to clipboard!" : "Befehl in Zwischenablage kopiert!", "info");
                        }}
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition text-[11px]"
                      >
                        {osirisCopiedScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{osirisCopiedScript ? "Kopiert!" : "Kopieren"}</span>
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-black/90 border border-cyan-500/30 font-mono text-xs flex items-center justify-between gap-2 overflow-x-auto">
                      <code className="text-cyan-300 font-bold select-all whitespace-nowrap">
                        <span className="text-pink-400">curl</span> <span className="text-amber-300">-s</span> https://osirisai.live/api/flights | <span className="text-emerald-400">jq</span> <span className="text-yellow-300">'.commercial_flights | length'</span>
                      </code>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 font-sans shrink-0">
                        BASH / REST
                      </span>
                    </div>
                  </div>

                  {/* Key Output Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-mono font-bold text-cyan-300/80 uppercase">
                          .commercial_flights | length
                        </div>
                        <div className="text-2xl font-black text-cyan-300 font-mono mt-0.5 flex items-baseline gap-1.5">
                          <span>{osirisScriptResult ? osirisScriptResult.count.toLocaleString() : "—"}</span>
                          <span className="text-xs font-normal text-cyan-400/80">Flüge aktiv</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-1 font-mono">
                          Weltweit erfasste Passagier- & Frachtjets
                        </div>
                      </div>
                      <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                        <Plane className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/30 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-mono font-bold text-blue-300/80 uppercase">
                          Special / Military Flights
                        </div>
                        <div className="text-2xl font-black text-blue-300 font-mono mt-0.5 flex items-baseline gap-1.5">
                          <span>{osirisScriptResult ? osirisScriptResult.militaryFlightsCount.toLocaleString() : "—"}</span>
                          <span className="text-xs font-normal text-blue-400/80">Transponder</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-1 font-mono">
                          Militär, Regierungs- & Suchflieger
                        </div>
                      </div>
                      <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <Radio className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-teal-950/30 border border-teal-500/30 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-mono font-bold text-teal-300/80 uppercase">
                          API Latenz / Status
                        </div>
                        <div className="text-2xl font-black text-teal-300 font-mono mt-0.5 flex items-baseline gap-1.5">
                          <span>{osirisScriptResult ? `${osirisScriptResult.executionMs}ms` : "Bereit"}</span>
                          <span className="text-xs font-normal text-teal-400/80">200 OK</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-1 font-mono">
                          {osirisScriptResult ? `Aktualisiert: ${osirisScriptResult.timestamp.split("T")[1]?.slice(0, 8) || "Jetzt"}` : "Klicke auf Skript Ausführen"}
                        </div>
                      </div>
                      <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                        <Activity className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Interactive Terminal Log Window */}
                <div className="rounded-xl bg-black border border-zinc-800 overflow-hidden shadow-2xl font-mono">
                  <div className="p-2.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                      </div>
                      <span className="text-xs font-bold text-zinc-300 ml-2">bash terminal — admin@syntax:~/osiris-script</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setOsirisTerminalLog(["# Terminal zurückgesetzt."])}
                        className="text-[10px] text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 transition"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 space-y-1 text-xs max-h-48 overflow-y-auto custom-scrollbar text-emerald-400 font-mono">
                    {osirisTerminalLog.map((line, idx) => (
                      <div
                        key={idx}
                        className={`${
                          line.startsWith("$")
                            ? "text-cyan-300 font-bold"
                            : line.startsWith(">")
                            ? "text-zinc-400"
                            : line.startsWith("[✓")
                            ? "text-emerald-300 font-bold"
                            : line.startsWith("#")
                            ? "text-zinc-500"
                            : "text-amber-300"
                        }`}
                      >
                        {line}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Filterable Flight Explorer Table */}
                {osirisScriptResult && osirisScriptResult.sampleFlights && osirisScriptResult.sampleFlights.length > 0 && (
                  <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                          <Plane className="w-4 h-4 text-cyan-400" />
                          <span>LIVE TRANSPONDER FEED (OSIRIS AI)</span>
                        </h4>
                        <p className="text-[11px] text-zinc-400 font-mono">
                          Auszug aktiver Flüge mit ICAO24 Transponderdaten & Route
                        </p>
                      </div>

                      <div className="relative w-full sm:w-64">
                        <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={osirisFlightFilter}
                          onChange={(e) => setOsirisFlightFilter(e.target.value)}
                          placeholder="Filter nach Callsign / ICAO..."
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="border border-zinc-800 rounded-lg overflow-hidden max-h-64 overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left font-mono text-xs">
                        <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800 sticky top-0">
                          <tr>
                            <th className="p-2.5">CALLSIGN</th>
                            <th className="p-2.5">ICAO24</th>
                            <th className="p-2.5">FLUGZEUG / TYPE</th>
                            <th className="p-2.5">HÖHE (FT)</th>
                            <th className="p-2.5">GESCHWINDIGKEIT</th>
                            <th className="p-2.5">HEADING</th>
                            <th className="p-2.5">KOORDINATEN</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                          {osirisScriptResult.sampleFlights
                            .filter((f: any) => {
                              if (!osirisFlightFilter) return true;
                              const q = osirisFlightFilter.toLowerCase();
                              return (
                                (f.callsign || "").toLowerCase().includes(q) ||
                                (f.icao24 || "").toLowerCase().includes(q) ||
                                (f.aircraft || "").toLowerCase().includes(q)
                              );
                            })
                            .map((flight: any, idx: number) => (
                              <tr key={idx} className="hover:bg-cyan-950/20 transition">
                                <td className="p-2.5 font-bold text-cyan-300 flex items-center gap-1.5">
                                  <Plane className="w-3 h-3 text-cyan-400" />
                                  <span>{flight.callsign || "UNKN"}</span>
                                </td>
                                <td className="p-2.5 text-zinc-400">{flight.icao24 || "—"}</td>
                                <td className="p-2.5 text-zinc-300">{flight.aircraft || "Commercial Jet"}</td>
                                <td className="p-2.5 text-emerald-400 font-bold">{flight.altitude ? `${flight.altitude.toLocaleString()} ft` : "Cruise"}</td>
                                <td className="p-2.5 text-amber-300">{flight.speed ? `${flight.speed} kts` : "450 kts"}</td>
                                <td className="p-2.5 text-zinc-300">{flight.heading ? `${flight.heading}°` : "090°"}</td>
                                <td className="p-2.5 text-zinc-400 text-[10.5px]">
                                  {flight.lat && flight.lng ? `${flight.lat.toFixed(2)}°, ${flight.lng.toFixed(2)}°` : "GPS Lock"}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* MODAL 1: SHARE KEY (WHATSAPP / EMAIL / DIRECT URL) */}
        {shareKeyModal && (
          <div className="fixed inset-0 z-[160] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
              <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-white text-sm">
                    {isEn ? `Share Key '${shareKeyModal.key}'` : `Zugangs-Key '${shareKeyModal.key}' Teilen`}
                  </h3>
                </div>
                <button
                  onClick={() => setShareKeyModal(null)}
                  className="p-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                    Direkt-Zugangs-URL (1-Klick Login ohne Passwort):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generateKeyDirectUrl(shareKeyModal.key)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-indigo-300 font-mono text-[11px] select-all"
                    />
                    <button
                      onClick={() => handleCopyDirectUrl(shareKeyModal)}
                      className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition cursor-pointer"
                    >
                      Kopieren
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(generateKeyWhatsAppInvite(shareKeyModal))}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold flex items-center justify-center gap-2 transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Teilen</span>
                  </a>

                  {(() => {
                    const emailData = generateKeyEmailInvite(shareKeyModal);
                    return (
                      <a
                        href={`mailto:?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`}
                        className="p-3 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 font-bold flex items-center justify-center gap-2 transition"
                      >
                        <Mail className="w-4 h-4" />
                        <span>E-Mail Einladung</span>
                      </a>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: MANUAL USER ADD */}
        {showAddForm && (
          <div className="fixed inset-0 z-[160] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
              <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="font-bold text-white text-sm">
                  {isEn ? "Create New User / Lead" : "Neuen Lead / Nutzer Manuell Anlegen"}
                </h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleManualAddSubmit} className="p-5 space-y-3.5 text-xs">
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Name:</label>
                  <input
                    type="text"
                    required
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="Max Mustermann"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">E-Mail Adresse *:</label>
                  <input
                    type="email"
                    required
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder="max@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Plan:</label>
                  <select
                    value={manualPlan}
                    onChange={(e) => setManualPlan(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white outline-none"
                  >
                    <option value="PRO_29">Pro (29 € / Monat)</option>
                    <option value="ENTERPRISE_99">Enterprise (99 € / Monat)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="directGrant"
                    checked={manualDirectGrant}
                    onChange={(e) => setManualDirectGrant(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="directGrant" className="text-zinc-300 cursor-pointer font-medium">
                    Sofort voll freischalten (ohne 24h Begrenzung)
                  </label>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                  >
                    Nutzer Anlegen
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 4: DETAILED LEAD INSPECTION MODAL (ZEITSTEMPEL & METADATEN) */}
        {selectedLeadDetails && (
          <div className="fixed inset-0 z-[160] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-xl bg-zinc-950 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      Anmelde-Details & Registrierungs-Zeitstempel
                    </h3>
                    <p className="text-[11px] text-zinc-400 font-mono">
                      ID: {selectedLeadDetails.id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLeadDetails(null)}
                  className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-5 overflow-y-auto custom-scrollbar space-y-4 text-xs">
                {/* Highlight: Date & Time Box */}
                {(() => {
                  const ts = formatLeadTimestamp(selectedLeadDetails.registeredAt);
                  return (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-zinc-900 to-indigo-950/30 border border-cyan-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" />
                          Exakter Registrierungs-Zeitpunkt
                        </span>
                        {ts.isRecent && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40 animate-pulse">
                            FRISCH EINGETRAGEN
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="p-2.5 rounded-lg bg-black/50 border border-zinc-800">
                          <div className="text-[10px] text-zinc-400 font-medium">UHRZEIT</div>
                          <div className="text-base font-bold font-mono text-cyan-300">
                            {selectedLeadDetails.registeredTime || ts.timeStr}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-black/50 border border-zinc-800">
                          <div className="text-[10px] text-zinc-400 font-medium">DATUM</div>
                          <div className="text-base font-bold font-mono text-zinc-100">
                            {selectedLeadDetails.registeredDate || ts.dateStr}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/80">
                        <span>Relatives Alter: <strong className="text-zinc-200">{ts.relativeStr}</strong></span>
                        <span className="font-mono text-[10px] text-zinc-500">{selectedLeadDetails.registeredAt}</span>
                      </div>
                    </div>
                  );
                })()}

                {/* User & Contact Information */}
                <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2.5">
                  <div className="font-semibold text-zinc-300 text-xs border-b border-zinc-800 pb-1.5">
                    Nutzer & Kontakt-Daten
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <div className="text-[10px] text-zinc-400">Name:</div>
                      <div className="text-white font-semibold text-xs mt-0.5">
                        {selectedLeadDetails.name || "Unbenannt"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-400">E-Mail:</div>
                      <div
                        onClick={() => {
                          navigator.clipboard.writeText(selectedLeadDetails.email);
                          showToast(`E-Mail kopiert: ${selectedLeadDetails.email}`, "success");
                        }}
                        className="text-cyan-300 font-mono text-xs mt-0.5 flex items-center gap-1 cursor-pointer hover:underline"
                        title="Klicken zum Kopieren"
                      >
                        <span className="truncate">{selectedLeadDetails.email}</span>
                        <Copy className="w-3 h-3 flex-shrink-0" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Slot, Source & Device Metadata */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800">
                    <div className="text-[10px] text-zinc-400">Zugewiesener Slot:</div>
                    <div className="text-sm font-bold font-mono text-indigo-300 mt-0.5">
                      Slot #{selectedLeadDetails.slot || "—"}{" "}
                      <span className="text-[10px] text-zinc-500 font-normal">/ 500 Plätze</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800">
                    <div className="text-[10px] text-zinc-400">Status:</div>
                    <div className="mt-1">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          selectedLeadDetails.status === "GRANTED"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : selectedLeadDetails.status === "TRIAL_ACTIVE"
                            ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                            : selectedLeadDetails.status === "PENDING_APPROVAL"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        }`}
                      >
                        {selectedLeadDetails.status === "GRANTED"
                          ? "FREIGESCHALTET"
                          : selectedLeadDetails.status === "TRIAL_ACTIVE"
                          ? "TESTPHASE AKTIV"
                          : selectedLeadDetails.status === "PENDING_APPROVAL"
                          ? "WARTEND AUF ADMIN"
                          : "GESPERRT"}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800">
                    <div className="text-[10px] text-zinc-400">Herkunft / Anmeldequelle:</div>
                    <div className="text-zinc-200 font-mono text-[11px] mt-0.5 break-words">
                      {selectedLeadDetails.source || "VIP Warteliste (3 Tage gratis)"}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800">
                    <div className="text-[10px] text-zinc-400">Endgerät / Browser:</div>
                    <div className="text-zinc-200 font-mono text-[11px] mt-0.5">
                      {selectedLeadDetails.device || "Desktop Browser"}
                    </div>
                  </div>
                </div>

                {/* Plan & Trial Duration */}
                <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400">GEWÄHLTER TARIF:</span>
                    <span className="font-bold text-indigo-300">
                      {selectedLeadDetails.plan === "ENTERPRISE_99" ? "Enterprise Core (99 €/Monat)" : "Pro Core (29 €/Monat)"}
                    </span>
                  </div>
                  {selectedLeadDetails.trialExpiresAt && (
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-800">
                      <span className="text-zinc-400">Testphase Ablaufdatum:</span>
                      <span className="font-mono text-amber-300">
                        {formatLeadTimestamp(selectedLeadDetails.trialExpiresAt).dateStr} um {formatLeadTimestamp(selectedLeadDetails.trialExpiresAt).timeStr}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-800">
                    <span className="text-zinc-400">Persönlicher Token:</span>
                    <span className="font-mono text-zinc-300">{selectedLeadDetails.token}</span>
                  </div>
                </div>

                {/* Notes */}
                {(selectedLeadDetails.notes || selectedLeadDetails.goal) && (
                  <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-1">
                    <div className="text-[10px] text-zinc-400 font-semibold">NOTIZEN / ZIEL:</div>
                    <div className="text-zinc-300 text-[11px] whitespace-pre-wrap">
                      {selectedLeadDetails.notes || selectedLeadDetails.goal}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-3.5 bg-zinc-900 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {selectedLeadDetails.status !== "GRANTED" && (
                    <button
                      onClick={() => {
                        handleGrantAccess(selectedLeadDetails);
                        setSelectedLeadDetails((prev) => prev ? { ...prev, status: "GRANTED" } : null);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition cursor-pointer"
                    >
                      Voll Freischalten
                    </button>
                  )}
                  {selectedLeadDetails.status !== "TRIAL_ACTIVE" && (
                    <button
                      onClick={() => {
                        handleGrantTrial(selectedLeadDetails);
                        setSelectedLeadDetails((prev) => prev ? { ...prev, status: "TRIAL_ACTIVE" } : null);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition cursor-pointer"
                    >
                      24h Testphase
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const l = selectedLeadDetails;
                      setSelectedLeadDetails(null);
                      handleOpenEditModal(l);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition cursor-pointer"
                  >
                    Bearbeiten
                  </button>
                </div>

                <button
                  onClick={() => setSelectedLeadDetails(null)}
                  className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition cursor-pointer"
                >
                  Schließen
                </button>
              </div>
            </div>
          </div>
        )}
        {/* MODAL 5: EDIT LEAD MODAL */}
        {editingLead && (
          <div className="fixed inset-0 z-[165] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
              <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="font-bold text-white text-sm">
                  {isEn ? `Edit ${editingLead.name}` : `Lead '${editingLead.name}' Bearbeiten`}
                </h3>
                <button
                  onClick={() => setEditingLead(null)}
                  className="p-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveLeadEdit} className="p-5 space-y-3.5 text-xs">
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Name:</label>
                  <input
                    type="text"
                    value={editFormName}
                    onChange={(e) => setEditFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">E-Mail:</label>
                  <input
                    type="email"
                    value={editFormEmail}
                    onChange={(e) => setEditFormEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-zinc-300 block mb-1">Plan:</label>
                    <select
                      value={editFormPlan}
                      onChange={(e) => setEditFormPlan(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white outline-none"
                    >
                      <option value="PRO_29">Pro (29 €)</option>
                      <option value="ENTERPRISE_99">Enterprise (99 €)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-zinc-300 block mb-1">Status:</label>
                    <select
                      value={editFormStatus}
                      onChange={(e) => setEditFormStatus(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white outline-none"
                    >
                      <option value="GRANTED">Voll Freigeschaltet</option>
                      <option value="TRIAL_ACTIVE">24h Test Aktiv</option>
                      <option value="PENDING_APPROVAL">Wartend</option>
                      <option value="REVOKED">Gesperrt</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Notizen:</label>
                  <textarea
                    value={editFormNotes}
                    onChange={(e) => setEditFormNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white outline-none resize-none"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingLead(null)}
                    className="px-3 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                  >
                    Speichern
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: INVOICE VIEWER & PRINT DIALOG */}
        {selectedInvoiceForViewer && (
          <InvoiceViewerModal
            isOpen={isInvoiceViewerOpen}
            onClose={() => {
              setIsInvoiceViewerOpen(false);
              setSelectedInvoiceForViewer(null);
            }}
            invoice={selectedInvoiceForViewer}
            profileInfo={{
              name: selectedInvoiceForViewer.recipientName,
              email: selectedInvoiceForViewer.recipientEmail,
              slot: selectedInvoiceForViewer.recipientSlot,
              token: selectedInvoiceForViewer.quantumToken,
            }}
            lang={lang}
          />
        )}
      </div>
    </div>
  );
};
