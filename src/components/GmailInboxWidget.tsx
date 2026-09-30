import React, { useState, useEffect } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);

import {
  Mail,
  Inbox,
  Send,
  FileText,
  Trash2,
  Star,
  Search,
  Sparkles,
  Bot,
  RefreshCw,
  Plus,
  CheckCircle2,
  Clock,
  Tag,
  ArrowLeft,
  X,
  Paperclip,
  Check,
  Zap,
  Filter,
  Eye,
  CornerUpLeft,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  AlertOctagon,
  Key,
  ExternalLink,
  Lock,
  Globe,
  AlertTriangle,
  User,
  Copy,
  Share2,
  Layers,
  Cpu,
  ChevronRight,
  SlidersHorizontal,
  Bookmark,
  Ban,
  Archive,
  Folder,
  FolderArchive,
  Info,
  CheckCheck
} from "lucide-react";
import { DraggableResizableWidget } from "./DraggableResizableWidget";
import { useTheme } from "../utils/themeStore";

export type EmailFolder = "inbox" | "spam" | "starred" | "sent" | "drafts" | "trash";

export interface EmailMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  recipientName?: string;
  recipientEmail?: string;
  subject: string;
  snippet: string;
  body: string;
  htmlBody?: string;
  timestamp: string; // e.g. "20:26 Uhr"
  fullDate?: string; // e.g. "Mi., 12.08.2026, 20:26:14 Uhr"
  relativeTime?: string; // e.g. "vor 4 Min"
  unread: boolean;
  starred: boolean;
  folder: EmailFolder;
  isSpam?: boolean;
  spamReason?: string;
  spamScore?: number; // 0 to 100
  phishingRisk?: "LOW" | "MEDIUM" | "HIGH";
  label: string;
  category?: string;
  aiSummary?: string;
  aiSuggestedReply?: string;
  isReal?: boolean;
}

// Clean HTML into human-readable plain text without any CSS, JS or XML debris
export const cleanHtmlToText = (html: string): string => {
  if (!html) return "";
  let clean = html;

  // 1. Remove XML / MSO / Conditional Comments
  clean = clean.replace(/<\?xml[\s\S]*?\?>/gi, "");
  clean = clean.replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, "");
  clean = clean.replace(/<!--[\s\S]*?-->/gi, "");

  // 2. Remove entire <style> ... </style> blocks and CSS
  clean = clean.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");

  // 3. Remove entire <script> ... </script> blocks
  clean = clean.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");

  // 4. Remove entire <head> ... </head> blocks
  clean = clean.replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, "");

  // 5. Replace structural breaks with line breaks
  clean = clean.replace(/<\/(p|div|tr|h[1-6]|table|blockquote)>/gi, "\n\n");
  clean = clean.replace(/<br\s*[\/]?>/gi, "\n");
  clean = clean.replace(/<li\b[^>]*>/gi, "\n• ");
  clean = clean.replace(/<\/li>/gi, "");

  // 6. Strip all remaining HTML tags
  clean = clean.replace(/<[^>]+>/gi, "");

  // 7. Decode HTML entities
  clean = clean
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, "/")
    .replace(/&copy;/gi, "©")
    .replace(/&reg;/gi, "®")
    .replace(/&#(\d+);/gi, (_, dec) => {
      try {
        return String.fromCharCode(parseInt(dec, 10));
      } catch (e) {
        return "";
      }
    });

  // 8. Remove any leftover raw CSS @media or class artifact blocks if any leaked
  clean = clean.replace(/\}?\s*@media[^{]*\{[\s\S]*?\}\s*\}?/gi, "");
  clean = clean.replace(/\{[^}]*(?:color|font|margin|padding|display|background|border|width)[^}]*\}/gi, "");

  // 9. Normalize whitespace and blank lines
  clean = clean.replace(/[ \t]+/g, " ");
  clean = clean.replace(/\n\s*\n\s*\n+/g, "\n\n");
  return clean.trim();
};

// Heuristic to check if a body string contains raw HTML/CSS and needs dynamic cleaning
export const sanitizeBodyText = (text: string): string => {
  if (!text) return "";
  if (
    text.includes("<style") ||
    text.includes("<html") ||
    text.includes("<div") ||
    text.includes("<table") ||
    text.includes("@media") ||
    text.includes("xmlns:") ||
    text.includes("<!--[if")
  ) {
    return cleanHtmlToText(text);
  }
  return text;
};

// Intelligent Neural & Heuristic Spam & Phishing Detector
export const detectSpamAndPhishing = (msg: {
  subject: string;
  body: string;
  senderEmail: string;
  senderName: string;
  labelIds?: string[];
}, isEn = true): { isSpam: boolean; score: number; reason: string; risk: "LOW" | "MEDIUM" | "HIGH" } => {
  // If Google Workspace Gmail explicitly labeled it with SPAM
  if (msg.labelIds?.includes("SPAM")) {
    return {
      isSpam: true,
      score: 98,
      reason: isEn ? "Google Workspace Gmail Security Filter: Flagged with SPAM label." : "Google Workspace Gmail Sicherheitsfilter: Nachricht ist mit SPAM-Label markiert.",
      risk: "HIGH",
    };
  }

  const text = `${msg.subject} ${msg.body} ${msg.senderEmail} ${msg.senderName}`.toLowerCase();
  
  let score = 0;
  const reasons: string[] = [];

  // Phishing & Urgent Account Takeover threats
  if (
    (text.includes("passwort") && (text.includes("gesperrt") || text.includes("unautorisierter zugriff") || text.includes("innerhalb von 2 stunden") || text.includes("konto unwiderruflich gelöscht"))) ||
    (text.includes("password") && (text.includes("suspended") || text.includes("unauthorized access") || text.includes("within 2 hours") || text.includes("permanently deleted"))) ||
    (text.includes("sicherheitswarnung") && text.includes("identität") && text.includes("bestätigen")) ||
    (text.includes("security alert") && text.includes("identity") && text.includes("confirm")) ||
    text.includes("banking & google account wurde temporär gesperrt") ||
    text.includes("banking & google account has been temporarily suspended")
  ) {
    score += 75;
    reasons.push(isEn ? "Suspected Phishing / Urgent password or identity verification prompt" : "Verdacht auf Phishing / Dringende Aufforderung zur Passwort- oder Identitätsbestätigung");
  }

  // Advance-Fee & Crypto Airdrop Fraud (Require specific scam patterns)
  if (
    (text.includes("airdrop") && text.includes("network fee") && text.includes("transfer")) ||
    (text.includes("airdrop") && text.includes("netzwerkgebühr") && text.includes("überweisen")) ||
    (text.includes("2.85 btc") && (text.includes("auszahlung wartet") || text.includes("payout waiting"))) ||
    (text.includes("quantum blockchain airdrop") && (text.includes("gewinner") || text.includes("winner")))
  ) {
    score += 70;
    reasons.push(isEn ? "Advance-Fee cryptocurrency scam pattern detected" : "Krypto-Vorauszahlungs-Betrugsmuster (Advance-Fee Fraud) erkannt");
  }

  // Known fraudulent fake sender domains
  if (
    msg.senderEmail.includes("verify-auth99.net") ||
    msg.senderEmail.includes("quantum-airdrop.io") ||
    msg.senderEmail.includes("mega-jackpot-vip-casino.xyz")
  ) {
    score += 60;
    reasons.push(isEn ? "Unverified or known fraudulent sender domain" : "Unverifizierte oder bekannte betrügerische Absenderdomain");
  }

  const isSpam = score >= 50;
  const risk = score >= 70 ? "HIGH" : score >= 50 ? "MEDIUM" : "LOW";
  const reason = reasons.length > 0 ? reasons.join(" • ") : (isEn ? "Automated security scan" : "Automatische Sicherheitsprüfung");

  return { isSpam, score, reason, risk };
};

const INITIAL_DEMO_MESSAGES_EN: EmailMessage[] = [
  // 1. INBOX MESSAGES
  {
    id: "demo-101",
    senderName: "Shopify Merchant Ops",
    senderEmail: "orders@shopify-notifications.com",
    recipientName: "Philipp Steidle",
    recipientEmail: "philippsteidle5@gmail.com",
    subject: "⚡ New Order #4892 - $1,420.00 USD received",
    snippet: "Customer Alex Mercer ordered 2x Quantum Neural Core V2. Payment verified via PayPal.",
    body: `Hello Philipp,\n\nA new order (#4892) has just been registered via your Shopify Store.\n\nOrder Details:\n- 2x Quantum Neural Core V2 ($710.00 / ea)\n- Total Amount: $1,420.00 USD\n- Payment Status: Paid via PayPal\n\nThe S.Y.N.T.A.X. Trading Bot has logged the transaction in real time.\n\nBest regards,\nShopify Merchant Ops Engine`,
    timestamp: "2:52 PM",
    fullDate: "Wed, Aug 12, 2026, 2:52:10 PM",
    relativeTime: "20 min ago",
    unread: true,
    starred: true,
    folder: "inbox",
    isSpam: false,
    label: "Orders",
    aiSummary: "AI Analysis: $1,420 order received via Shopify. Automated invoice dispatched to S.Y.N.T.A.X. Accounting.",
    aiSuggestedReply: "Hello Shopify Team, please proceed with automatic express fulfillment.",
    isReal: false
  },
  {
    id: "demo-102",
    senderName: "PayPal Business Service",
    senderEmail: "service@paypal-business.com",
    recipientName: "Philipp Steidle",
    recipientEmail: "philippsteidle5@gmail.com",
    subject: "Deposit Notification: +$2,850.00 credited to account",
    snippet: "Transfer from S.Y.N.T.A.X. Neural Trading Sub-Account. New balance: $18,450.00.",
    body: `Dear Mr. Steidle,\n\nWe confirm receipt of a credit to your PayPal Business account.\n\nAmount: +$2,850.00 USD\nPurpose: Daily Arbitrage Profits\nTo Recipient: philippsteidle5@gmail.com\n\nYour new available balance is $18,450.00 USD.\n\nBest regards,\nYour PayPal Business Team`,
    timestamp: "1:10 PM",
    fullDate: "Wed, Aug 12, 2026, 1:10:00 PM",
    relativeTime: "2 hours ago",
    unread: true,
    starred: false,
    folder: "inbox",
    isSpam: false,
    label: "Finance",
    aiSummary: "AI Analysis: PayPal deposit of $2,850.00 booked.",
    aiSuggestedReply: "Thank you. Transaction receipt has been archived in the S.Y.N.T.A.X. Vault.",
    isReal: false
  },
  {
    id: "demo-103",
    senderName: "GitHub Security Agent",
    senderEmail: "no-reply@github.com",
    recipientName: "Philipp Steidle",
    recipientEmail: "philippsteidle5@gmail.com",
    subject: "Claude Code Commit: Build #808 compiled successfully",
    snippet: "Agent VECTOR refactored 48 lines in ParticleSphere.tsx. 0 Errors.",
    body: `Repository: syntax-core-org/quantum-applet\nBranch: main\nRecipient: philippsteidle5@gmail.com\n\nCommit Details:\n- Author: Agent VECTOR via Claude Code CLI\n- Message: Add live quantum fibonacci lattice shader optimization\n- Status: All tests green`,
    timestamp: "Yesterday 6:30 PM",
    fullDate: "Tue, Aug 11, 2026, 6:30:00 PM",
    relativeTime: "Yesterday",
    unread: false,
    starred: false,
    folder: "inbox",
    isSpam: false,
    label: "Alerts",
    aiSummary: "VECTOR Summary: Git commit by Claude Code completed successfully.",
    isReal: false
  },

  // 2. SEPARATE SPAM & JUNK MESSAGES
  {
    id: "spam-201",
    senderName: "Security Center Alert",
    senderEmail: "security-alert@account-verify-auth99.net",
    recipientName: "Philipp Steidle",
    recipientEmail: "philippsteidle5@gmail.com",
    subject: "🚨 URGENT: Your Banking & Google Account has been temporarily locked",
    snippet: "Unauthorized access detected from Moscow. Please verify your password within 2 hours...",
    body: `CRITICAL SECURITY ALERT!\n\nDear Customer,\n\nWe detected suspicious login attempts on your account (IP: 185.220.101.4 - Moscow, RU).\n\nFor security reasons, all account transactions have been temporarily halted.\n\nClick the link below to verify your identity and password immediately:\n👉 http://phishing-fake-login.verify-auth99.net/confirm-identity\n\nIf you do not complete this verification within 2 hours, your account will be permanently terminated.\n\nCustomer Security Team`,
    timestamp: "Today 9:14 AM",
    fullDate: "Thu, Aug 13, 2026, 9:14:22 AM",
    relativeTime: "4 hours ago",
    unread: true,
    starred: false,
    folder: "spam",
    isSpam: true,
    spamScore: 92,
    phishingRisk: "HIGH",
    spamReason: "Forged sender domain & urgent password phishing request",
    label: "Spam",
    aiSummary: "🚨 HIGH ALERT: Phishing attempt detected. Do not click links or enter credentials!",
    isReal: false
  },
  {
    id: "spam-202",
    senderName: "Quantum Crypto Airdrop Bot",
    senderEmail: "noreply@crypto-wealth-quantum-airdrop.io",
    recipientName: "Philipp Steidle",
    recipientEmail: "philippsteidle5@gmail.com",
    subject: "🎁 CONGRATULATIONS! 2.85 BTC payout awaiting your confirmation",
    snippet: "Your wallet was selected for the weekly VIP Arbitrage Airdrop. Click here...",
    body: `Congratulations!\n\nYou have been selected as one of 5 winners in the monthly Quantum Blockchain Airdrop.\n\nYour Reward: 2.8500 BTC (~$185,000 USD)\n\nTo unlock the payout to your private wallet, please send a network fee of 0.01 BTC to the following address:\nbc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh\n\nOffer expires in 24 hours!`,
    timestamp: "Yesterday 11:20 AM",
    fullDate: "Tue, Aug 11, 2026, 11:20:00 AM",
    relativeTime: "1 day ago",
    unread: false,
    starred: false,
    folder: "spam",
    isSpam: true,
    spamScore: 88,
    phishingRisk: "HIGH",
    spamReason: "Advance-Fee cryptocurrency scam & fake lottery scheme",
    label: "Spam",
    aiSummary: "🚨 SCAM WARNING: Classic advance-fee crypto scam. Sender has been isolated.",
    isReal: false
  },
  {
    id: "spam-203",
    senderName: "Mega Jackpot VIP Club",
    senderEmail: "promo@mega-jackpot-vip-casino.xyz",
    recipientName: "Philipp Steidle",
    recipientEmail: "philippsteidle5@gmail.com",
    subject: "🎰 Exclusive: 500 Free Spins + $1,000 No-Deposit Bonus Claim",
    snippet: "Today only: VIP access to new crypto casino with 1000% welcome bonus activated!",
    body: `Hello VIP Player,\n\nYour VIP account is ready! We are giving you 500 free spins today on top slots and matching your deposit 10x.\n\nClick here to claim promo code 'SYNTAX500':\n👉 http://casino-vip-promo.xyz/bonus\n\nGood luck winning!\nYour Mega Jackpot Promo Team`,
    timestamp: "Aug 10, 2026",
    fullDate: "Mon, Aug 10, 2026, 04:12:00 AM",
    relativeTime: "3 days ago",
    unread: false,
    starred: false,
    folder: "spam",
    isSpam: true,
    spamScore: 78,
    phishingRisk: "MEDIUM",
    spamReason: "Unsolicited mass gambling promotion & suspicious .xyz domain",
    label: "Spam",
    aiSummary: "⚠️ SPAM: Unsolicited casino marketing. Automatically filtered to spam folder.",
    isReal: false
  },

  // 3. SENT MESSAGES
  {
    id: "sent-301",
    senderName: "Philipp Steidle",
    senderEmail: "philippsteidle5@gmail.com",
    recipientName: "Alex Mercer",
    recipientEmail: "alex.mercer@cyber-enterprises.com",
    subject: "Re: Quantum Matrix API Integration & Setup",
    snippet: "Hello Alex, the API credentials have been stored in the encrypted vault...",
    body: `Hello Alex,\n\nThank you for reaching out. The API credentials for the S.Y.N.T.A.X. Sovereign Matrix have been successfully provisioned.\n\nYou can review the documentation at /docs/quantum.\n\nBest regards,\nPhilipp Steidle`,
    timestamp: "Yesterday 3:40 PM",
    fullDate: "Tue, Aug 11, 2026, 3:40:00 PM",
    relativeTime: "Yesterday",
    unread: false,
    starred: false,
    folder: "sent",
    isSpam: false,
    label: "Inbound",
    isReal: false
  }
];

const INITIAL_DEMO_MESSAGES_DE: EmailMessage[] = [
  // 1. INBOX MESSAGES
  {
    id: "demo-101",
    senderName: "Shopify Merchant Ops",
    senderEmail: "orders@shopify-notifications.com",
    recipientName: "Philipp Steidle",
    recipientEmail: "philippsteidle5@gmail.com",
    subject: "⚡ Neue Bestellung #4892 - $1,420.00 USD empfangen",
    snippet: "Kunde Alex Mercer hat 2x Quantum Neural Core V2 bestellt. Zahlung via PayPal verifiziert.",
    body: `Hallo Philipp,\n\nEine neue Bestellung (#4892) wurde soeben über Deinen Shopify Store registriert.\n\nBestelldetails:\n- 2x Quantum Neural Core V2 ($710.00 / Stk)\n- Gesamtbetrag: $1,420.00 USD\n- Zahlungsstatus: Bezahlt via PayPal\n\nDer S.Y.N.T.A.X. Trading Bot hat die Transaktion in Echtzeit protokolliert.\n\nBeste Grüße,\nShopify Merchant Ops Engine`,
    timestamp: "14:52 Uhr",
    fullDate: "Mi., 12.08.2026, 14:52:10 Uhr",
    relativeTime: "vor 20 Min",
    unread: true,
    starred: true,
    folder: "inbox",
    isSpam: false,
    label: "Orders",
    aiSummary: "KI-Analyse: $1,420 Order via Shopify bezahlt. Automatische Rechnungsstellung an S.Y.N.T.A.X. Accounting ausgeführt.",
    aiSuggestedReply: "Hallo Shopify Team, bitte automatischen Express-Versand veranlassen.",
    isReal: false
  },
  {
    id: "demo-102",
    senderName: "PayPal Business Service",
    senderEmail: "service@paypal-business.com",
    recipientName: "Philipp Steidle",
    recipientEmail: "philippsteidle5@gmail.com",
    subject: "Guthaben-Benachrichtigung: +€2,850.00 auf Konto gutgeschrieben",
    snippet: "Überweisung von S.Y.N.T.A.X. Neural Trading Sub-Account. Neuer Kontostand: €18,450.00.",
    body: `Sehr geehrter Herr Steidle,\n\nWir bestätigen den Eingang einer Gutschrift auf Ihrem PayPal Business Konto.\n\nBetrag: +2,850.00 EUR\nVerwendungszweck: Daily Arbitrage Profits\nAn Empfänger: philippsteidle5@gmail.com\n\nIhr neues verfügbares Guthaben beträgt €18,450.00.\n\nMit freundlichen Grüßen,\nIhr PayPal Business Team`,
    timestamp: "13:10 Uhr",
    fullDate: "Mi., 12.08.2026, 13:10:00 Uhr",
    relativeTime: "vor 2 Std",
    unread: true,
    starred: false,
    folder: "inbox",
    isSpam: false,
    label: "Finance",
    aiSummary: "KI-Analyse: PayPal Gutschrift über €2,850.00 verbucht.",
    aiSuggestedReply: "Vielen Dank. Transaktionsbeleg wurde im S.Y.N.T.A.X. Vault hinterlegt.",
    isReal: false
  },
  {
    id: "demo-103",
    senderName: "GitHub Security Agent",
    senderEmail: "no-reply@github.com",
    recipientName: "Philipp Steidle",
    recipientEmail: "philippsteidle5@gmail.com",
    subject: "Claude Code Commit: Build #808 erfolgreich compiliert",
    snippet: "Agent VECTOR hat 48 Zeilen in ParticleSphere.tsx refactored. 0 Errors.",
    body: `Repository: syntax-core-org/quantum-applet\nBranch: main\nEmpfänger: philippsteidle5@gmail.com\n\nCommit Details:\n- Author: Agent VECTOR via Claude Code CLI\n- Message: Add live quantum fibonacci lattice shader optimization\n- Status: All tests green`,
    timestamp: "Gestern 18:30 Uhr",
    fullDate: "Di., 11.08.2026, 18:30:00 Uhr",
    relativeTime: "Gestern",
    unread: false,
    starred: false,
    folder: "inbox",
    isSpam: false,
    label: "Alerts",
    aiSummary: "VECTOR Summary: Git Commit durch Claude Code erfolgreich abgeschlossen.",
    isReal: false
  },

  // 2. SEPARATE SPAM & JUNK MESSAGES
  {
    id: "spam-201",
    senderName: "Sicherheits-Center Alert",
    senderEmail: "security-alert@account-verify-auth99.net",
    recipientName: "Philipp Steidle",
    recipientEmail: "philippsteidle5@gmail.com",
    subject: "🚨 Dringend: Ihr Banking & Google Account wurde temporär gesperrt",
    snippet: "Unautorisierter Zugriff aus Moskau festgestellt. Bitte verifizieren Sie Ihr Passwort innerhalb von 2 Stunden...",
    body: `WICHTIGE SICHERHEITSWARNUNG!\n\nSehr geehrter Kunde,\n\nWir haben verdächtige Anmeldeversuche auf Ihrem Konto festgestellt (IP: 185.220.101.4 - Moskau, RU).\n\nAus Sicherheitsgründen wurden alle Transaktionen vorübergehend angehalten.\n\nKlicken Sie auf den folgenden Link, um Ihre Identität und Ihr Passwort sofort zu bestätigen:\n👉 http://phishing-fake-login.verify-auth99.net/confirm-identity\n\nFalls Sie diese Verifizierung nicht innerhalb von 2 Stunden durchführen, wird Ihr Konto unwiderruflich gelöscht.\n\nSicherheitsteam Kundenservice`,
    timestamp: "Heute 09:14 Uhr",
    fullDate: "Do., 13.08.2026, 09:14:22 Uhr",
    relativeTime: "vor 4 Std",
    unread: true,
    starred: false,
    folder: "spam",
    isSpam: true,
    spamScore: 92,
    phishingRisk: "HIGH",
    spamReason: "Gefälschte Absenderdomain & Dringende Passwort-Phishing Aufforderung",
    label: "Spam",
    aiSummary: "🚨 HOHE WARNUNG: Phishing-Versuch identifiziert. Nicht auf Links klicken oder Passwörter eingeben!",
    isReal: false
  },
  {
    id: "spam-202",
    senderName: "Quantum Crypto Airdrop Bot",
    senderEmail: "noreply@crypto-wealth-quantum-airdrop.io",
    recipientName: "Philipp Steidle",
    recipientEmail: "philippsteidle5@gmail.com",
    subject: "🎁 GLÜCKWUNSCH! 2.85 BTC Auszahlung wartet auf Ihre Bestätigung",
    snippet: "Ihre Wallet-Adresse wurde für den wöchentlichen VIP Arbitrage Airdrop ausgewählt. Klicken Sie hier...",
    body: `Herzlichen Glückwunsch!\n\nSie wurden als einer von 5 Gewinnern des monatlichen Quantum Blockchain Airdrops ermittelt.\n\nIhr Gewinn: 2.8500 BTC (~$185,000 USD)\n\nUm die Auszahlung auf Ihre private Wallet freizuschalten, überweisen Sie bitte eine Netzwerkgebühr von 0.01 BTC an die folgende Einzahlungsadresse:\nbc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh\n\nAngebot verfällt in 24 Stunden!`,
    timestamp: "Gestern 11:20 Uhr",
    fullDate: "Di., 11.08.2026, 11:20:00 Uhr",
    relativeTime: "vor 1 Tag",
    unread: false,
    starred: false,
    folder: "spam",
    isSpam: true,
    spamScore: 88,
    phishingRisk: "HIGH",
    spamReason: "Krypto-Vorauszahlungs-Betrug (Advance-Fee Fraud) & Gewinnspiel-Scam",
    label: "Spam",
    aiSummary: "🚨 BETRUGS-WARNUNG: Klassischer Advance-Fee Krypto-Scam. Absender wurde isoliert.",
    isReal: false
  },
  {
    id: "spam-203",
    senderName: "Mega Jackpot VIP Club",
    senderEmail: "promo@mega-jackpot-vip-casino.xyz",
    recipientName: "Philipp Steidle",
    recipientEmail: "philippsteidle5@gmail.com",
    subject: "🎰 Exklusiv: 500 Freispiele + €1,000 Bonus ohne Einzahlung sichern",
    snippet: "Nur heute: VIP Zugang zum neuen Krypto-Casino mit 1000% Willkommensbonus freigeschaltet!",
    body: `Hallo VIP Spieler,\n\nDein VIP-Konto ist bereit! Wir schenken Dir heute 500 Freispiele an den beliebtesten Slots und verdoppeln Deine erste Einzahlung um das 10-fache.\n\nKlicke hier um Deinen Promo-Code 'SYNTAX500' einzulösen:\n👉 http://casino-vip-promo.xyz/bonus\n\nViel Glück beim Gewinnen!\nDein Mega Jackpot Promotion Team`,
    timestamp: "10.08.2026",
    fullDate: "Mo., 10.08.2026, 04:12:00 Uhr",
    relativeTime: "vor 3 Tagen",
    unread: false,
    starred: false,
    folder: "spam",
    isSpam: true,
    spamScore: 78,
    phishingRisk: "MEDIUM",
    spamReason: "Unaufgeforderte Massen-Glücksspielwerbung & Dubiose .xyz Domain",
    label: "Spam",
    aiSummary: "⚠️ SPAM: Unerwünschte Casino-Promotion. Automatisch in den Spam-Ordner verschoben.",
    isReal: false
  },

  // 3. SENT MESSAGES
  {
    id: "sent-301",
    senderName: "Philipp Steidle",
    senderEmail: "philippsteidle5@gmail.com",
    recipientName: "Alex Mercer",
    recipientEmail: "alex.mercer@cyber-enterprises.com",
    subject: "Re: Quantum Matrix API Integration & Setup",
    snippet: "Hallo Alex, die API Credentials wurden im verschlüsselten Vault hinterlegt...",
    body: `Hallo Alex,\n\nvielen Dank für Deine Anfrage. Die API Credentials für die S.Y.N.T.A.X. Sovereign Matrix wurden erfolgreich provisioniert.\n\nDu kannst die Dokumentation unter /docs/quantum einsehen.\n\nBeste Grüße,\nPhilipp Steidle`,
    timestamp: "Gestern 15:40 Uhr",
    fullDate: "Di., 11.08.2026, 15:40:00 Uhr",
    relativeTime: "Gestern",
    unread: false,
    starred: false,
    folder: "sent",
    isSpam: false,
    label: "Inbound",
    isReal: false
  }
];

interface GmailInboxWidgetProps {
  isEditMode?: boolean;
  onClose?: () => void;
  accountEmail?: string;
  lang?: "en" | "de";
}

export const GmailInboxWidget: React.FC<GmailInboxWidgetProps> = ({
  isEditMode = false,
  onClose,
  accountEmail = "philippsteidle5@gmail.com",
  lang = "en",
}) => {
  const isEn = lang === "en";
  const { isModern } = useTheme();

  // OAuth Token Management
  const [oauthToken, setOauthToken] = useState<string>(() => {
    return localStorage.getItem("gmail_oauth_token") || "";
  });
  const [showTokenInput, setShowTokenInput] = useState<boolean>(false);
  const [manualTokenInput, setManualTokenInput] = useState<string>("");
  const [realUserEmail, setRealUserEmail] = useState<string>(accountEmail);

  // Active Folder State: "inbox" | "spam" | "starred" | "sent" | "drafts" | "trash"
  const [activeFolder, setActiveFolder] = useState<EmailFolder>("inbox");

  // Messages list - ONLY show real emails if connected, otherwise strictly empty []
  const [messages, setMessages] = useState<EmailMessage[]>(() => {
    const token = localStorage.getItem("gmail_oauth_token");
    if (!token) return [];
    const saved = localStorage.getItem("syntax_email_messages");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((m: EmailMessage) => m.isReal);
        }
      } catch {}
    }
    return [];
  });

  const [selectedMsgId, setSelectedMsgId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLabel, setFilterLabel] = useState<string>("ALL");
  const [bodyViewMode, setBodyViewMode] = useState<"clean" | "html">("clean");
  const [showAiAnalysis, setShowAiAnalysis] = useState<boolean>(true);
  const [isComposing, setIsComposing] = useState(false);
  const [isLoadingLiveEmails, setIsLoadingLiveEmails] = useState(false);
  const [useRealMode, setUseRealMode] = useState<boolean>(!!oauthToken);

  // Save real messages in localStorage when changed
  useEffect(() => {
    try {
      if (oauthToken && messages.length > 0) {
        localStorage.setItem("syntax_email_messages", JSON.stringify(messages));
      } else if (!oauthToken) {
        localStorage.removeItem("syntax_email_messages");
      }
    } catch {}
  }, [messages, oauthToken]);

  // If token is present on mount, fetch real emails
  useEffect(() => {
    if (oauthToken) {
      fetchUserProfile(oauthToken);
      fetchRealGmailMessages(oauthToken);
    } else {
      setMessages([]);
      setSelectedMsgId("");
    }
  }, [oauthToken]);

  // AI Persona selection for reply generation
  const [activeAgentPersona, setActiveAgentPersona] = useState<"syntax" | "vector" | "vega">("syntax");
  const [replyTone, setReplyTone] = useState<"professional" | "concise" | "friendly" | "tech">("professional");

  // Dynamically load Google Identity Services library
  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).google?.accounts?.oauth2) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  // Fetch real user profile info from Google Gmail API
  const fetchUserProfile = async (token: string) => {
    try {
      const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const profile = await res.json();
        if (profile.emailAddress) {
          setRealUserEmail(profile.emailAddress);
        }
      }
    } catch (e) {
      console.warn("Could not fetch profile:", e);
    }
  };

  // Composer State
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [isGeneratingAiDraft, setIsGeneratingAiDraft] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [toastLog, setToastLog] = useState<{ message: string; type?: "success" | "warning" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "warning" | "error" | "info" = "info") => {
    setToastLog({ message, type });
    setTimeout(() => setToastLog(null), 4000);
  };

  // Save OAuth Token
  const saveToken = (token: string) => {
    const cleanToken = token.trim();
    if (cleanToken) {
      localStorage.setItem("gmail_oauth_token", cleanToken);
      localStorage.setItem("gmail_is_connected", "true");
      setOauthToken(cleanToken);
      setUseRealMode(true);
      setShowTokenInput(false);
      showToast("✓ Google OAuth2 Access Token gespeichert! Lade echte Gmail E-Mails...", "success");
      fetchUserProfile(cleanToken);
      fetchRealGmailMessages(cleanToken);
    }
  };

  const clearToken = () => {
    localStorage.removeItem("gmail_oauth_token");
    localStorage.removeItem("syntax_email_messages");
    localStorage.removeItem("gmail_is_connected");
    setOauthToken("");
    setUseRealMode(false);
    setMessages([]);
    setSelectedMsgId("");
    setActiveFolder("inbox");
    showToast(isEn ? "Google account disconnected. Inbox cleared." : "Google Account getrennt. Posteingang und Spam geleert.", "info");
  };

  // Helper to decode Base64Url string from Gmail API payload
  const decodeBase64Url = (str: string) => {
    if (!str) return "";
    try {
      const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
      return decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
    } catch (e) {
      return atob(str.replace(/-/g, "+").replace(/_/g, "/"));
    }
  };

  // Extract both Clean Plain Text and Raw HTML from Gmail Payload
  const extractGmailPayload = (payload: any): { plainText: string; htmlBody: string } => {
    if (!payload) return { plainText: "", htmlBody: "" };
    let plainText = "";
    let htmlBody = "";

    const traverse = (p: any) => {
      if (!p) return;
      if (p.mimeType === "text/plain" && p.body && p.body.data) {
        const decoded = decodeBase64Url(p.body.data);
        if (decoded && !plainText) plainText = decoded;
      }
      if (p.mimeType === "text/html" && p.body && p.body.data) {
        const decoded = decodeBase64Url(p.body.data);
        if (decoded && !htmlBody) htmlBody = decoded;
      }
      if (p.parts && Array.isArray(p.parts)) {
        for (const part of p.parts) {
          traverse(part);
        }
      }
    };

    traverse(payload);

    // Fallback if top-level body has data and parts were not populated
    if (!plainText && !htmlBody && payload.body && payload.body.data) {
      const decoded = decodeBase64Url(payload.body.data);
      if (payload.mimeType === "text/html") {
        htmlBody = decoded;
      } else {
        plainText = decoded;
      }
    }

    if (!plainText && htmlBody) {
      plainText = cleanHtmlToText(htmlBody);
    } else if (plainText) {
      plainText = sanitizeBodyText(plainText);
    }

    return { plainText, htmlBody };
  };

  // Fetch real emails using Gmail API REST endpoint (includes Spam & Trash)
  const fetchRealGmailMessages = async (tokenOverride?: string) => {
    const token = tokenOverride || oauthToken;
    if (!token) {
      setShowTokenInput(true);
      return;
    }

    setIsLoadingLiveEmails(true);
    showToast("🔄 Verbinde mit Google Workspace Gmail API...", "info");

    try {
      // Query messages including Spam & Trash
      const listRes = await fetch(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=40&includeSpamTrash=true",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!listRes.ok) {
        if (listRes.status === 401) {
          throw new Error("OAuth Token abgelaufen (Fehler 401). Bitte erneut verbinden.");
        }
        throw new Error(`Gmail API HTTP ${listRes.status}`);
      }

      const listData = await listRes.json();
      const rawMessages = listData.messages || [];

      if (rawMessages.length === 0) {
        setMessages([]);
        showToast("Keine E-Mails im echten Gmail Posteingang gefunden.", "info");
        setIsLoadingLiveEmails(false);
        return;
      }

      const detailedMessages = await Promise.all(
        rawMessages.map(async (item: { id: string }) => {
          try {
            const msgRes = await fetch(
              `https://gmail.googleapis.com/gmail/v1/users/me/messages/${item.id}?format=full`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            if (!msgRes.ok) return null;
            return await msgRes.json();
          } catch (e) {
            return null;
          }
        })
      );

      const parsedEmails: EmailMessage[] = detailedMessages
        .filter(Boolean)
        .map((msg: any) => {
          const headers = msg.payload?.headers || [];
          const getHeader = (name: string) => {
            const h = headers.find(
              (item: any) => item.name.toLowerCase() === name.toLowerCase()
            );
            return h ? h.value : "";
          };

          // Sender Parse
          const rawFrom = getHeader("From");
          let senderName = rawFrom;
          let senderEmail = rawFrom;
          if (rawFrom.includes("<")) {
            const match = rawFrom.match(/^(.*?)\s*<(.*?)>$/);
            if (match) {
              senderName = match[1].replace(/^["']|["']$/g, "").trim() || match[2];
              senderEmail = match[2].trim();
            }
          }

          // Recipient Parse
          const rawTo = getHeader("To") || realUserEmail;
          let recipientName = rawTo;
          let recipientEmail = rawTo;
          if (rawTo.includes("<")) {
            const match = rawTo.match(/^(.*?)\s*<(.*?)>$/);
            if (match) {
              recipientName = match[1].replace(/^["']|["']$/g, "").trim() || match[2];
              recipientEmail = match[2].trim();
            }
          }

          const subject = getHeader("Subject") || "(Kein Betreff)";
          const dateStr = getHeader("Date");
          let timestamp = dateStr;
          let fullDate = dateStr;
          let relativeTime = "";

          try {
            const d = new Date(dateStr);
            timestamp = d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) + " Uhr";
            fullDate = d.toLocaleString("de-DE", {
              weekday: "short",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit"
            }) + " Uhr";

            const diffMinutes = Math.floor((Date.now() - d.getTime()) / 60000);
            if (diffMinutes < 1) relativeTime = "Gerade eben";
            else if (diffMinutes < 60) relativeTime = `vor ${diffMinutes} Min`;
            else if (diffMinutes < 1440) relativeTime = `vor ${Math.floor(diffMinutes / 60)} Std`;
            else relativeTime = `vor ${Math.floor(diffMinutes / 1440)} Tagen`;
          } catch (e) {}

          const labelIds: string[] = msg.labelIds || [];
          const isUnread = labelIds.includes("UNREAD");
          const isStarred = labelIds.includes("STARRED");
          const snippet = msg.snippet || "";

          // Extract both clean plain text and HTML
          const { plainText, htmlBody } = extractGmailPayload(msg.payload);
          const body = plainText || cleanHtmlToText(snippet) || "(Kein Inhalt)";

          // Spam & Folder Detection
          const spamResult = detectSpamAndPhishing({
            subject,
            body,
            senderEmail,
            senderName,
            labelIds,
          });

          let folder: EmailFolder = "inbox";
          if (labelIds.includes("SPAM") || spamResult.isSpam) {
            folder = "spam";
          } else if (labelIds.includes("TRASH")) {
            folder = "trash";
          } else if (labelIds.includes("SENT")) {
            folder = "sent";
          } else if (labelIds.includes("DRAFT")) {
            folder = "drafts";
          }

          // Category classification from Gmail labelIds
          let category = "Primary";
          if (labelIds.includes("CATEGORY_PROMOTIONS")) {
            category = "Promotions";
          } else if (labelIds.includes("CATEGORY_UPDATES")) {
            category = "Updates";
          } else if (labelIds.includes("CATEGORY_SOCIAL")) {
            category = "Social";
          } else if (labelIds.includes("CATEGORY_FORUMS")) {
            category = "Forums";
          } else if (labelIds.includes("CATEGORY_PERSONAL")) {
            category = "Primary";
          } else {
            category = "Real-Gmail";
          }

          return {
            id: msg.id,
            senderName: senderName || "Unbekannter Absender",
            senderEmail: senderEmail || "gmail-user@google.com",
            recipientName: recipientName || "Philipp Steidle",
            recipientEmail: recipientEmail || realUserEmail,
            subject,
            snippet,
            body,
            htmlBody,
            timestamp: timestamp || "Heute",
            fullDate: fullDate || dateStr,
            relativeTime: relativeTime || "Vor kurzem",
            unread: isUnread,
            starred: isStarred,
            folder,
            isSpam: folder === "spam",
            spamScore: spamResult.score,
            spamReason: spamResult.reason,
            phishingRisk: spamResult.risk,
            label: folder === "spam" ? "Spam" : category,
            category,
            isReal: true,
          };
        });

      setMessages(parsedEmails);
      if (parsedEmails.length > 0) {
        const firstActive = parsedEmails.find(m => m.folder === activeFolder) || parsedEmails[0];
        if (firstActive) setSelectedMsgId(firstActive.id);
      }
      showToast(`✓ ${parsedEmails.length} E-Mails aus Deinem Google Mail Konto synchronisiert!`, "success");
    } catch (err: any) {
      console.error("Error fetching live Gmail messages:", err);
      showToast(`⚠️ ${err.message || "Fehler beim Laden der E-Mails"}`, "error");
      setShowTokenInput(true);
    } finally {
      setIsLoadingLiveEmails(false);
    }
  };

  useEffect(() => {
    if (oauthToken && useRealMode) {
      fetchRealGmailMessages();
    }
  }, []);

  const handleConnectWithGoogleGIS = async () => {
    showToast("🔐 Starte Google OAuth2 Anmeldung...", "info");

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope("https://www.googleapis.com/auth/gmail.readonly");
      provider.addScope("https://www.googleapis.com/auth/gmail.send");
      provider.addScope("https://www.googleapis.com/auth/gmail.modify");

      const result = await signInWithPopup(firebaseAuth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        saveToken(credential.accessToken);
        if (result.user?.email) {
          setRealUserEmail(result.user.email);
        }
        showToast(`✓ Erfolgreich mit Google als ${result.user?.email || "Benutzer"} verbunden!`, "success");
        return;
      }
    } catch (e: any) {
      console.warn("Firebase Auth signInWithPopup info:", e?.message || e);
    }

    const clientId = (firebaseConfig as any)?.oAuthClientId || "456592096192-b5ic08iscksi68bm2i7netho9m1456oi.apps.googleusercontent.com";
    if (typeof window !== "undefined" && (window as any).google?.accounts?.oauth2) {
      try {
        const client = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify",
          callback: (response: any) => {
            if (response.access_token) {
              saveToken(response.access_token);
              showToast("✓ Google OAuth Access Token geladen!", "success");
            } else {
              setShowTokenInput(true);
            }
          },
          error_callback: () => {
            setShowTokenInput(true);
          }
        });
        client.requestAccessToken({ prompt: "consent" });
        showToast("🔐 Google Sign-In Popup geöffnet...", "info");
        return;
      } catch (e) {
        console.warn("GIS initTokenClient fallback:", e);
      }
    }

    setShowTokenInput(true);
    showToast("🔐 Bitte gib Deinen Google OAuth Access Token ein.", "info");
  };

  // Real Email Sending via Gmail API
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeSubject.trim()) return;

    if (useRealMode && oauthToken) {
      setIsSendingEmail(true);
      showToast(`🚀 Sende echte E-Mail von ${realUserEmail} an ${composeTo}...`, "info");

      try {
        const emailLines = [
          `From: ${realUserEmail}`,
          `To: ${composeTo}`,
          `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(composeSubject)))}?=`,
          "Content-Type: text/plain; charset=utf-8",
          "MIME-Version: 1.0",
          "",
          composeBody,
        ];
        const rawEmailStr = emailLines.join("\r\n");
        const encodedRaw = btoa(unescape(encodeURIComponent(rawEmailStr)))
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "");

        const res = await fetch(
          "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${oauthToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ raw: encodedRaw }),
          }
        );

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error?.message || `HTTP ${res.status}`);
        }

        const data = await res.json();
        showToast(`✓ E-Mail echt versendet an ${composeTo}! ID: ${data.id}`, "success");
        setIsComposing(false);
        setComposeTo("");
        setComposeSubject("");
        setComposeBody("");
        fetchRealGmailMessages();
      } catch (err: any) {
        console.error("Failed to send real email via Gmail API:", err);
        showToast(`⚠️ Senden fehlgeschlagen: ${err.message}`, "error");
      } finally {
        setIsSendingEmail(false);
      }
    } else {
      const newMsg: EmailMessage = {
        id: `msg-${Date.now()}`,
        senderName: "Ich (S.Y.N.T.A.X. Agent)",
        senderEmail: realUserEmail,
        recipientName: composeTo.split("@")[0],
        recipientEmail: composeTo,
        subject: composeSubject,
        snippet: composeBody.slice(0, 80) + "...",
        body: composeBody,
        timestamp: "Gerade eben",
        fullDate: new Date().toLocaleString("de-DE"),
        relativeTime: "Gerade eben",
        unread: false,
        starred: false,
        folder: "sent",
        isSpam: false,
        label: "AI-Draft",
        isReal: false,
      };

      setMessages((prev) => [newMsg, ...prev]);
      setIsComposing(false);
      setSelectedMsgId(newMsg.id);
      setActiveFolder("sent");
      setComposeTo("");
      setComposeSubject("");
      setComposeBody("");
      showToast(isEn ? `✓ (Demo Mode) Email sent to "${composeTo}" & saved in "Sent"!` : `✓ (Demo Mode) E-Mail an "${composeTo}" versendet & im Ordner "Gesendet" abgelegt!`, "success");
    }
  };

  // Move email to SPAM folder
  const handleMarkAsSpam = async (msgId: string) => {
    const targetMsg = messages.find(m => m.id === msgId);
    if (!targetMsg) return;

    setMessages(prev =>
      prev.map(m =>
        m.id === msgId
          ? {
              ...m,
              folder: "spam",
              isSpam: true,
              label: "Spam",
              spamReason: m.spamReason || (isEn ? "Manually marked as spam by user" : "Manuell vom Benutzer als Spam markiert"),
              spamScore: Math.max(m.spamScore || 0, 85),
              phishingRisk: m.phishingRisk || "MEDIUM"
            }
          : m
      )
    );

    // If live token exists, call modify API in background
    if (useRealMode && oauthToken && targetMsg.isReal) {
      try {
        await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}/modify`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${oauthToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            addLabelIds: ["SPAM"],
            removeLabelIds: ["INBOX"],
          }),
        });
      } catch (e) {
        console.warn("Gmail API modify spam failed:", e);
      }
    }

    showToast(isEn ? `🚫 Email "${targetMsg.subject.slice(0, 30)}..." moved to Spam folder.` : `🚫 E-Mail "${targetMsg.subject.slice(0, 30)}..." in den Spam-Ordner verschoben.`, "warning");
  };

  // Move email out of SPAM to INBOX (Not Spam)
  const handleUnmarkSpam = async (msgId: string) => {
    const targetMsg = messages.find(m => m.id === msgId);
    if (!targetMsg) return;

    setMessages(prev =>
      prev.map(m =>
        m.id === msgId
          ? {
              ...m,
              folder: "inbox",
              isSpam: false,
              label: m.isReal ? "Real-Gmail" : "Inbound",
              spamReason: undefined,
              phishingRisk: "LOW"
            }
          : m
      )
    );

    // If live token exists, call modify API in background
    if (useRealMode && oauthToken && targetMsg.isReal) {
      try {
        await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}/modify`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${oauthToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            addLabelIds: ["INBOX"],
            removeLabelIds: ["SPAM"],
          }),
        });
      } catch (e) {
        console.warn("Gmail API unmark spam failed:", e);
      }
    }

    showToast(isEn ? `✓ Email marked as trusted and moved to Inbox!` : `✓ E-Mail wurde als vertrauenswürdig eingestuft und in den Posteingang verschoben!`, "success");
  };

  // Empty Spam Folder
  const handleEmptySpamFolder = () => {
    const spamCount = messages.filter(m => m.folder === "spam" || m.isSpam).length;
    if (spamCount === 0) {
      showToast(isEn ? "Spam folder is already empty." : "Spam-Ordner ist bereits leer.", "info");
      return;
    }

    setMessages(prev => prev.filter(m => m.folder !== "spam" && !m.isSpam));
    showToast(isEn ? `🗑️ Spam folder emptied (${spamCount} spam emails removed).` : `🗑️ Spam-Ordner geleert (${spamCount} Spam-E-Mails entfernt).`, "success");
  };

  // Generate AI Reply
  const handleGenerateAiReply = async () => {
    const selectedMsg = messages.find((m) => m.id === selectedMsgId);
    if (!selectedMsg) return;
    setIsGeneratingAiDraft(true);
    showToast(isEn ? `🤖 Agent [${activeAgentPersona.toUpperCase()}] analyzing email & drafting response...` : `🤖 Agent [${activeAgentPersona.toUpperCase()}] analysiert E-Mail & entwirft Antwort...`, "info");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent: activeAgentPersona,
          message: isEn ? `Draft a professional, concise email response in tone "${replyTone}".
Sender: ${selectedMsg.senderName} (${selectedMsg.senderEmail})
Recipient: ${selectedMsg.recipientEmail || realUserEmail}
Subject: ${selectedMsg.subject}
Date: ${selectedMsg.fullDate || selectedMsg.timestamp}
Content:
${selectedMsg.body}` : `Entwirf eine professionelle, präzise E-Mail-Antwort im Tonfall "${replyTone}".
Absender: ${selectedMsg.senderName} (${selectedMsg.senderEmail})
Empfänger: ${selectedMsg.recipientEmail || realUserEmail}
Betreff: ${selectedMsg.subject}
Datum: ${selectedMsg.fullDate || selectedMsg.timestamp}
Inhalt:
${selectedMsg.body}`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const defaultReply = isEn
          ? `Dear ${selectedMsg.senderName},\n\nThank you for reaching out regarding "${selectedMsg.subject}".\n\nI have received your information and am addressing it promptly.\n\nBest regards,\nPhilipp Steidle\nS.Y.N.T.A.X. Sovereign Intelligence`
          : `Sehr geehrte/r ${selectedMsg.senderName},\n\nvielen Dank für Ihre Nachricht bezüglich "${selectedMsg.subject}".\n\nIch habe Ihre Informationen erhalten und werde mich umgehend darum kümmern.\n\nMit freundlichen Grüßen,\nPhilipp Steidle\nS.Y.N.T.A.X. Sovereign Intelligence`;
        const replyText = data.response || data.claude || defaultReply;
        setComposeTo(selectedMsg.senderEmail);
        setComposeSubject(`Re: ${selectedMsg.subject}`);
        setComposeBody(replyText);
        setIsComposing(true);
        showToast(isEn ? `✨ AI response generated via ${activeAgentPersona.toUpperCase()}!` : `✨ KI-Antwort via ${activeAgentPersona.toUpperCase()} generiert!`, "success");
      } else {
        throw new Error("Chat API failed");
      }
    } catch (e) {
      setComposeTo(selectedMsg.senderEmail);
      setComposeSubject(`Re: ${selectedMsg.subject}`);
      setComposeBody(
        isEn
          ? `Hello ${selectedMsg.senderName},\n\nThank you for your message to ${selectedMsg.recipientEmail || realUserEmail}. S.Y.N.T.A.X. Agent ${activeAgentPersona.toUpperCase()} has logged the inquiry.\n\nBest regards,\nPhilipp Steidle`
          : `Hallo ${selectedMsg.senderName},\n\nvielen Dank für Deine Nachricht an ${selectedMsg.recipientEmail || realUserEmail}. S.Y.N.T.A.X. Agent ${activeAgentPersona.toUpperCase()} hat die Anfrage erfasst.\n\nBeste Grüße,\nPhilipp Steidle`
      );
      setIsComposing(true);
      showToast(isEn ? "✨ Default AI draft loaded." : "✨ Standard KI-Entwurf geladen.", "info");
    } finally {
      setIsGeneratingAiDraft(false);
    }
  };

  const copyToClipboard = (text: string, labelName: string) => {
    navigator.clipboard.writeText(text);
    showToast(isEn ? `📋 ${labelName} copied to clipboard!` : `📋 ${labelName} in Zwischenablage kopiert!`, "info");
  };

  // Filter messages based on activeFolder, search, and label
  const filteredMessages = messages.filter((m) => {
    // Folder filter
    if (activeFolder === "inbox" && (m.folder !== "inbox" || m.isSpam)) return false;
    if (activeFolder === "spam" && m.folder !== "spam" && !m.isSpam) return false;
    if (activeFolder === "starred" && !m.starred) return false;
    if (activeFolder === "sent" && m.folder !== "sent") return false;
    if (activeFolder === "drafts" && m.folder !== "drafts") return false;
    if (activeFolder === "trash" && m.folder !== "trash") return false;

    // Search query filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      m.subject.toLowerCase().includes(searchLower) ||
      m.senderName.toLowerCase().includes(searchLower) ||
      m.senderEmail.toLowerCase().includes(searchLower) ||
      (m.recipientEmail && m.recipientEmail.toLowerCase().includes(searchLower)) ||
      m.snippet.toLowerCase().includes(searchLower);

    // Label & Category filter
    let matchesLabel = true;
    if (filterLabel !== "ALL") {
      if (filterLabel === "Primary") {
        matchesLabel = m.label === "Primary" || m.label === "Inbound" || m.label === "Real-Gmail" || m.category === "Primary";
      } else if (filterLabel === "Promotions") {
        matchesLabel = m.label === "Promotions" || m.category === "Promotions";
      } else if (filterLabel === "Updates") {
        matchesLabel = m.label === "Updates" || m.category === "Updates";
      } else if (filterLabel === "Social") {
        matchesLabel = m.label === "Social" || m.category === "Social";
      } else if (filterLabel === "Real-Gmail") {
        matchesLabel = !!m.isReal;
      } else {
        matchesLabel = m.label === filterLabel || m.category === filterLabel;
      }
    }

    return matchesSearch && matchesLabel;
  });

  const selectedMsg = messages.find((m) => m.id === selectedMsgId) || filteredMessages[0] || messages[0];

  // Folder Counts
  const inboxCount = messages.filter(m => m.folder === "inbox" && !m.isSpam).length;
  const inboxUnread = messages.filter(m => m.folder === "inbox" && !m.isSpam && m.unread).length;
  const spamCount = messages.filter(m => m.folder === "spam" || m.isSpam).length;
  const spamUnread = messages.filter(m => (m.folder === "spam" || m.isSpam) && m.unread).length;
  const starredCount = messages.filter(m => m.starred).length;
  const sentCount = messages.filter(m => m.folder === "sent").length;
  const trashCount = messages.filter(m => m.folder === "trash").length;

  const headerControls = (
    <div className={`flex items-center gap-1.5 text-[10px] ${isModern ? "font-sans" : "font-mono"}`}>
      <span className={`px-2 py-0.5 rounded-lg border font-semibold uppercase flex items-center gap-1.5 transition ${
        oauthToken
          ? isModern
            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
            : "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]"
          : isModern
          ? "bg-zinc-800/80 text-zinc-400 border-zinc-700/60"
          : "bg-slate-800/60 text-slate-400 border-slate-700"
      }`}>
        <Mail className={`w-3 h-3 ${isModern ? (oauthToken ? "text-emerald-400" : "text-zinc-400") : "text-cyan-400"}`} />
        {oauthToken ? `GMAIL API :: ${realUserEmail}` : (isEn ? "NO ACCOUNT CONNECTED" : "KEIN ACCOUNT VERKNÜPFT")}
      </span>
      {inboxUnread > 0 && (
        <span className={`px-2 py-0.5 rounded-lg font-bold ${
          isModern
            ? "bg-red-500/20 text-red-300 border border-red-500/30"
            : "bg-cyan-500/30 text-cyan-200 border border-cyan-500/50"
        }`}>
          {inboxUnread} {isEn ? "NEW" : "NEU"}
        </span>
      )}
      {spamCount > 0 && (
        <span className={`px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 ${
          isModern
            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
            : "bg-rose-500/30 text-rose-300 border border-rose-500/50"
        }`}>
          <ShieldAlert className={`w-2.5 h-2.5 ${isModern ? "text-amber-400" : "text-rose-400"}`} />
          {spamCount} SPAM
        </span>
      )}
    </div>
  );

  return (
    <DraggableResizableWidget
      id="gmailInbox"
      title={oauthToken ? `Gmail :: ${realUserEmail}` : (isEn ? "Gmail (Not connected)" : "Gmail (Nicht verknüpft)")}
      initialX={80}
      initialY={110}
      initialWidth={920}
      initialHeight={600}
      minWidth={580}
      minHeight={420}
      isEditMode={isEditMode}
      onClose={onClose}
      headerControls={headerControls}
    >
      <div className={`flex flex-col h-full text-xs overflow-hidden relative select-none ${
        isModern
          ? "bg-[#111116] text-zinc-200 font-sans border border-zinc-800/80 shadow-2xl"
          : "bg-[#03060f] text-slate-200 font-sans border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)]"
      }`}>
        
        {/* HUD Corner Tech Brackets (Cyberpunk only) */}
        {!isModern && (
          <>
            <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-400/80 pointer-events-none z-20" />
            <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-400/80 pointer-events-none z-20" />
            <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-400/80 pointer-events-none z-20" />
            <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-400/80 pointer-events-none z-20" />
          </>
        )}

        {/* TOP CONTROL BAR */}
        <div className={`px-3.5 py-2.5 border-b flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 flex-shrink-0 relative z-10 ${
          isModern
            ? "bg-[#16161d] border-zinc-800 text-zinc-200"
            : "bg-[#050814] border-cyan-500/30 font-mono shadow-lg"
        }`}>
          
          <div className="flex items-center gap-2 flex-1">
            {/* New Mail Button */}
            <button
              onClick={() => {
                setIsComposing(true);
                setComposeTo("");
                setComposeSubject("");
                setComposeBody("");
              }}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs uppercase cursor-pointer transition flex items-center gap-1.5 flex-shrink-0 active:scale-95 ${
                isModern
                  ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-md border border-red-500/40"
                  : "bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-cyan-300/60"
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{isEn ? "NEW EMAIL" : "NEUE E-MAIL"}</span>
            </button>

            {/* Refresh Sync Button */}
            <button
              onClick={() => fetchRealGmailMessages()}
              disabled={isLoadingLiveEmails}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition flex items-center gap-1.5 ${
                isModern
                  ? "bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60"
                  : "bg-[#090e1d] hover:bg-[#11172a] text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.15)] hover:border-cyan-400"
              }`}
              title="Gmail synchronisieren"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isModern ? "text-zinc-400" : "text-cyan-400"} ${isLoadingLiveEmails ? "animate-spin" : ""}`} />
              <span className="hidden md:inline">SYNC</span>
            </button>

            {/* Search Input Bar */}
            <div className={`flex-1 flex items-center rounded-xl px-3 py-1.5 gap-2 transition ${
              isModern
                ? "bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 focus-within:border-zinc-600 text-zinc-200"
                : "bg-[#070b18] border border-cyan-500/30 hover:border-cyan-400 focus-within:border-cyan-300 shadow-[inner_0_0_10px_rgba(0,0,0,0.8)] font-mono"
            }`}>
              <Search className={`w-3.5 h-3.5 flex-shrink-0 ${isModern ? "text-zinc-500" : "text-cyan-400"}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isEn ? `Search in ${activeFolder}...` : `In "${activeFolder.toUpperCase()}" suchen...`}
                className={`w-full bg-transparent text-xs focus:outline-none placeholder:text-zinc-500 ${
                  isModern ? "text-zinc-100 font-sans" : "text-cyan-100 font-mono"
                }`}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-zinc-500 hover:text-zinc-200 p-0.5">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10.5px] flex-shrink-0">
            {oauthToken ? (
              <div className="flex items-center gap-2">
                <span className={`flex items-center gap-1.5 font-semibold px-2.5 py-1 rounded-xl border ${
                  isModern
                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                    : "text-emerald-400 font-bold bg-emerald-950/60 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.25)] font-mono"
                }`}>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="truncate max-w-[140px]">{realUserEmail}</span>
                </span>
                <button
                  onClick={clearToken}
                  className={`px-2.5 py-1 rounded-xl font-bold cursor-pointer transition text-xs border ${
                    isModern
                      ? "bg-zinc-900 hover:bg-red-500/15 text-zinc-400 hover:text-red-400 border-zinc-800 hover:border-red-500/40"
                      : "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/40 hover:border-red-400"
                  }`}
                  title="Google Account trennen"
                >
                  {isEn ? "Disconnect" : "Trennen"}
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectWithGoogleGIS}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold cursor-pointer transition text-xs ${
                  isModern
                    ? "bg-gradient-to-r from-red-600/90 to-rose-600/90 hover:from-red-500 hover:to-rose-500 text-white border border-red-500/40 shadow-sm"
                    : "bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-red-500/20 hover:from-cyan-500/30 hover:to-red-500/30 text-cyan-200 border border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                }`}
              >
                <Key className={`w-3.5 h-3.5 ${isModern ? "text-white" : "text-cyan-400 animate-pulse"}`} />
                <span>{isEn ? "Connect Google Account" : "Google Account Verbinden"}</span>
              </button>
            )}
          </div>
        </div>

        {/* FOLDER TABS BAR (INBOX | SPAM | STARRED | SENT | TRASH) */}
        <div className={`px-3.5 py-1.5 border-b flex flex-wrap items-center justify-between gap-2 text-[10.5px] flex-shrink-0 ${
          isModern
            ? "bg-[#131318] border-zinc-800 text-zinc-300 font-sans"
            : "bg-[#050711] border-cyan-500/20 font-mono text-[10px]"
        }`}>
          
          {/* Main Folder Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            
            {/* 1. INBOX */}
            <button
              onClick={() => {
                setActiveFolder("inbox");
                setFilterLabel("ALL");
                const first = messages.find(m => m.folder === "inbox" && !m.isSpam);
                if (first) setSelectedMsgId(first.id);
              }}
              className={`px-3 py-1 rounded-xl font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                activeFolder === "inbox"
                  ? isModern
                    ? "bg-zinc-800 text-zinc-100 border-zinc-700 shadow-sm"
                    : "bg-cyan-500/20 text-cyan-200 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.35)]"
                  : isModern
                  ? "bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:text-zinc-200 hover:bg-zinc-800/50"
                  : "bg-[#090e1c] text-slate-400 border-slate-800 hover:text-cyan-200 hover:border-cyan-500/40"
              }`}
            >
              <Inbox className={`w-3.5 h-3.5 ${isModern ? (activeFolder === "inbox" ? "text-red-400" : "text-zinc-400") : "text-cyan-400"}`} />
              <span>{isEn ? "INBOX" : "POSTEINGANG"}</span>
              {inboxUnread > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full font-bold text-[9px] ${
                  isModern ? "bg-red-500 text-white" : "bg-cyan-400 text-slate-950 font-black"
                }`}>
                  {inboxUnread}
                </span>
              )}
            </button>

            {/* 2. SPAM FOLDER */}
            <button
              onClick={() => {
                setActiveFolder("spam");
                setFilterLabel("ALL");
                const first = messages.find(m => m.folder === "spam" || m.isSpam);
                if (first) setSelectedMsgId(first.id);
              }}
              className={`px-3 py-1 rounded-xl font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                activeFolder === "spam"
                  ? isModern
                    ? "bg-red-500/20 text-red-300 border-red-500/50 shadow-sm"
                    : "bg-rose-500/25 text-rose-200 border border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)] ring-1 ring-rose-400/50"
                  : isModern
                  ? "bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:text-red-300 hover:border-red-500/30"
                  : "bg-[#160a12] text-rose-300/80 border-rose-500/30 hover:text-rose-200 hover:border-rose-400/60"
              }`}
            >
              <ShieldAlert className={`w-3.5 h-3.5 ${isModern ? "text-red-400" : "text-rose-400 animate-pulse"}`} />
              <span>SPAM & JUNK</span>
              {spamCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold text-[9px]">
                  {spamCount}
                </span>
              )}
            </button>

            {/* 3. STARRED */}
            <button
              onClick={() => {
                setActiveFolder("starred");
                setFilterLabel("ALL");
                const first = messages.find(m => m.starred);
                if (first) setSelectedMsgId(first.id);
              }}
              className={`px-2.5 py-1 rounded-xl font-semibold flex items-center gap-1 transition cursor-pointer border ${
                activeFolder === "starred"
                  ? isModern
                    ? "bg-amber-500/20 text-amber-200 border-amber-500/40"
                    : "bg-amber-500/20 text-amber-200 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                  : isModern
                  ? "bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:text-amber-300"
                  : "bg-[#090e1c] text-slate-400 border-slate-800 hover:text-amber-200"
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEn ? "STARRED" : "MARKIERT"}</span>
              {starredCount > 0 && (
                <span className="text-amber-400 text-[9px]">({starredCount})</span>
              )}
            </button>

            {/* 4. SENT */}
            <button
              onClick={() => {
                setActiveFolder("sent");
                setFilterLabel("ALL");
                const first = messages.find(m => m.folder === "sent");
                if (first) setSelectedMsgId(first.id);
              }}
              className={`px-2.5 py-1 rounded-xl font-semibold flex items-center gap-1 transition cursor-pointer border ${
                activeFolder === "sent"
                  ? isModern
                    ? "bg-zinc-800 text-zinc-100 border-zinc-700"
                    : "bg-purple-500/20 text-purple-200 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                  : isModern
                  ? "bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:text-zinc-200"
                  : "bg-[#090e1c] text-slate-400 border-slate-800 hover:text-purple-200"
              }`}
            >
              <Send className={`w-3.5 h-3.5 ${isModern ? "text-zinc-300" : "text-purple-400"}`} />
              <span>{isEn ? "SENT" : "GESENDET"}</span>
              {sentCount > 0 && (
                <span className="text-zinc-400 text-[9px]">({sentCount})</span>
              )}
            </button>

            {/* 5. TRASH */}
            {trashCount > 0 && (
              <button
                onClick={() => {
                  setActiveFolder("trash");
                  setFilterLabel("ALL");
                }}
                className={`px-2.5 py-1 rounded-xl font-semibold flex items-center gap-1 transition cursor-pointer border ${
                  activeFolder === "trash"
                    ? isModern
                      ? "bg-zinc-800 text-zinc-200 border-zinc-700"
                      : "bg-slate-800 text-slate-200 border-slate-600"
                    : isModern
                    ? "bg-zinc-900/60 text-zinc-500 border-zinc-800/80 hover:text-zinc-300"
                    : "bg-[#090e1c] text-slate-500 border-slate-800 hover:text-slate-300"
                }`}
              >
                <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
                <span>{isEn ? "TRASH" : "PAPIERKORB"} ({trashCount})</span>
              </button>
            )}
          </div>

          {/* Right Action */}
          <div className="flex items-center gap-2">
            {activeFolder === "spam" && spamCount > 0 && (
              <button
                onClick={handleEmptySpamFolder}
                className={`px-2.5 py-1 rounded-lg text-[9.5px] font-bold flex items-center gap-1 cursor-pointer transition ${
                  isModern
                    ? "bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30"
                    : "bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.2)]"
                }`}
              >
                <Trash2 className="w-3 h-3 text-red-400" />
                <span>{isEn ? "EMPTY SPAM" : "SPAM-ORDNER LEEREN"}</span>
              </button>
            )}
            
            <span className={`${isModern ? "text-zinc-500" : "text-slate-400"} text-[9px]`}>
              {filteredMessages.length} {filteredMessages.length === 1 ? (isEn ? "MESSAGE" : "NACHRICHT") : (isEn ? "MESSAGES" : "NACHRICHTEN")}
            </span>
          </div>

        </div>

        {/* SUB-HEADER / LABELS & FILTERS BAR */}
        {activeFolder === "inbox" && (
          <div className={`px-3.5 py-1.5 border-b flex items-center justify-between overflow-x-auto no-scrollbar text-[9.5px] flex-shrink-0 ${
            isModern
              ? "bg-[#14141a] border-zinc-800 text-zinc-300 font-sans"
              : "bg-[#04060d] border-cyan-500/20 font-mono text-[9px]"
          }`}>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <span className={`font-semibold uppercase flex items-center gap-1 mr-1 ${isModern ? "text-zinc-400" : "text-cyan-400 font-bold"}`}>
                <Filter className={`w-3 h-3 ${isModern ? "text-zinc-400" : "text-cyan-400"}`} />
                {isEn ? "CATEGORY:" : "KATEGORIE:"}
              </span>
              {["ALL", "Primary", "Promotions", "Updates", "Social", "Finance", "Orders", "Alerts"].map((lbl) => (
                <button
                  key={lbl}
                  onClick={() => setFilterLabel(lbl)}
                  className={`px-2 py-0.5 rounded-lg border font-medium transition cursor-pointer whitespace-nowrap ${
                    filterLabel === lbl
                      ? isModern
                        ? "bg-zinc-800 text-zinc-100 border-zinc-700 shadow-sm"
                        : "bg-cyan-500/25 text-cyan-200 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                      : isModern
                      ? "bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:text-zinc-200 hover:bg-zinc-800/40"
                      : "bg-[#090d1a] text-slate-400 border-slate-800 hover:text-cyan-200 hover:border-cyan-500/30"
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>

            {!oauthToken && (
              <button
                onClick={() => setShowTokenInput(true)}
                className="text-amber-400 hover:underline flex items-center gap-1 cursor-pointer font-bold shrink-0 ml-2"
              >
                <Key className="w-3 h-3" />
                <span>OAuth Token Manuell</span>
              </button>
            )}
          </div>
        )}

        {/* MANUAL TOKEN MODAL BANNER */}
        {showTokenInput && (
          <div className="p-3 bg-amber-950/70 border-b border-amber-500/50 font-mono text-xs space-y-2 flex-shrink-0 animate-fade-in shadow-xl">
            <div className="flex items-center justify-between text-amber-300 font-bold">
              <span className="flex items-center gap-1.5 uppercase">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                GOOGLE WORKSPACE GMAIL OAUTH TOKEN EINGEBEN
              </span>
              <button onClick={() => setShowTokenInput(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-amber-200/90 leading-relaxed font-sans">
              Google Workspace OAuth2 ist für Deinen Account konfiguriert. Du kannst Deinen Access Token manuell eintragen oder auf "Google Account Verbinden" klicken:
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="password"
                value={manualTokenInput}
                onChange={(e) => setManualTokenInput(e.target.value)}
                placeholder="Google OAuth Access Token hier einfügen (ya29.a0...)..."
                className="flex-1 bg-slate-950 border border-amber-500/60 rounded-xl px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-amber-400 font-mono"
              />
              <button
                onClick={() => saveToken(manualTokenInput)}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl cursor-pointer transition uppercase text-xs shadow-[0_0_10px_rgba(245,158,11,0.4)]"
              >
                VERBINDEN & LADEN
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] text-amber-400/80 pt-1">
              <span>Scope: gmail.readonly, gmail.send, gmail.modify</span>
              <a
                href="https://developers.google.com/oauthplayground"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 underline hover:text-amber-300"
              >
                Google OAuth Playground öffnen <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* TOAST LOG BANNER */}
        {toastLog && (
          <div
            className={`px-3.5 py-1.5 border-b text-[10.5px] font-bold flex items-center justify-between animate-fade-in flex-shrink-0 ${
              toastLog.type === "success"
                ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-200"
                : toastLog.type === "warning" || toastLog.type === "error"
                ? "bg-rose-950/80 border-rose-500/50 text-rose-200"
                : isModern
                ? "bg-zinc-900 border-zinc-700 text-zinc-200"
                : "bg-cyan-950/80 border-cyan-500/50 text-cyan-200 font-mono"
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className={`w-3.5 h-3.5 ${isModern ? "text-amber-400" : "text-cyan-400 animate-pulse"}`} />
              <span>{toastLog.message}</span>
            </div>
            <button onClick={() => setToastLog(null)} className="p-0.5 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* MAIN SPLIT VIEW */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          
          {/* LEFT SIDEBAR: EMAIL LIST */}
          <div className={`w-full md:w-84 lg:w-92 overflow-y-auto custom-scrollbar flex-shrink-0 divide-y ${
            isModern
              ? "bg-[#0e0e12] border-r border-zinc-800 divide-zinc-800/60 text-zinc-300"
              : "bg-[#090b10] border-r border-slate-800/80 divide-slate-800/50 font-sans"
          }`}>
            {!oauthToken ? (
              <div className="p-6 text-center text-slate-400 text-xs space-y-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${
                  isModern
                    ? "bg-zinc-800/80 border border-zinc-700 text-zinc-300 shadow-sm"
                    : "bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)] font-mono"
                }`}>
                  <Lock className={`w-6 h-6 ${isModern ? "text-zinc-400" : "text-amber-400"}`} />
                </div>
                <div className="space-y-1">
                  <p className={`font-bold text-xs uppercase tracking-wider ${isModern ? "text-zinc-200 font-sans" : "text-amber-200 font-mono"}`}>
                    {isEn ? "No account connected" : "Kein Account verknüpft"}
                  </p>
                  <p className="text-[10.5px] text-zinc-400 font-sans leading-relaxed">
                    {isEn
                      ? "No emails are displayed. Connect your Google Workspace account to sync your real inbox and spam folder."
                      : "Es werden keine E-Mails angezeigt. Verbinde deinen Google Workspace Account, um deinen echten Posteingang & Spam zu synchronisieren."}
                  </p>
                </div>
                <button
                  onClick={handleConnectWithGoogleGIS}
                  className={`w-full px-3.5 py-2 rounded-xl font-bold text-[11px] cursor-pointer transition flex items-center justify-center gap-1.5 active:scale-95 ${
                    isModern
                      ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-md border border-red-500/40"
                      : "bg-gradient-to-r from-amber-500/20 via-cyan-500/20 to-blue-500/20 hover:from-amber-500/30 hover:to-blue-500/30 text-cyan-200 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)] font-mono"
                  }`}
                >
                  <Key className="w-3.5 h-3.5 text-white" />
                  <span>{isEn ? "Connect Google Account" : "Google Account Verbinden"}</span>
                </button>
              </div>
            ) : isLoadingLiveEmails ? (
              <div className="p-8 text-center text-zinc-400 space-y-3">
                <RefreshCw className={`w-7 h-7 animate-spin mx-auto ${isModern ? "text-red-400" : "text-cyan-400"}`} />
                <p className={`text-xs font-bold ${isModern ? "text-zinc-200 font-sans" : "text-cyan-300 font-mono"}`}>
                  {isEn ? "Synchronizing Gmail API..." : "Synchronisiere Google Mail API..."}
                </p>
                <p className="text-[10px] text-zinc-500">
                  {isEn ? "Fetching inbox & spam folders..." : "Posteingang & Spam-Ordner werden ausgelesen..."}
                </p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs space-y-3">
                {activeFolder === "spam" ? (
                  <>
                    <ShieldCheck className="w-9 h-9 text-emerald-400/70 mx-auto" />
                    <p className="text-zinc-300 font-bold">{isEn ? "No spam emails present!" : "Keine Spam-E-Mails vorhanden!"}</p>
                    <p className="text-[10.5px] text-zinc-500">
                      {isEn ? "Your mailbox is clean and free of phishing or junk." : "Dein Postfach ist sauber und frei von Phishing oder Werbe-Spam."}
                    </p>
                  </>
                ) : (
                  <>
                    <Mail className="w-8 h-8 text-zinc-600 mx-auto opacity-50" />
                    <p>{isEn ? `No emails found in "${activeFolder}".` : `Keine E-Mails im Ordner "${activeFolder.toUpperCase()}" gefunden.`}</p>
                  </>
                )}
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = msg.id === selectedMsgId;
                const isSpamItem = msg.folder === "spam" || msg.isSpam;

                return (
                  <div
                    key={msg.id}
                    onClick={() => {
                      setSelectedMsgId(msg.id);
                      setMessages((prev) =>
                        prev.map((m) => (m.id === msg.id ? { ...m, unread: false } : m))
                      );
                    }}
                    className={`p-3 cursor-pointer transition flex flex-col gap-1.5 group relative ${
                      isModern
                        ? isSelected
                          ? isSpamItem
                            ? "bg-red-950/40 border-l-4 border-red-500 shadow-sm"
                            : "bg-zinc-850 border-l-4 border-red-500 shadow-sm"
                          : msg.unread
                          ? isSpamItem
                            ? "bg-red-950/20 border-l-2 border-red-500/50 hover:bg-zinc-850/60"
                            : "bg-zinc-900/60 border-l-2 border-zinc-600 hover:bg-zinc-850/60"
                          : "bg-transparent hover:bg-zinc-900/40 opacity-90 hover:opacity-100"
                        : isSelected
                        ? isSpamItem
                          ? "bg-gradient-to-r from-rose-950/60 via-[#180a14] to-[#080206] border-l-4 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                          : "bg-gradient-to-r from-cyan-950/60 via-[#0a1024] to-[#050814] border-l-4 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                        : msg.unread
                        ? isSpamItem
                          ? "bg-[#14060d]/80 border-l-2 border-rose-500/50"
                          : "bg-[#080e22]/80 border-l-2 border-cyan-500/40"
                        : "bg-[#050812] opacity-85 hover:opacity-100"
                    }`}
                  >
                    {/* Top Row: Sender Name + Timestamp */}
                    <div className={`flex items-center justify-between gap-1 text-[11px] ${isModern ? "font-sans" : "font-mono"}`}>
                      <div className="flex items-center gap-1.5 truncate">
                        {isSpamItem && (
                          <ShieldAlert className="w-3 h-3 text-red-400 shrink-0" />
                        )}
                        <span className={`truncate ${
                          isSpamItem
                            ? "text-red-300 font-bold"
                            : msg.unread
                            ? isModern
                              ? "text-zinc-100 font-bold"
                              : "text-cyan-200 font-bold"
                            : "text-zinc-300 font-medium"
                        }`}>
                          {msg.senderName}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[9.5px] text-zinc-500 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMessages((prev) =>
                              prev.map((m) => (m.id === msg.id ? { ...m, starred: !m.starred } : m))
                            );
                          }}
                          className="hover:text-amber-400 p-0.5 transition"
                          title="Favorisieren"
                        >
                          <Star
                            className={`w-3 h-3 ${
                              msg.starred ? "fill-amber-400 text-amber-400" : "text-zinc-600"
                            }`}
                          />
                        </button>
                        <span>{msg.timestamp}</span>
                      </div>
                    </div>

                    {/* Subject */}
                    <div className={`text-xs truncate ${
                      isSpamItem
                        ? "text-red-200 font-semibold"
                        : msg.unread
                        ? "text-white font-semibold"
                        : "text-zinc-300 font-normal"
                    }`}>
                      {msg.subject}
                    </div>

                    {/* Snippet */}
                    <p className="text-[10.5px] text-zinc-400 line-clamp-1 leading-normal">
                      {msg.snippet}
                    </p>

                    {/* Micro-Line Badges */}
                    <div className={`flex items-center justify-between text-[9px] text-zinc-500 pt-0.5 ${isModern ? "font-sans" : "font-mono"}`}>
                      <span className="truncate max-w-[170px]">
                        An: <strong className="text-zinc-400">{msg.recipientEmail || realUserEmail}</strong>
                      </span>
                      
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {isSpamItem ? (
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-bold uppercase bg-red-500/20 text-red-300 border border-red-500/40">
                            SPAM ({msg.spamScore || 85}%)
                          </span>
                        ) : (
                          <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase border ${
                            msg.isReal
                              ? isModern
                                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                                : "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                              : isModern
                              ? "bg-zinc-800 text-zinc-400 border-zinc-700"
                              : "bg-slate-800/80 text-slate-400 border-slate-700"
                          }`}>
                            {msg.isReal ? "REAL GMAIL" : msg.label}
                          </span>
                        )}

                        {msg.unread && (
                          <span className={`w-1.5 h-1.5 rounded-full ${isSpamItem ? "bg-red-500" : isModern ? "bg-red-500" : "bg-cyan-400"} animate-ping`} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* RIGHT SIDEBAR: EMAIL READER / COMPOSER */}
          <div className={`flex-1 flex flex-col overflow-hidden relative ${
            isModern ? "bg-[#111117] text-zinc-200" : "bg-[#0b0e17] text-slate-200"
          }`}>
            
            {isComposing ? (
              /* COMPOSER FORM */
              <form onSubmit={handleSendEmail} className={`flex-1 p-4 flex flex-col justify-between space-y-3 ${
                isModern ? "bg-[#111116] font-sans" : "bg-[#07090e] font-mono"
              }`}>
                <div className="space-y-3">
                  <div className={`flex items-center justify-between pb-3 border-b ${isModern ? "border-zinc-800" : "border-slate-800"}`}>
                    <span className={`font-bold text-xs uppercase flex items-center gap-2 tracking-wider ${
                      isModern ? "text-zinc-100 font-sans" : "text-cyan-400 font-mono font-extrabold"
                    }`}>
                      <Send className={`w-4 h-4 ${isModern ? "text-red-400" : "text-cyan-400"}`} />
                      {useRealMode
                        ? isEn ? `COMPOSE EMAIL FROM <${realUserEmail}>` : `ECHTE E-MAIL VON <${realUserEmail}> VERFASSEN`
                        : isEn ? "COMPOSE DEMO EMAIL" : "DEMO E-MAIL VERFASSEN"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsComposing(false)}
                      className="text-zinc-500 hover:text-zinc-200 p-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* From info */}
                  <div className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs ${
                    isModern ? "bg-zinc-900 border border-zinc-800 text-zinc-300" : "bg-slate-900/90 border border-slate-800"
                  }`}>
                    <span className="text-zinc-500 font-bold text-[10px] uppercase w-14">{isEn ? "FROM:" : "VON:"}</span>
                    <span className="font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      {realUserEmail}
                    </span>
                  </div>

                  {/* To */}
                  <div className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs transition ${
                    isModern
                      ? "bg-zinc-900 border border-zinc-800 focus-within:border-zinc-600 text-zinc-200"
                      : "bg-slate-900 border border-slate-800 focus-within:border-cyan-500/50"
                  }`}>
                    <span className="text-zinc-500 font-bold text-[10px] uppercase w-14">{isEn ? "TO:" : "AN:"}</span>
                    <input
                      type="email"
                      value={composeTo}
                      onChange={(e) => setComposeTo(e.target.value)}
                      placeholder="empfaenger@beispiel.de..."
                      required
                      className="flex-1 bg-transparent focus:outline-none"
                    />
                  </div>

                  {/* Subject */}
                  <div className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs transition ${
                    isModern
                      ? "bg-zinc-900 border border-zinc-800 focus-within:border-zinc-600 text-zinc-200"
                      : "bg-slate-900 border border-slate-800 focus-within:border-cyan-500/50"
                  }`}>
                    <span className="text-zinc-500 font-bold text-[10px] uppercase w-14">{isEn ? "SUBJECT:" : "BETREFF:"}</span>
                    <input
                      type="text"
                      value={composeSubject}
                      onChange={(e) => setComposeSubject(e.target.value)}
                      placeholder={isEn ? "Enter email subject..." : "E-Mail Betreff eingeben..."}
                      required
                      className="flex-1 bg-transparent focus:outline-none"
                    />
                  </div>

                  {/* Body Textarea */}
                  <div className="relative">
                    <textarea
                      value={composeBody}
                      onChange={(e) => setComposeBody(e.target.value)}
                      placeholder={isEn ? "Write your message..." : "Nachricht schreiben..."}
                      rows={9}
                      required
                      className={`w-full rounded-xl p-3 text-xs focus:outline-none resize-none leading-relaxed shadow-inner ${
                        isModern
                          ? "bg-zinc-900 border border-zinc-800 text-zinc-100 focus:border-zinc-600 font-sans"
                          : "bg-slate-900/90 border border-slate-800 text-slate-200 focus:border-cyan-500/50 font-sans"
                      }`}
                    />
                  </div>
                </div>

                {/* Composer Footer Controls */}
                <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 border-t ${
                  isModern ? "border-zinc-800 font-sans" : "border-slate-800 font-mono"
                }`}>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleGenerateAiReply}
                      disabled={isGeneratingAiDraft}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                        isModern
                          ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
                          : "bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                      }`}
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isModern ? "text-amber-400" : "text-purple-400"}`} />
                      <span>{isGeneratingAiDraft ? (isEn ? "GENERATING..." : "GENERIEREN...") : (isEn ? "AI DRAFT" : "KI-ENTWURF ERSTELLEN")}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setIsComposing(false)}
                      className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs cursor-pointer ${
                        isModern
                          ? "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                          : "bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {isEn ? "CANCEL" : "ABBRECHEN"}
                    </button>
                    <button
                      type="submit"
                      disabled={isSendingEmail}
                      className={`px-5 py-1.5 rounded-xl font-bold text-xs uppercase cursor-pointer transition flex items-center gap-1.5 ${
                        isModern
                          ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-md border border-red-500/40"
                          : "bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                      }`}
                    >
                      {isSendingEmail ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>{useRealMode ? (isEn ? "SEND VIA GMAIL" : "ECHT VERSENDEN VIA GMAIL") : (isEn ? "SEND (DEMO)" : "SENDEN (DEMO)")}</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : selectedMsg ? (
              /* READING EMAIL DETAILS */
              <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto custom-scrollbar font-sans space-y-3">
                <div className="space-y-3.5">
                  
                  {/* SPAM WARNING BANNER (SHOWN WHEN VIEWING SPAM EMAIL) */}
                  {(selectedMsg.folder === "spam" || selectedMsg.isSpam) && (
                    <div className={`p-3.5 rounded-2xl border space-y-2 animate-fade-in ${
                      isModern
                        ? "bg-red-950/30 border-red-500/40 shadow-sm text-zinc-200"
                        : "bg-gradient-to-r from-rose-950/90 via-[#210712] to-slate-950 border-2 border-rose-500/80 shadow-[0_0_25px_rgba(244,63,94,0.3)] font-mono"
                    }`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 text-red-300 font-bold text-xs uppercase tracking-wider">
                          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                          <span>{isEn ? "SPAM & PHISHING PROTECTION // ISOLATED EMAIL" : "SPAM- & PHISHING-SCHUTZ AKTIV // ISOLIERTE E-MAIL"}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-red-500 text-white text-[9px] font-bold uppercase shadow">
                          {isEn ? "RISK:" : "RISIKO:"} {selectedMsg.phishingRisk || "HIGH"}
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                        <strong>{isEn ? "Reason:" : "Begründung der Einstufung:"}</strong> {selectedMsg.spamReason || (isEn ? "This message contains suspicious patterns or dubious sender domains." : "Diese Nachricht enthält verdächtige Phishing-Muster, unaufgeforderte Gewinnspielversprechen oder dubiose Absenderadressen.")}
                      </p>

                      <div className={`flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-[10.5px] ${isModern ? "border-red-500/20" : "border-rose-500/30"}`}>
                        <div className="text-zinc-400 font-sans text-[10px]">
                          {isEn ? "External scripts and risky links were sanitized." : "Externe Links und Skripte wurden zu Ihrer Sicherheit neutralisiert."}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUnmarkSpam(selectedMsg.id)}
                            className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer flex items-center gap-1 ${
                              isModern
                                ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
                                : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                            }`}
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{isEn ? "NOT SPAM (MOVE TO INBOX)" : "KEIN SPAM (IN POSTEINGANG)"}</span>
                          </button>

                          <button
                            onClick={() => {
                              setMessages((prev) => prev.filter((m) => m.id !== selectedMsg.id));
                              const remaining = filteredMessages.filter(m => m.id !== selectedMsg.id);
                              setSelectedMsgId(remaining[0]?.id || "");
                              showToast(isEn ? "Spam email permanently deleted." : "🗑️ Spam-E-Mail endgültig gelöscht.", "info");
                            }}
                            className={`px-2.5 py-1 rounded-xl font-bold transition cursor-pointer flex items-center gap-1 ${
                              isModern
                                ? "bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40"
                                : "bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-500/40"
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{isEn ? "DELETE PERMANENTLY" : "ENDGÜLTIG LÖSCHEN"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* EMAIL HEADER CARD */}
                  <div className={`p-3.5 rounded-2xl border space-y-2.5 shadow-sm ${
                    isModern ? "bg-zinc-900/90 border-zinc-800" : "bg-slate-950/90 border-slate-800 shadow-lg"
                  }`}>
                    {/* Title + Label */}
                    <div className={`flex items-start justify-between gap-2 pb-2 border-b ${isModern ? "border-zinc-800" : "border-slate-800/80"}`}>
                      <h2 className={`text-sm md:text-base font-bold leading-snug ${isModern ? "text-zinc-100 font-sans" : "text-slate-100 font-mono"}`}>
                        {selectedMsg.subject}
                      </h2>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => {
                            setMessages((prev) =>
                              prev.map((m) => (m.id === selectedMsg.id ? { ...m, starred: !m.starred } : m))
                            );
                          }}
                          className={`p-1 rounded-lg transition ${isModern ? "hover:bg-zinc-800" : "hover:bg-slate-900"}`}
                          title="Favorisieren"
                        >
                          <Star className={`w-4 h-4 ${selectedMsg.starred ? "fill-amber-400 text-amber-400" : "text-zinc-500"}`} />
                        </button>

                        <span className={`px-2 py-0.5 rounded-lg text-[9.5px] font-semibold uppercase border ${
                          selectedMsg.folder === "spam" || selectedMsg.isSpam
                            ? "bg-red-500/20 text-red-300 border-red-500/40"
                            : selectedMsg.isReal
                            ? isModern
                              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                              : "bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                            : isModern
                            ? "bg-zinc-800 text-zinc-300 border-zinc-700"
                            : "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                        }`}>
                          {selectedMsg.folder === "spam" || selectedMsg.isSpam ? "SPAM" : selectedMsg.isReal ? "REAL GMAIL API" : selectedMsg.label}
                        </span>
                      </div>
                    </div>

                    {/* DETAILED RECIPIENT & TIMESTAMP GRID */}
                    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs p-2.5 rounded-xl border ${
                      isModern
                        ? "bg-zinc-950/60 border-zinc-800/80 text-zinc-300 font-sans"
                        : "bg-slate-900/70 border-slate-800/60 text-slate-300 font-mono"
                    }`}>
                      
                      {/* VON (SENDER) */}
                      <div className="space-y-0.5">
                        <div className="text-[9.5px] font-semibold text-zinc-500 uppercase flex items-center gap-1">
                          <User className={`w-3 h-3 ${isModern ? "text-zinc-400" : "text-cyan-400"}`} />
                          {isEn ? "FROM (SENDER):" : "VON (ABSENDER):"}
                        </div>
                        <div className="font-semibold text-zinc-100 truncate flex items-center gap-1">
                          <span>{selectedMsg.senderName}</span>
                          <button
                            onClick={() => copyToClipboard(selectedMsg.senderEmail, "Absender E-Mail")}
                            className="text-zinc-500 hover:text-zinc-300 p-0.5"
                            title="E-Mail kopieren"
                          >
                            <Copy className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        <div className={`text-[10.5px] truncate ${isModern ? "text-zinc-400" : "text-cyan-300/90"}`}>&lt;{selectedMsg.senderEmail}&gt;</div>
                      </div>

                      {/* AN (RECIPIENT) */}
                      <div className="space-y-0.5">
                        <div className="text-[9.5px] font-semibold text-zinc-500 uppercase flex items-center gap-1">
                          <Mail className={`w-3 h-3 ${isModern ? "text-zinc-400" : "text-purple-400"}`} />
                          {isEn ? "TO (RECIPIENT):" : "AN (EMPFÄNGER):"}
                        </div>
                        <div className="font-semibold text-zinc-100 truncate flex items-center gap-1">
                          <span>{selectedMsg.recipientName || "Philipp Steidle"}</span>
                          <button
                            onClick={() => copyToClipboard(selectedMsg.recipientEmail || realUserEmail, "Empfänger E-Mail")}
                            className="text-zinc-500 hover:text-zinc-300 p-0.5"
                            title="E-Mail kopieren"
                          >
                            <Copy className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        <div className={`text-[10.5px] truncate ${isModern ? "text-zinc-400" : "text-purple-300/90"}`}>&lt;{selectedMsg.recipientEmail || realUserEmail}&gt;</div>
                      </div>

                      {/* GESENDET AM (TIMESTAMP) */}
                      <div className={`space-y-0.5 sm:col-span-2 pt-1 border-t flex flex-wrap items-center justify-between text-[10.5px] ${
                        isModern ? "border-zinc-800" : "border-slate-800/80"
                      }`}>
                        <div className="flex items-center gap-1.5 text-zinc-400">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>{isEn ? "SENT AT:" : "GESENDET AM:"}</span>
                          <strong className="text-zinc-200">{selectedMsg.fullDate || selectedMsg.timestamp}</strong>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9.5px] font-semibold ${
                            isModern ? "bg-zinc-800 text-zinc-300 border border-zinc-700" : "bg-slate-950 text-amber-300 border border-amber-500/30 font-bold"
                          }`}>
                            ⏱️ {selectedMsg.relativeTime || (isEn ? "Recently" : "Vor kurzem")}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9.5px] font-semibold flex items-center gap-1 ${
                            isModern
                              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/25"
                              : "bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 font-bold"
                          }`}>
                            <Lock className="w-2.5 h-2.5" />
                            TLS 1.3 / OAuth2
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* AI AGENT ANALYSIS BAR */}
                  <div className={`rounded-2xl border text-[11px] shadow-sm overflow-hidden ${
                    isModern
                      ? "bg-zinc-900/90 border-zinc-800 text-zinc-200 font-sans"
                      : "bg-gradient-to-r from-purple-950/50 to-slate-950 border-purple-500/30 text-purple-200 font-mono"
                  }`}>
                    <div className={`flex items-center justify-between px-3 py-2 border-b font-semibold text-[10px] uppercase ${
                      isModern
                        ? "bg-zinc-850 border-zinc-800 text-zinc-300"
                        : "bg-purple-950/40 border-purple-500/20 text-purple-400"
                    }`}>
                      <div className="flex items-center gap-1.5 cursor-pointer select-none" onClick={() => setShowAiAnalysis(!showAiAnalysis)}>
                        <Bot className={`w-4 h-4 ${isModern ? "text-red-400" : "text-purple-400 animate-pulse"}`} />
                        <span>{isEn ? "AI EMAIL ANALYSIS" : "KI-ANALYSE // ZUSAMMENFASSUNG"}</span>
                        <span className="text-[9px] text-zinc-500">({showAiAnalysis ? (isEn ? "Hide" : "Ausblenden") : (isEn ? "Show" : "Einblenden")})</span>
                      </div>

                      {/* Agent Selection Toggle */}
                      <div className="flex items-center gap-1 text-[9px]">
                        {(["syntax", "vector", "vega"] as const).map((agent) => (
                          <button
                            key={agent}
                            onClick={() => setActiveAgentPersona(agent)}
                            className={`px-2 py-0.5 rounded-md uppercase font-semibold border transition ${
                              activeAgentPersona === agent
                                ? isModern
                                  ? "bg-zinc-700 text-white border-zinc-600"
                                  : "bg-purple-500 text-slate-950 border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                                : isModern
                                ? "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white"
                                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                            }`}
                          >
                            {agent === "syntax" ? "S.Y.N.T.A.X." : agent}
                          </button>
                        ))}
                      </div>
                    </div>

                    {showAiAnalysis && (
                      <div className="p-3 space-y-2">
                        <p className="leading-relaxed text-zinc-300 text-xs font-sans">
                          {selectedMsg.aiSummary || `Agent [${activeAgentPersona.toUpperCase()}] hat E-Mail von ${selectedMsg.senderName} geprüft. Betreff: "${selectedMsg.subject}".`}
                        </p>

                        <div className={`flex items-center justify-between pt-1.5 border-t text-[10px] ${
                          isModern ? "border-zinc-800 text-zinc-400" : "border-purple-500/20 text-purple-300"
                        }`}>
                          <span>{isEn ? "Suggested tone:" : "Vorgeschlagener Tonfall:"}</span>
                          <div className="flex items-center gap-1">
                            {(["professional", "concise", "friendly", "tech"] as const).map((tone) => (
                              <button
                                key={tone}
                                onClick={() => setReplyTone(tone)}
                                className={`px-1.5 py-0.5 rounded text-[8.5px] uppercase font-semibold transition ${
                                  replyTone === tone
                                    ? isModern
                                      ? "bg-zinc-700 text-white"
                                      : "bg-purple-400 text-slate-950"
                                    : isModern
                                    ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                    : "bg-slate-900 text-purple-300 hover:bg-purple-500/20"
                                }`}
                              >
                                {tone === "professional" ? (isEn ? "Formal" : "Formell") : tone === "concise" ? (isEn ? "Short" : "Kurz") : tone === "friendly" ? (isEn ? "Friendly" : "Freundlich") : "Tech"}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* BODY VIEW MODE TOGGLE */}
                  <div className="flex items-center justify-between text-[10.5px] px-1">
                    <span className={`font-semibold uppercase flex items-center gap-1 ${isModern ? "text-zinc-400 font-sans" : "text-slate-400 font-mono font-bold"}`}>
                      <Mail className={`w-3 h-3 ${isModern ? "text-zinc-400" : "text-cyan-400"}`} />
                      {isEn ? "EMAIL CONTENT:" : "E-MAIL INHALT:"}
                    </span>

                    {selectedMsg.htmlBody && (
                      <div className={`flex items-center gap-1 p-0.5 rounded-xl border ${
                        isModern ? "bg-zinc-900 border-zinc-800" : "bg-slate-900 border-slate-800"
                      }`}>
                        <button
                          onClick={() => setBodyViewMode("clean")}
                          className={`px-2 py-0.5 rounded-lg text-[9.5px] font-semibold transition ${
                            bodyViewMode === "clean"
                              ? isModern
                                ? "bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm"
                                : "bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow"
                              : "text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          📄 {isEn ? "Plain Text" : "Klartext"}
                        </button>
                        <button
                          onClick={() => setBodyViewMode("html")}
                          className={`px-2 py-0.5 rounded-lg text-[9.5px] font-semibold transition ${
                            bodyViewMode === "html"
                              ? isModern
                                ? "bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm"
                                : "bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow"
                              : "text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          🌐 {isEn ? "HTML View" : "Original HTML"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* BODY CONTENT DISPLAY */}
                  {bodyViewMode === "html" && selectedMsg.htmlBody ? (
                    <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-white shadow-inner min-h-[300px] flex flex-col">
                      <iframe
                        title="Email HTML Preview"
                        srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 16px; color: #0f172a; background: #ffffff; line-height: 1.5; font-size: 13.5px; } a { color: #0284c7; } img { max-width: 100%; height: auto; }</style></head><body>${selectedMsg.htmlBody}</body></html>`}
                        className="w-full h-full min-h-[340px] border-none bg-white"
                        sandbox="allow-same-origin allow-popups"
                      />
                    </div>
                  ) : (
                    <div className={`p-4 rounded-2xl border text-xs leading-relaxed font-sans whitespace-pre-wrap select-text shadow-inner min-h-[140px] ${
                      isModern
                        ? "bg-zinc-950/70 border-zinc-800/80 text-zinc-200"
                        : "bg-slate-950/80 border-slate-800/80 text-slate-200"
                    }`}>
                      {sanitizeBodyText(selectedMsg.body)}
                    </div>
                  )}
                </div>

                {/* FOOTER ACTIONS */}
                <div className={`pt-3 border-t flex flex-wrap items-center justify-between gap-2 text-xs ${
                  isModern ? "border-zinc-800 font-sans" : "border-slate-800/80 font-mono"
                }`}>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleGenerateAiReply}
                      className={`px-4 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                        isModern
                          ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 shadow-sm"
                          : "bg-purple-500/20 hover:bg-purple-500/40 text-purple-200 border border-purple-500/40 font-extrabold shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                      }`}
                    >
                      <CornerUpLeft className={`w-4 h-4 ${isModern ? "text-red-400" : "text-purple-400"}`} />
                      <span>{isEn ? "AI REPLY DRAFT" : "KI-ANTWORT ENTWERFEN"}</span>
                    </button>

                    <button
                      onClick={() => {
                        setComposeTo(selectedMsg.senderEmail);
                        setComposeSubject(`Fwd: ${selectedMsg.subject}`);
                        setComposeBody(`---------- Weitergeleitete Nachricht ----------\nVon: ${selectedMsg.senderName} <${selectedMsg.senderEmail}>\nAn: ${selectedMsg.recipientEmail || realUserEmail}\nDatum: ${selectedMsg.fullDate || selectedMsg.timestamp}\nBetreff: ${selectedMsg.subject}\n\n${selectedMsg.body}`);
                        setIsComposing(true);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition cursor-pointer flex items-center gap-1 ${
                        isModern
                          ? "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
                          : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold"
                      }`}
                    >
                      <Share2 className={`w-3.5 h-3.5 ${isModern ? "text-zinc-400" : "text-cyan-400"}`} />
                      <span className="hidden sm:inline">{isEn ? "FORWARD" : "WEITERLEITEN"}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* SPAM TOGGLE BUTTON */}
                    {selectedMsg.folder === "spam" || selectedMsg.isSpam ? (
                      <button
                        onClick={() => handleUnmarkSpam(selectedMsg.id)}
                        className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition cursor-pointer flex items-center gap-1 ${
                          isModern
                            ? "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30"
                            : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold"
                        }`}
                        title="Aus Spam entfernen und in Posteingang verschieben"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{isEn ? "NOT SPAM" : "KEIN SPAM"}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMarkAsSpam(selectedMsg.id)}
                        className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition cursor-pointer flex items-center gap-1 ${
                          isModern
                            ? "bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30"
                            : "bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 font-bold"
                        }`}
                        title="Als Spam einstufen und in den Spam-Ordner verschieben"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                        <span>{isEn ? "REPORT SPAM" : "ALS SPAM MELDEN"}</span>
                      </button>
                    )}

                    <button
                      onClick={() => copyToClipboard(selectedMsg.body, "E-Mail Text")}
                      className={`p-2 rounded-xl transition cursor-pointer ${
                        isModern ? "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800" : "bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                      title="E-Mail Text kopieren"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setMessages((prev) => prev.filter((m) => m.id !== selectedMsg.id));
                        const remaining = filteredMessages.filter(m => m.id !== selectedMsg.id);
                        setSelectedMsgId(remaining[0]?.id || "");
                        showToast(isEn ? "Email deleted." : "🗑️ E-Mail gelöscht.", "info");
                      }}
                      className={`p-2 rounded-xl transition cursor-pointer ${
                        isModern ? "bg-zinc-900 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-zinc-800" : "bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                      }`}
                      title="E-Mail löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : !oauthToken ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-zinc-300 font-sans space-y-5 overflow-y-auto">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  isModern
                    ? "bg-zinc-800/80 border border-zinc-700 text-zinc-200 shadow-md"
                    : "bg-[#091024] border border-cyan-500/40 text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.25)] font-mono"
                }`}>
                  <Mail className={`w-8 h-8 ${isModern ? "text-red-400" : "text-cyan-400"}`} />
                </div>

                <div className={`max-w-md space-y-1.5 ${isModern ? "font-sans" : "font-mono"}`}>
                  <h3 className={`text-sm font-bold uppercase tracking-wider ${isModern ? "text-zinc-100" : "text-cyan-300"}`}>
                    {isEn ? "Google Gmail Workspace" : "Google Workspace Gmail"}
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    {isEn
                      ? "Currently no Google Mail account is connected. Neither inbox nor spam will display messages until you authorize your account."
                      : "Aktuell ist kein Google Mail Account verknüpft. Weder im Posteingang noch im Spam-Ordner werden E-Mails angezeigt, bis du deinen Account autorisierst."}
                  </p>
                </div>

                <div className={`w-full max-w-sm rounded-2xl p-4 text-left space-y-2.5 text-[11px] shadow-sm ${
                  isModern
                    ? "bg-zinc-900/90 border border-zinc-800 font-sans text-zinc-300"
                    : "bg-[#050814] border border-cyan-500/30 font-mono text-slate-300 shadow-lg"
                }`}>
                  <div className={`font-semibold text-xs flex items-center gap-2 pb-1 border-b ${
                    isModern ? "text-zinc-200 border-zinc-800" : "text-cyan-400 border-cyan-500/20 font-bold"
                  }`}>
                    <ShieldCheck className={`w-4 h-4 ${isModern ? "text-emerald-400" : "text-cyan-400"}`} />
                    <span>{isEn ? "WORKSPACE CAPABILITIES" : "GOOGLE WORKSPACE SCHNITTSTELLE"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{isEn ? "Sync real inbox & spam folder" : "Echten Posteingang & Spam-Ordner synchronisieren"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{isEn ? "AI spam & phishing shield" : "KI-Spam & Phishing Schutz"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{isEn ? "AI drafts & smart replies" : "KI-Antworten mit VECTOR & VEGA entwerfen"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{isEn ? "Real sending via official Gmail API" : "Echtes Versenden über offizielle Gmail API"}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={handleConnectWithGoogleGIS}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase cursor-pointer transition flex items-center gap-2 active:scale-95 ${
                      isModern
                        ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-md border border-red-500/40"
                        : "bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                    }`}
                  >
                    <Key className="w-4 h-4" />
                    <span>{isEn ? "Connect Google Account" : "Echten Google Account Verbinden"}</span>
                  </button>
                  <button
                    onClick={() => setShowTokenInput(true)}
                    className={`px-3.5 py-2.5 rounded-xl font-semibold text-xs cursor-pointer transition flex items-center gap-1.5 ${
                      isModern
                        ? "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
                        : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold"
                    }`}
                  >
                    <span>Token Manuell</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 text-xs space-y-2">
                <Mail className="w-8 h-8 text-zinc-600 opacity-40" />
                <p>{isEn ? "Select an email from the list." : "Wähle eine E-Mail aus der Liste aus."}</p>
              </div>
            )}

          </div>
        </div>

        {/* BOTTOM STATUS FOOTER */}
        <div className={`px-3.5 py-1.5 border-t flex flex-wrap items-center justify-between text-[9.5px] flex-shrink-0 ${
          isModern
            ? "bg-[#141419] border-zinc-800 text-zinc-500 font-sans"
            : "bg-slate-950 border-slate-800/80 text-slate-500 font-mono"
        }`}>
          <div className="flex items-center gap-2">
            <span className={isModern ? "text-zinc-300 font-semibold" : "text-cyan-400 font-bold"}>
              {isModern ? "Gmail Workspace Client" : "S.Y.N.T.A.X. GMAIL HUD v4.9"}
            </span>
            <span>::</span>
            <span>Google Workspace & AI Spam Shield</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-zinc-400">
              {isEn ? "FOLDER:" : "AKTIVER ORDNER:"} <strong className={`uppercase ${isModern ? "text-zinc-200" : "text-cyan-300"}`}>{activeFolder}</strong>
            </span>
            <span className={oauthToken ? "text-emerald-400 font-semibold flex items-center gap-1" : "text-amber-400"}>
              <ShieldCheck className="w-3 h-3" />
              {oauthToken ? (isEn ? "GMAIL API CONNECTED" : "REAL GMAIL API ACTIVE") : (isEn ? "NOT CONNECTED" : "NICHT VERBUNDEN")}
            </span>
          </div>
        </div>

      </div>
    </DraggableResizableWidget>
  );
};
