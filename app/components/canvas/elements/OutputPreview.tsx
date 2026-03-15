import { useMemo } from "react";
import { Play, Image as ImageIcon, Film, User } from "lucide-react";
import type { CanvasElementType } from "../types";

function intHash(str: string, index: number): number {
  let hash = index * 2654435761;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) & 0x7fffffff;
  }
  return hash;
}

function PlayButton({ color }: { color: string }) {
  return (
    <button
      type="button"
      aria-label="Play preview"
      className={`w-8 h-8 rounded-full ${color} flex items-center justify-center flex-shrink-0`}
    >
      <Play
        className="w-3 h-3 text-white fill-white ml-0.5"
        aria-hidden="true"
      />
    </button>
  );
}

function StaticSoundwave({
  barColor,
  barCount = 20,
  seed = "default",
}: {
  barColor: string;
  barCount?: number;
  seed?: string;
}) {
  const bars = useMemo(
    () =>
      Array.from({ length: barCount }, (_, i) => 20 + (intHash(seed, i) % 80)),
    [barCount, seed],
  );

  return (
    <div className="flex items-center gap-[2px] flex-1 h-6">
      {bars.map((height, i) => (
        <div
          key={i}
          className={`w-[2px] rounded-full ${barColor}`}
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}

function AudioPreview({
  buttonColor,
  barColor,
  barCount,
  seed,
}: {
  buttonColor: string;
  barColor: string;
  barCount?: number;
  seed?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <PlayButton color={buttonColor} />
      <StaticSoundwave barColor={barColor} barCount={barCount} seed={seed} />
    </div>
  );
}

function MediaPreview({
  borderColor,
  icon: Icon,
}: {
  borderColor: string;
  icon: typeof ImageIcon;
}) {
  return (
    <div
      className={`relative w-full aspect-video rounded-lg overflow-hidden border ${borderColor} bg-black/20 flex items-center justify-center`}
    >
      <Icon className="w-8 h-8 text-white/20" aria-hidden="true" />
    </div>
  );
}

function CharacterPreview({ name }: { name?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-amber-500/30 border border-amber-400/40 flex items-center justify-center flex-shrink-0">
        <User className="w-4 h-4 text-amber-300" />
      </div>
      {name && (
        <span className="text-amber-200/80 text-[11px] font-medium truncate max-w-[60px]">
          {name}
        </span>
      )}
      <PlayButton color="bg-amber-500/40" />
      <StaticSoundwave
        barColor="bg-amber-400/50"
        barCount={16}
        seed={name ?? "character"}
      />
    </div>
  );
}

const PREVIEW_COLORS: Record<
  string,
  { buttonColor: string; barColor: string }
> = {
  narration: {
    buttonColor: "bg-white/20",
    barColor: "bg-white/30",
  },
  music: {
    buttonColor: "bg-violet-500/40",
    barColor: "bg-violet-400/50",
  },
  sound: {
    buttonColor: "bg-emerald-500/40",
    barColor: "bg-emerald-400/50",
  },
};

export function OutputPreview({
  type,
  characterName,
}: {
  type: CanvasElementType;
  characterName?: string;
}) {
  switch (type) {
    case "character":
      return <CharacterPreview name={characterName} />;
    case "image":
      return <MediaPreview borderColor="border-cyan-500/30" icon={ImageIcon} />;
    case "clip":
      return <MediaPreview borderColor="border-indigo-500/30" icon={Film} />;
    default: {
      const colors = PREVIEW_COLORS[type];
      if (!colors) return null;
      return (
        <AudioPreview
          buttonColor={colors.buttonColor}
          barColor={colors.barColor}
          barCount={type === "sound" ? 30 : 20}
          seed={type}
        />
      );
    }
  }
}
