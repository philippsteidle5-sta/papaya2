import React from "react";
import { SyntaxQuantumLoginModal } from "./SyntaxQuantumLoginModal";

interface KeyLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (email: string, role?: string) => void;
  onKeySuccess?: (email: string) => void;
  onOpenDailyUsage?: () => void;
  onOpenUserTerminal?: (tab?: string) => void;
  lang?: "de" | "en";
}

export const KeyLoginModal: React.FC<KeyLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onKeySuccess,
  onOpenDailyUsage,
  onOpenUserTerminal,
  lang = "de",
}) => {
  const handleSuccess = (email: string, role?: string) => {
    if (typeof onKeySuccess === "function") {
      onKeySuccess(email);
    }
    if (typeof onSuccess === "function") {
      onSuccess(email, role);
    }
  };

  return (
    <SyntaxQuantumLoginModal
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={handleSuccess}
      onOpenDailyUsage={onOpenDailyUsage}
      onOpenUserTerminal={onOpenUserTerminal}
      lang={lang}
    />
  );
};
