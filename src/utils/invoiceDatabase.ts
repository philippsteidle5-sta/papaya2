import { InvoiceItemData, computeInvoiceBreakdown } from "./invoiceGenerator";
import { SUPERADMIN_EMAIL, getCurrentUserEmail, isSuperAdminEmail } from "./leadDatabase";

export interface AdminInvoiceRecord {
  id: string;
  number: string;
  date: string;
  amount: number; // Brutto in EUR, z. B. 29.00 oder 99.00
  netAmount: number;
  taxAmount: number;
  taxRatePercent?: number;
  currency: string;
  planName: string;
  status: "PAID" | "PENDING" | "REFUNDED";
  paymentMethodLabel: string;
  paymentType?: "apple_pay" | "google_pay" | "paypal" | "klarna" | "card" | "crypto" | "invoice_transfer";
  recipientName: string;
  recipientEmail: string;
  recipientSlot: number | string;
  quantumToken: string;
  features: string[];
  paidAt?: string;
  notes?: string;
  createdAt?: string;
}

const LOCAL_STORAGE_INVOICES_KEY = "syntax_admin_all_invoices_v1";

// Realistic baseline seed invoices covering all payment methods & statuses
const DEFAULT_SEED_INVOICES: AdminInvoiceRecord[] = [
  {
    id: "inv_2026_2319",
    number: "#SYNTAX-INV-2026-2319",
    date: "20.08.2026",
    amount: 99.00,
    netAmount: 80.19,
    taxAmount: 18.81,
    currency: "EUR",
    planName: "1x SOVEREIGN ENTERPRISE Plan (monthly)",
    status: "PAID",
    paymentMethodLabel: "PayPal Express (philippsteidle5@gmail.com)",
    paymentType: "paypal",
    recipientName: "Philipp Steidle",
    recipientEmail: "philippsteidle5@gmail.com",
    recipientSlot: 1,
    quantumToken: "MZ-SUPERADMIN-FULLCORE-ROOT-9988",
    features: [
      "Bereitstellung von 8 sovereign KI-Cores (SYNTAX, NEO, VEGA, ODIN, etc.)",
      "256-bit Quantum-Verschlüsselung & lückenloser Speicher",
    ],
    paidAt: "20.08.2026 14:32 Uhr",
    notes: "Superadmin Root Lifetime Verification & Enterprise Core activation",
  },
  {
    id: "inv_2026_1711",
    number: "#SYNTAX-INV-2026-1711",
    date: "14.08.2026",
    amount: 29.00,
    netAmount: 23.49,
    taxAmount: 5.51,
    currency: "EUR",
    planName: "1x PRO SOVEREIGN CORE Plan (monthly)",
    status: "PAID",
    paymentMethodLabel: "Apple Pay (Touch ID autorisiert)",
    paymentType: "apple_pay",
    recipientName: "Philipp Steidle",
    recipientEmail: "philippsteidle5@gmail.com",
    recipientSlot: 1,
    quantumToken: "MZ-SUPERADMIN-FULLCORE-ROOT-9988",
    features: [
      "Bereitstellung von 8 sovereign KI-Cores (SYNTAX, NEO, VEGA, ODIN, etc.)",
      "256-bit Quantum-Verschlüsselung & lückenloser Speicher",
    ],
    paidAt: "14.08.2026 09:15 Uhr",
    notes: "Pro Core Test-Aktivierung via Apple Pay Express",
  },
  {
    id: "inv_2026_0944",
    number: "#SYNTAX-INV-2026-0944",
    date: "04.09.2026",
    amount: 99.00,
    netAmount: 80.19,
    taxAmount: 18.81,
    currency: "EUR",
    planName: "1x SOVEREIGN ENTERPRISE Plan (monthly)",
    status: "PAID",
    paymentMethodLabel: "Klarna Sofortüberweisung",
    paymentType: "klarna",
    recipientName: "Dr. Maximilian von Bergen",
    recipientEmail: "m.bergen@quantum-labs.de",
    recipientSlot: 412,
    quantumToken: "MZ-QUANTUM-MB88-412",
    features: [
      "Bereitstellung von 8 sovereign KI-Cores",
      "Dedizierte Cluster-Instanz & 256-bit Quantum-Verschlüsselung",
    ],
    paidAt: "04.09.2026 18:22 Uhr",
    notes: "Klarna Sofort Transaktions-ID: KLN-2026-881923",
  },
  {
    id: "inv_2026_0891",
    number: "#SYNTAX-INV-2026-0891",
    date: "02.09.2026",
    amount: 99.00,
    netAmount: 80.19,
    taxAmount: 18.81,
    currency: "EUR",
    planName: "1x SOVEREIGN ENTERPRISE Plan (monthly)",
    status: "PAID",
    paymentMethodLabel: "Google Pay (1-Click)",
    paymentType: "google_pay",
    recipientName: "Sarah Lin",
    recipientEmail: "s.lin@cybernet-systems.com",
    recipientSlot: 428,
    quantumToken: "MZ-QUANTUM-SL99-428",
    features: [
      "Bereitstellung von 8 sovereign KI-Cores",
      "256-bit Quantum-Verschlüsselung & lückenloser Speicher",
    ],
    paidAt: "02.09.2026 11:45 Uhr",
    notes: "Autorisiert via Google Pay Tokenization",
  },
  {
    id: "inv_2026_0782",
    number: "#SYNTAX-INV-2026-0782",
    date: "28.08.2026",
    amount: 29.00,
    netAmount: 23.49,
    taxAmount: 5.51,
    currency: "EUR",
    planName: "1x PRO SOVEREIGN CORE Plan (monthly)",
    status: "PAID",
    paymentMethodLabel: "Stripe Visa (•••• 4242)",
    paymentType: "card",
    recipientName: "Florian Becker",
    recipientEmail: "f.becker@dev-studio.org",
    recipientSlot: 450,
    quantumToken: "MZ-QUANTUM-FB12-450",
    features: [
      "Bereitstellung von 8 sovereign KI-Cores (SYNTAX, NEO, VEGA, ODIN, etc.)",
      "256-bit Quantum-Verschlüsselung",
    ],
    paidAt: "28.08.2026 16:10 Uhr",
    notes: "Stripe 3D-Secure 2.0 Auth ID: ch_3P7aBC42981",
  },
  {
    id: "inv_2026_0655",
    number: "#SYNTAX-INV-2026-0655",
    date: "05.09.2026",
    amount: 198.00,
    netAmount: 160.38,
    taxAmount: 37.62,
    currency: "EUR",
    planName: "2x SOVEREIGN ENTERPRISE Multi-Seat",
    status: "PENDING",
    paymentMethodLabel: "B2B Kauf auf Rechnung (Zahlungsziel 14 Tage)",
    paymentType: "invoice_transfer",
    recipientName: "TechVentures DACH GmbH (Hr. Weber)",
    recipientEmail: "buchhaltung@techventures-dach.de",
    recipientSlot: 462,
    quantumToken: "MZ-QUANTUM-TV90-462",
    features: [
      "2x Enterprise Lizenz für Software-Architektur Team",
      "256-bit Quantum-Verschlüsselung & Sammelrechnung",
    ],
    notes: "B2B Purchase Order: PO-2026-09-DACH. Warten auf SEPA-Überweisungseingang.",
  },
  {
    id: "inv_2026_0520",
    number: "#SYNTAX-INV-2026-0520",
    date: "06.09.2026",
    amount: 29.00,
    netAmount: 23.49,
    taxAmount: 5.51,
    currency: "EUR",
    planName: "1x PRO SOVEREIGN CORE Plan (monthly)",
    status: "PENDING",
    paymentMethodLabel: "PayPal (Autorisierung ausstehend)",
    paymentType: "paypal",
    recipientName: "Julian Mayer",
    recipientEmail: "j.mayer@alphacode.io",
    recipientSlot: 471,
    quantumToken: "MZ-QUANTUM-JM33-471",
    features: [
      "Bereitstellung von 8 sovereign KI-Cores",
      "256-bit Quantum-Verschlüsselung",
    ],
    notes: "Vormerkung für monatlichen Einzug. Erstabbuchung in Bearbeitung.",
  },
];

/**
 * Get all admin invoices from local storage or default seeds
 */
export function getStoredAdminInvoices(): AdminInvoiceRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_INVOICES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Could not parse cached admin invoices:", e);
  }

  // Seed default if empty
  try {
    localStorage.setItem(LOCAL_STORAGE_INVOICES_KEY, JSON.stringify(DEFAULT_SEED_INVOICES));
  } catch {}
  return [...DEFAULT_SEED_INVOICES];
}

/**
 * Persist invoices in localStorage
 */
export function persistAdminInvoices(invoices: AdminInvoiceRecord[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_INVOICES_KEY, JSON.stringify(invoices));
  } catch (e) {
    console.error("Failed to persist admin invoices:", e);
  }
}

/**
 * Fetch all admin invoices from server with local cache fallback and synchronization
 */
export async function fetchAllAdminInvoices(): Promise<AdminInvoiceRecord[]> {
  try {
    const adminEmail = SUPERADMIN_EMAIL;
    const res = await fetch(`/api/admin/invoices?adminEmail=${encodeURIComponent(adminEmail)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.ok && Array.isArray(data.invoices) && data.invoices.length > 0) {
        persistAdminInvoices(data.invoices);
        return data.invoices;
      }
    }
  } catch (e) {
    console.warn("Could not fetch invoices from server API, using local storage:", e);
  }

  return getStoredAdminInvoices();
}

/**
 * Toggle or update invoice status (e.g. mark PENDING as PAID, or vice versa)
 */
export async function updateAdminInvoiceStatus(
  invoiceId: string,
  newStatus: "PAID" | "PENDING" | "REFUNDED",
  notes?: string
): Promise<{ ok: boolean; invoice?: AdminInvoiceRecord }> {
  const current = getStoredAdminInvoices();
  const idx = current.findIndex((inv) => inv.id === invoiceId || inv.number === invoiceId);

  if (idx === -1) {
    return { ok: false };
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString("de-DE") + " " + now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) + " Uhr";

  current[idx] = {
    ...current[idx],
    status: newStatus,
    paidAt: newStatus === "PAID" ? (current[idx].paidAt || dateStr) : undefined,
    notes: notes !== undefined ? notes : current[idx].notes,
  };

  persistAdminInvoices(current);

  // Sync with backend API
  try {
    await fetch("/api/admin/invoices/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        adminEmail: SUPERADMIN_EMAIL,
        invoiceId: current[idx].id,
        status: newStatus,
        notes: current[idx].notes,
      }),
    });
  } catch {}

  return { ok: true, invoice: current[idx] };
}

/**
 * Record a new checkout payment invoice (called when an order is completed)
 */
export function recordNewCheckoutInvoice(data: {
  name: string;
  email: string;
  amount: number;
  planName?: string;
  paymentMethod: string;
  paymentType?: AdminInvoiceRecord["paymentType"];
  slot?: number | string;
  token?: string;
  status?: "PAID" | "PENDING";
  notes?: string;
}): AdminInvoiceRecord {
  const current = getStoredAdminInvoices();
  const now = new Date();
  const year = now.getFullYear();
  const randomId = Math.floor(1000 + Math.random() * 9000);
  const invoiceNumber = `#SYNTAX-INV-${year}-${randomId}`;

  const gross = data.amount;
  const { net, tax } = computeInvoiceBreakdown(gross);

  const newInvoice: AdminInvoiceRecord = {
    id: `inv_${Date.now()}_${randomId}`,
    number: invoiceNumber,
    date: now.toLocaleDateString("de-DE"),
    amount: gross,
    netAmount: net,
    taxAmount: tax,
    currency: "EUR",
    planName: data.planName || (gross === 29 ? "1x PRO SOVEREIGN CORE Plan (monthly)" : "1x SOVEREIGN ENTERPRISE Plan (monthly)"),
    status: data.status || "PAID",
    paymentMethodLabel: data.paymentMethod,
    paymentType: data.paymentType || "card",
    recipientName: data.name || "Sovereign Commander",
    recipientEmail: data.email,
    recipientSlot: data.slot || Math.floor(400 + Math.random() * 90),
    quantumToken: data.token || `MZ-QUANTUM-${data.email.slice(0, 4).toUpperCase()}-${randomId}`,
    features: [
      "Bereitstellung von 8 sovereign KI-Cores (SYNTAX, NEO, VEGA, ODIN, etc.)",
      "256-bit Quantum-Verschlüsselung & lückenloser Speicher",
    ],
    paidAt: (data.status || "PAID") === "PAID" ? (now.toLocaleDateString("de-DE") + " " + now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) + " Uhr") : undefined,
    notes: data.notes || `Direktbuchung im System via ${data.paymentMethod}`,
    createdAt: now.toISOString(),
  };

  // Add to front
  current.unshift(newInvoice);
  persistAdminInvoices(current);

  // Sync to server
  try {
    fetch("/api/admin/invoices/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        adminEmail: SUPERADMIN_EMAIL,
        invoice: newInvoice,
      }),
    }).catch(() => {});
  } catch {}

  return newInvoice;
}

/**
 * Delete an invoice from database
 */
export async function deleteAdminInvoice(invoiceId: string): Promise<boolean> {
  const current = getStoredAdminInvoices();
  const filtered = current.filter((inv) => inv.id !== invoiceId && inv.number !== invoiceId);
  persistAdminInvoices(filtered);

  try {
    await fetch("/api/admin/invoices/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        adminEmail: SUPERADMIN_EMAIL,
        invoiceId,
      }),
    });
  } catch {}

  return true;
}

/**
 * Export all invoices as CSV string & trigger immediate browser download
 */
export function exportInvoicesToCsv(invoices: AdminInvoiceRecord[]): void {
  const headers = [
    "Rechnungsnummer",
    "Datum",
    "Status",
    "Kunde Name",
    "Kunde E-Mail",
    "Slot #",
    "Plan",
    "Zahlungsart",
    "Brutto (EUR)",
    "Netto (EUR)",
    "MwSt 19% (EUR)",
    "Bezahlt am",
    "Notizen",
  ];

  const rows = invoices.map((inv) => [
    inv.number,
    inv.date,
    inv.status === "PAID" ? "BEZAHLT" : (inv.status === "PENDING" ? "OFFEN" : "ERSTATTET"),
    `"${(inv.recipientName || "").replace(/"/g, '""')}"`,
    inv.recipientEmail,
    inv.recipientSlot || "",
    `"${(inv.planName || "").replace(/"/g, '""')}"`,
    `"${(inv.paymentMethodLabel || "").replace(/"/g, '""')}"`,
    inv.amount.toFixed(2).replace(".", ","),
    inv.netAmount.toFixed(2).replace(".", ","),
    inv.taxAmount.toFixed(2).replace(".", ","),
    `"${(inv.paidAt || "").replace(/"/g, '""')}"`,
    `"${(inv.notes || "").replace(/"/g, '""')}"`,
  ]);

  const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute("href", url);
  link.setAttribute("download", `SYNTAX_Rechnungen_Billing_Export_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
