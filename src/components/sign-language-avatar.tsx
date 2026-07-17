import { useState, useEffect, useRef } from "react";
import { useSignLanguage, type SignLanguageVariant } from "@/lib/sign-language-context";
import { X, Minimize2, Maximize2 } from "lucide-react";

// Sign language alphabet/gesture mappings (simplified visual representation)
const SIGN_GESTURES: Record<string, string> = {
  A: "✊", B: "🖐", C: "🤏", D: "👆", E: "✊", F: "👌",
  G: "👈", H: "🤞", I: "🤙", J: "🤙", K: "✌️", L: "🤟",
  M: "✊", N: "✊", O: "👌", P: "👇", Q: "👇", R: "🤞",
  S: "✊", T: "✊", U: "✌️", V: "✌️", W: "🤟", X: "☝️",
  Y: "🤙", Z: "☝️", " ": "  ",
};

interface SignLanguageAvatarProps {
  text?: string;
  isInterpreting?: boolean;
}

export function SignLanguageAvatar({ text = "", isInterpreting = false }: SignLanguageAvatarProps) {
  const { settings, updateSettings } = useSignLanguage();
  const [currentGesture, setCurrentGesture] = useState("");
  const [currentWord, setCurrentWord] = useState("");
  const [minimized, setMinimized] = useState(false);
  const [animationState, setAnimationState] = useState<"idle" | "signing" | "listening">("idle");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const charIndexRef = useRef(0);

  if (!settings.enabled || !settings.showAvatar) return null;

  useEffect(() => {
    if (!text || !isInterpreting) {
      setAnimationState("idle");
      setCurrentGesture("");
      setCurrentWord("");
      return;
    }

    setAnimationState("signing");
    charIndexRef.current = 0;
    const chars = text.toUpperCase().split("");

    intervalRef.current = setInterval(() => {
      if (charIndexRef.current >= chars.length) {
        charIndexRef.current = 0;
        setAnimationState("idle");
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }
      const char = chars[charIndexRef.current];
      setCurrentGesture(SIGN_GESTURES[char] || "🤚");
      // Show current word context
      const wordStart = text.lastIndexOf(" ", charIndexRef.current - 1) + 1;
      const wordEnd = text.indexOf(" ", charIndexRef.current);
      setCurrentWord(text.slice(wordStart, wordEnd === -1 ? undefined : wordEnd));
      charIndexRef.current++;
    }, 400);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, isInterpreting]);

  const positionClasses: Record<string, string> = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-20 right-4",
    "top-left": "top-20 left-4",
  };

  const sizeClasses: Record<string, { container: string; avatar: string; text: string }> = {
    sm: { container: "w-32 h-40", avatar: "h-16 w-16 text-2xl", text: "text-xs" },
    md: { container: "w-44 h-52", avatar: "h-24 w-24 text-4xl", text: "text-sm" },
    lg: { container: "w-56 h-64", avatar: "h-32 w-32 text-5xl", text: "text-base" },
  };

  const size = sizeClasses[settings.avatarSize];

  if (minimized) {
    return (
      <div className={`fixed ${positionClasses[settings.avatarPosition]} z-50`}>
        <button
          onClick={() => setMinimized(false)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg hover:scale-105 transition-transform"
          aria-label="Show sign language avatar"
        >
          <span className="text-xl">🤟</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`fixed ${positionClasses[settings.avatarPosition]} z-50 ${size.container} flex flex-col items-center rounded-2xl border border-border/60 bg-card/95 p-3 shadow-xl backdrop-blur-md transition-all`}
      role="region"
      aria-label={`Sign language interpreter - ${settings.signLanguage}`}
      aria-live="polite"
    >
      {/* Header controls */}
      <div className="flex w-full items-center justify-between mb-2">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
          {settings.signLanguage} Interpreter
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setMinimized(true)}
            className="grid h-5 w-5 place-items-center rounded text-muted-foreground hover:bg-muted"
            aria-label="Minimize interpreter"
          >
            <Minimize2 className="h-3 w-3" />
          </button>
          <button
            onClick={() => updateSettings({ showAvatar: false })}
            className="grid h-5 w-5 place-items-center rounded text-muted-foreground hover:bg-muted"
            aria-label="Close interpreter"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Avatar body */}
      <div className="relative flex-1 flex flex-col items-center justify-center">
        {/* Animated avatar figure */}
        <div className={`relative ${size.avatar} rounded-full bg-gradient-to-br from-primary/20 to-accent/20 grid place-items-center border-2 border-primary/30 transition-all ${
          animationState === "signing" ? "animate-pulse scale-105" : ""
        } ${animationState === "listening" ? "border-accent ring-2 ring-accent/30" : ""}`}>
          {/* Avatar face/hands representation */}
          <div className="flex flex-col items-center">
            <span className="text-lg mb-0.5">👤</span>
            <span className={`transition-all duration-300 ${animationState === "signing" ? "scale-125" : ""}`}>
              {currentGesture || "🤚"}
            </span>
          </div>
        </div>

        {/* Status indicator */}
        <div className="mt-2 flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${
            animationState === "signing" ? "bg-accent animate-pulse" :
            animationState === "listening" ? "bg-green-500 animate-pulse" :
            "bg-muted-foreground/40"
          }`} />
          <span className={`${size.text} text-muted-foreground`}>
            {animationState === "signing" ? "Signing" :
             animationState === "listening" ? "Listening" : "Ready"}
          </span>
        </div>

        {/* Current word being signed */}
        {currentWord && animationState === "signing" && (
          <div className={`mt-1.5 rounded-md bg-primary/10 px-2 py-0.5 ${size.text} font-medium text-primary`}>
            {currentWord}
          </div>
        )}
      </div>
    </div>
  );
}
