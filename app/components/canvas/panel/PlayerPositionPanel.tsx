"use client";

import { EyeOff, PanelRight, PanelTop } from "lucide-react";
import {
  usePlayerPosition,
  type PlayerPosition,
} from "@/app/components/video/PlayerPositionContext";

const POSITION_OPTIONS: {
  value: PlayerPosition;
  label: string;
  icon: typeof PanelTop;
}[] = [
  { value: "top", label: "Top", icon: PanelTop },
  { value: "right", label: "Right", icon: PanelRight },
];

export default function PlayerPositionPanel() {
  const { position, visible, setPosition, setVisible, narrowViewport } =
    usePlayerPosition();

  const activeClass =
    "relative grain bg-[#2d2040]/60 border border-violet-500/30 text-violet-300";

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-white/50">
        Player Position
      </h2>
      {POSITION_OPTIONS.map(({ value, label, icon: Icon }) => {
        const disabled = value === "right" && narrowViewport;
        const selected = visible && position === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => {
              setPosition(value);
              setVisible(true);
            }}
            disabled={disabled}
            className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
              disabled
                ? "cursor-not-allowed text-white/15"
                : selected
                  ? activeClass
                  : "text-white/30 hover:text-white/50"
            }`}
          >
            <Icon size={16} strokeWidth={1.5} />
            {label}
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => setVisible(false)}
        className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
          !visible ? activeClass : "text-white/30 hover:text-white/50"
        }`}
      >
        <EyeOff size={16} strokeWidth={1.5} />
        Hidden
      </button>
    </div>
  );
}
