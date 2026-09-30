import React, { createContext, useContext, useState, useEffect } from "react";

export type ThemeMode = "syntax" | "cyberpunk";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  isModern: boolean;
  isCyberpunk: boolean;
}

const THEME_STORAGE_KEY = "syntax_os_theme_mode";

export function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "syntax";
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "cyberpunk" || saved === "syntax") {
      return saved;
    }
  } catch (e) {
    // LocalStorage fallback
  }
  return "syntax";
}

export function applyThemeToDocument(theme: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("theme-syntax", "theme-cyberpunk");
  root.classList.add(theme === "syntax" ? "theme-syntax" : "theme-cyberpunk");
  root.setAttribute("data-theme", theme);
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "syntax",
  setTheme: () => {},
  toggleTheme: () => {},
  isModern: true,
  isCyberpunk: false,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    applyThemeToDocument(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      // storage error fallback
    }
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "syntax" ? "cyberpunk" : "syntax"));
  };

  return React.createElement(
    ThemeContext.Provider,
    {
      value: {
        theme,
        setTheme,
        toggleTheme,
        isModern: theme === "syntax",
        isCyberpunk: theme === "cyberpunk",
      },
    },
    children
  );
};

export const useTheme = () => useContext(ThemeContext);
