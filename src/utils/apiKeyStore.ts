import { useState, useEffect } from "react";

const STORAGE_KEY = "jarvis_gemini_key";

export function getStoredApiKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function setStoredApiKey(key: string): void {
  try {
    if (!key || key.trim().length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, key.trim().replace(/^["']|["']$/g, ""));
    }
  } catch {}
  window.dispatchEvent(new CustomEvent("syntax_gemini_key_updated", { detail: key }));
}

export function useApiKey(): [string, (newKey: string) => void] {
  const [apiKey, setApiKey] = useState<string>(getStoredApiKey);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      const updatedKey = e?.detail !== undefined ? e.detail : getStoredApiKey();
      setApiKey(updatedKey);
    };
    window.addEventListener("syntax_gemini_key_updated", handleUpdate);
    return () => window.removeEventListener("syntax_gemini_key_updated", handleUpdate);
  }, []);

  const update = (newKey: string) => {
    setStoredApiKey(newKey);
    setApiKey(newKey);
  };

  return [apiKey, update];
}
