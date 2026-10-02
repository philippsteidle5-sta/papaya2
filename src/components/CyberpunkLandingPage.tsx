import React from "react";
import { AgentConfig } from "../types";
import { UserProfile } from "../rbac";

interface CyberpunkLandingPageProps {
  onEnterApp: () => void;
  agents: AgentConfig[];
  userProfile: UserProfile;
  onUpgradeToPro: (tierName: string) => void;
  onOpenGmailInbox?: () => void;
  onOpenVeoVideoStudio?: () => void;
  onOpenAgentFleetStudio?: () => void;
  onViewMaintenanceMode?: () => void;
  lang?: "de" | "en";
  onToggleLang?: () => void;
}

/** Displays the supplied PapayaOS sales page as the app's landing page. */
export const CyberpunkLandingPage: React.FC<CyberpunkLandingPageProps> = () => (
  <main className="fixed inset-0 bg-black">
    <iframe
      title="PapayaOS Salespage"
      src="/sales-preview.html"
      className="h-full w-full border-0"
      loading="eager"
    />
  </main>
);

export default CyberpunkLandingPage;
