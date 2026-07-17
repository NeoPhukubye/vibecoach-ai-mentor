import { useSignLanguage, SIGN_LANGUAGES } from "@/lib/sign-language-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Hand, Eye, MonitorSpeaker, Settings2, X } from "lucide-react";

interface AccessibilitySettingsProps {
  open: boolean;
  onClose: () => void;
}

export function AccessibilitySettings({ open, onClose }: AccessibilitySettingsProps) {
  const { settings, updateSettings, toggleEnabled } = useSignLanguage();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-lg mx-4 p-0 overflow-hidden border-border/60 bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10">
              <Hand className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Sign Language Settings</h2>
              <p className="text-xs text-muted-foreground">Deaf-friendly accessibility options</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted"
            aria-label="Close settings"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Master toggle */}
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-4">
            <div className="flex items-center gap-3">
              <Hand className="h-5 w-5 text-primary" />
              <div>
                <Label htmlFor="sl-enabled" className="text-sm font-medium">Enable Sign Language Mode</Label>
                <p className="text-xs text-muted-foreground">Activate all sign language features</p>
              </div>
            </div>
            <Switch
              id="sl-enabled"
              checked={settings.enabled}
              onCheckedChange={toggleEnabled}
            />
          </div>

          {/* Sign language selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <MonitorSpeaker className="h-4 w-4" />
              Preferred Sign Language
            </Label>
            <Select
              value={settings.signLanguage}
              onValueChange={(val) => updateSettings({ signLanguage: val as any })}
              disabled={!settings.enabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sign language" />
              </SelectTrigger>
              <SelectContent>
                {SIGN_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    <span className="flex items-center gap-2">
                      <span>{lang.label}</span>
                      <span className="text-xs text-muted-foreground">({lang.region})</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sign Language Avatar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="sl-avatar" className="text-sm font-medium">Signing Avatar</Label>
                <p className="text-xs text-muted-foreground">Show interpreter avatar that signs content</p>
              </div>
            </div>
            <Switch
              id="sl-avatar"
              checked={settings.showAvatar}
              onCheckedChange={(val) => updateSettings({ showAvatar: val })}
              disabled={!settings.enabled}
            />
          </div>

          {/* Sign Recognition */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="sl-recognition" className="text-sm font-medium">Sign Language Input</Label>
                <p className="text-xs text-muted-foreground">Use camera to recognize your sign language</p>
              </div>
            </div>
            <Switch
              id="sl-recognition"
              checked={settings.signRecognitionEnabled}
              onCheckedChange={(val) => updateSettings({ signRecognitionEnabled: val })}
              disabled={!settings.enabled}
            />
          </div>

          {/* Avatar position */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Avatar Position</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["bottom-left", "bottom-right", "top-left", "top-right"] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => updateSettings({ avatarPosition: pos })}
                  disabled={!settings.enabled}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                    settings.avatarPosition === pos
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted disabled:opacity-50"
                  }`}
                >
                  {pos.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Avatar size */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Avatar Size</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["sm", "md", "lg"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => updateSettings({ avatarSize: s })}
                  disabled={!settings.enabled}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                    settings.avatarSize === s
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted disabled:opacity-50"
                  }`}
                >
                  {s === "sm" ? "Small" : s === "md" ? "Medium" : "Large"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border/60 px-6 py-4 flex justify-end">
          <Button onClick={onClose} size="sm">Done</Button>
        </div>
      </Card>
    </div>
  );
}
