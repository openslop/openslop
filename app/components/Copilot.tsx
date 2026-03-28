"use client";

import { type ReactNode, useEffect, useState } from "react";
import { ArrowRight, Sparkles, Square } from "lucide-react";
import OrbLoader from "./OrbLoader";
import ScriptToggle from "./ScriptToggle";

const LOADING_MESSAGES = [
  "Brewing creativity…",
  "Summoning the muses…",
  "Arguing with the AI writers' room…",
  "Polishing the plot twists…",
  "Convincing characters to cooperate…",
  "Sprinkling dramatic tension…",
  "Negotiating with the narrator…",
  "Adding a pinch of movie magic…",
];

interface CopilotProps {
  onSubmit: (value: string) => void;
  onStop?: () => void;
  multiline?: boolean;
  placeholder?: ReactNode;
  loading?: boolean;
  scriptMode?: boolean;
  onScriptModeChange?: (scriptMode: boolean) => void;
}

function ActionButton({
  label,
  icon,
  onClick,
  disabled,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="relative grain ml-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#1f1528]/60 text-violet-300 transition-[filter] hover:brightness-[1.3] disabled:opacity-30 disabled:pointer-events-none"
    >
      {icon}
    </button>
  );
}

function LoadingText() {
  const [index, setIndex] = useState(() =>
    Math.floor(Math.random() * LOADING_MESSAGES.length),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="font-body pointer-events-none block select-none truncate text-sm text-white/40 shimmer">
      {LOADING_MESSAGES[index]}
    </span>
  );
}

export default function Copilot({
  onSubmit,
  onStop,
  multiline,
  placeholder,
  loading,
  scriptMode,
  onScriptModeChange,
}: CopilotProps) {
  const [value, setValue] = useState("");

  const hasText = value.trim().length > 0;

  const handleSubmit = () => {
    if (!hasText) return;
    onSubmit(value);
    setValue("");
  };

  const placeholderOverlay =
    typeof placeholder !== "string" ? placeholder : undefined;
  const placeholderText =
    typeof placeholder === "string" ? placeholder : undefined;

  return (
    <div className="w-full rounded-xl border border-violet-500/30 bg-white/5 shadow-[0_0_30px_rgba(55,30,100,0.3)] backdrop-blur-sm">
      {multiline ? (
        <div className="px-4 py-3">
          {onScriptModeChange && (
            <div className="flex items-center pb-2">
              <ScriptToggle
                active={!!scriptMode}
                onChange={onScriptModeChange}
              />
            </div>
          )}
          <div className="grid [&>*]:[grid-area:1/1]">
            <textarea
              rows={2}
              aria-label="Enter your prompt"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter")
                  handleSubmit();
              }}
              placeholder={placeholderText}
              style={{ fieldSizing: "content" }}
              className="font-body w-full resize-none bg-transparent text-sm text-white/80 caret-violet-400 placeholder:text-white/30 outline-none focus-visible:ring-2 focus-visible:ring-violet-400/30 focus-visible:rounded-sm"
            />
            {!hasText && placeholderOverlay && (
              <div className="font-body pointer-events-none overflow-hidden text-sm">
                {placeholderOverlay}
              </div>
            )}
          </div>
          <div className="flex justify-end pt-2">
            <ActionButton
              label="Submit"
              icon={<ArrowRight className="h-4 w-4" />}
              onClick={handleSubmit}
              disabled={!hasText}
            />
          </div>
        </div>
      ) : (
        <div className="relative flex items-center px-4 py-3">
          {loading ? (
            <OrbLoader />
          ) : (
            <Sparkles className="mr-3 h-5 w-5 shrink-0 text-violet-400/60" />
          )}
          <div className="relative min-w-0 flex-1">
            {loading ? (
              <LoadingText />
            ) : (
              <>
                {!hasText && placeholderOverlay && (
                  <div className="font-body pointer-events-none absolute inset-0 flex items-center overflow-hidden text-sm">
                    {placeholderOverlay}
                  </div>
                )}
                <input
                  type="text"
                  aria-label="Describe your video"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder={placeholderText}
                  className="font-body w-full bg-transparent text-sm text-white/80 caret-violet-400 placeholder:text-white/30 outline-none focus-visible:ring-2 focus-visible:ring-violet-400/30 focus-visible:rounded-sm"
                />
              </>
            )}
          </div>
          {loading ? (
            <ActionButton
              label="Stop generation"
              icon={<Square className="h-3 w-3 fill-current" />}
              onClick={() => onStop?.()}
            />
          ) : (
            <ActionButton
              label="Submit prompt"
              icon={<ArrowRight className="h-4 w-4" />}
              onClick={handleSubmit}
              disabled={!hasText}
            />
          )}
        </div>
      )}
    </div>
  );
}
