import { useSignLanguage } from "@/lib/sign-language-context";
import { useSignRecognition } from "@/hooks/use-sign-recognition";
import { Button } from "@/components/ui/button";
import { Hand, Trash2, AlertCircle } from "lucide-react";

interface SignRecognitionOverlayProps {
  videoElement: HTMLVideoElement | null;
}

export function SignRecognitionOverlay({ videoElement }: SignRecognitionOverlayProps) {
  const { settings } = useSignLanguage();
  const { isActive, lastSign, recognizedText, error, startRecognition, stopRecognition, clearText } =
    useSignRecognition({ videoElement });

  if (!settings.enabled || !settings.signRecognitionEnabled) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 rounded-b-lg border-t border-border/60 bg-card/90 p-3 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Hand className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium">Sign Language Input ({settings.signLanguage})</span>
        </div>
        <div className="flex items-center gap-1">
          {!isActive ? (
            <Button variant="ghost" size="sm" onClick={startRecognition} className="h-7 text-xs">
              Start Recognition
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={stopRecognition} className="h-7 text-xs text-destructive">
              Stop
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={clearText} className="h-7 w-7 p-0">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-2 py-1.5 text-xs text-destructive mb-2">
          <AlertCircle className="h-3 w-3" />
          {error}
        </div>
      )}

      {/* Recognized text output */}
      <div className="min-h-[2rem] rounded-md border border-border/60 bg-background/60 px-3 py-2">
        {recognizedText ? (
          <p className="text-sm">{recognizedText}</p>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            {isActive ? "Show signs to the camera..." : "Start recognition to begin"}
          </p>
        )}
      </div>

      {/* Last detected sign */}
      {lastSign && isActive && (
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded bg-accent/20 px-1.5 py-0.5 font-mono text-accent">
            {lastSign.gesture}
          </span>
          <span>{Math.round(lastSign.confidence * 100)}% confidence</span>
        </div>
      )}
    </div>
  );
}
