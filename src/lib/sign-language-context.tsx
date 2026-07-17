import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type SignLanguageVariant =
  | "ASL"    // American Sign Language
  | "BSL"    // British Sign Language
  | "ISL"    // International Sign Language
  | "SASL"   // South African Sign Language
  | "LSF"    // French Sign Language (Langue des Signes Française)
  | "DGS"    // German Sign Language (Deutsche Gebärdensprache)
  | "JSL"    // Japanese Sign Language
  | "CSL";   // Chinese Sign Language

export const SIGN_LANGUAGES: { value: SignLanguageVariant; label: string; region: string }[] = [
  { value: "ASL", label: "American Sign Language", region: "US/Canada" },
  { value: "BSL", label: "British Sign Language", region: "UK" },
  { value: "ISL", label: "International Sign Language", region: "International" },
  { value: "SASL", label: "South African Sign Language", region: "South Africa" },
  { value: "LSF", label: "Langue des Signes Française", region: "France" },
  { value: "DGS", label: "Deutsche Gebärdensprache", region: "Germany" },
  { value: "JSL", label: "Japanese Sign Language", region: "Japan" },
  { value: "CSL", label: "Chinese Sign Language", region: "China" },
];

interface SignLanguageSettings {
  enabled: boolean;
  signLanguage: SignLanguageVariant;
  showAvatar: boolean;
  signRecognitionEnabled: boolean;
  avatarPosition: "bottom-left" | "bottom-right" | "top-right" | "top-left";
  avatarSize: "sm" | "md" | "lg";
}

interface SignLanguageContextType {
  settings: SignLanguageSettings;
  updateSettings: (partial: Partial<SignLanguageSettings>) => void;
  toggleEnabled: () => void;
  activeText: string;
  setActiveText: (text: string) => void;
}

const DEFAULT_SETTINGS: SignLanguageSettings = {
  enabled: false,
  signLanguage: "ASL",
  showAvatar: true,
  signRecognitionEnabled: false,
  avatarPosition: "bottom-right",
  avatarSize: "md",
};

const STORAGE_KEY = "vibecoach:sign-language-settings";

const SignLanguageContext = createContext<SignLanguageContextType | null>(null);

export function SignLanguageProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SignLanguageSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {}
    return DEFAULT_SETTINGS;
  });
  const [activeText, setActiveText] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (partial: Partial<SignLanguageSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const toggleEnabled = () => {
    setSettings((prev) => ({ ...prev, enabled: !prev.enabled }));
  };

  return (
    <SignLanguageContext.Provider value={{ settings, updateSettings, toggleEnabled, activeText, setActiveText }}>
      {children}
    </SignLanguageContext.Provider>
  );
}

export function useSignLanguage() {
  const ctx = useContext(SignLanguageContext);
  if (!ctx) throw new Error("useSignLanguage must be used within SignLanguageProvider");
  return ctx;
}
