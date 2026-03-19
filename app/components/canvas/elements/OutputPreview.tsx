import { useCallback, useEffect, useState } from "react";
import { X as XIcon, Wand2 } from "lucide-react";
import type { CanvasElementType } from "../types";

interface PlaceholderBall {
  color: string;
  size: string;
  duration: string;
  x: string;
  y: string;
}

const PLACEHOLDER_BALLS: PlaceholderBall[] = [
  { color: "#cab3d6", size: "14px", duration: "4.2s", x: "40px", y: "-100px" },
  { color: "#f5aa64", size: "16px", duration: "5.8s", x: "-50px", y: "280px" },
  { color: "#f58c02", size: "10px", duration: "7.3s", x: "90px", y: "220px" },
  { color: "#94c9e9", size: "18px", duration: "6.4s", x: "-75px", y: "-70px" },
  { color: "#eeaeca", size: "20px", duration: "10s", x: "25px", y: "120px" },
  { color: "#f57802", size: "12px", duration: "3.7s", x: "-40px", y: "190px" },
  { color: "#cab3d6", size: "11px", duration: "2.6s", x: "75px", y: "-150px" },
  { color: "#f5aa64", size: "17px", duration: "6.9s", x: "-25px", y: "140px" },
  { color: "#f55702", size: "13px", duration: "5.3s", x: "60px", y: "-220px" },
  { color: "#94c9e9", size: "19px", duration: "7.7s", x: "-90px", y: "240px" },
  { color: "#5eaebf", size: "16px", duration: "6.3s", x: "85px", y: "-180px" },
];

function SparklesIcon() {
  return (
    <svg
      className="gen-btn-svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
      />
    </svg>
  );
}

function GenerateButton({
  generating,
  seconds,
  onClick,
}: {
  generating: boolean;
  seconds: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`gen-btn ${generating ? "is-generating pointer-events-none" : "opacity-0 group-hover:opacity-100"} transition-opacity`}
      onClick={generating ? undefined : onClick}
    >
      <SparklesIcon />
      <span className={generating ? "shimmer" : ""}>
        {generating ? `Generating ${seconds}s` : "Generate"}
      </span>
    </button>
  );
}

function useGeneratingState(onGenerate?: () => void) {
  const [generating, setGenerating] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!generating) return;
    const start = Date.now();
    const id = setInterval(
      () => setSeconds(((Date.now() - start) / 1000) | 0),
      1000,
    );
    return () => clearInterval(id);
  }, [generating]);

  const handleGenerate = useCallback(() => {
    setGenerating(true);
    setSeconds(0);
    onGenerate?.();
  }, [onGenerate]);

  const handleCancel = useCallback(() => {
    setGenerating(false);
    setSeconds(0);
  }, []);

  return { generating, seconds, handleGenerate, handleCancel };
}

function WandIcon() {
  return (
    <Wand2 className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white/40 stroke-1 drop-shadow-md" />
  );
}

function CancelButton({
  onClick,
  className = "top-2",
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label="Cancel generation"
      className={`absolute right-2 z-10 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity ${className}`}
      onClick={onClick}
    >
      <XIcon className="w-3 h-3 text-white" />
    </button>
  );
}

const AUDIO_BAR_COUNT = 60;
const BAR_W = 100 / AUDIO_BAR_COUNT;
const BAR_GAP = BAR_W * 0.3;

function buildSoundwaveMask(bars: number[]) {
  const rects = bars
    .map(
      (h, i) =>
        `<rect x="${i * BAR_W + BAR_GAP / 2}" y="${(100 - h) / 2}" width="${BAR_W - BAR_GAP}" height="${h}" rx="1" fill="white"/>`,
    )
    .join("");
  return `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">${rects}</svg>`,
  )}")`;
}

function AudioPlaceholder({ onGenerate }: { onGenerate?: () => void }) {
  const { generating, seconds, handleGenerate, handleCancel } =
    useGeneratingState(onGenerate);

  const [{ mask, staticRotations }] = useState(() => {
    const bars = Array.from(
      { length: AUDIO_BAR_COUNT },
      () => 20 + Math.random() * 80,
    );
    return {
      mask: buildSoundwaveMask(bars),
      staticRotations: PLACEHOLDER_BALLS.map(() =>
        Math.floor(Math.random() * 360),
      ),
    };
  });

  return (
    <div className="group relative w-full h-16 rounded-lg overflow-hidden">
      <div className="absolute inset-0 blur-[6px]" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            maskImage: mask,
            WebkitMaskImage: mask,
            maskSize: "100% 100%",
            WebkitMaskSize: "100% 100%",
          }}
        >
          <div className="absolute inset-0 bg-white/20" />
          <div className="container-loader">
            {PLACEHOLDER_BALLS.map((ball, i) => (
              <span
                key={i}
                className={generating ? "ball" : "ball ball-static"}
                style={
                  {
                    "--color": ball.color,
                    "--i": ball.size,
                    "--d": ball.duration,
                    "--x": ball.x,
                    "--y": ball.y,
                    ...(!generating && {
                      "--rotation": `${staticRotations[i]}deg`,
                    }),
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        </div>
      </div>
      <div className="absolute inset-0 grain grain-light border rounded-lg bg-white/[0.03] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]" />
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <WandIcon />
      </div>
      <div className="absolute inset-0 z-10 flex items-center justify-start pl-2">
        <GenerateButton
          generating={generating}
          seconds={seconds}
          onClick={handleGenerate}
        />
      </div>
      {generating && (
        <CancelButton
          onClick={handleCancel}
          className="top-1/2 -translate-y-1/2"
        />
      )}
    </div>
  );
}

function MediaPlaceholder({ onGenerate }: { onGenerate?: () => void }) {
  const { generating, seconds, handleGenerate, handleCancel } =
    useGeneratingState(onGenerate);

  const [staticRotations] = useState(() =>
    PLACEHOLDER_BALLS.map(() => Math.floor(Math.random() * 360)),
  );

  return (
    <div className="group grain grain-light relative w-full aspect-video rounded-lg overflow-hidden border flex items-center justify-center backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]">
      <div className="z-10">
        <WandIcon />
      </div>
      <div className="absolute top-2 left-2 z-10">
        <GenerateButton
          generating={generating}
          seconds={seconds}
          onClick={handleGenerate}
        />
      </div>
      {generating && <CancelButton onClick={handleCancel} />}
      <div className="container-loader" aria-hidden="true">
        {PLACEHOLDER_BALLS.map((ball, i) => (
          <span
            key={i}
            className={generating ? "ball" : "ball ball-static"}
            style={
              {
                "--color": ball.color,
                "--i": ball.size,
                "--d": ball.duration,
                "--x": ball.x,
                "--y": ball.y,
                ...(!generating && {
                  "--rotation": `${staticRotations[i]}deg`,
                }),
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}

function MediaPreview({
  media,
  borderColor,
  onGenerate,
}: {
  media?: React.ReactNode;
  borderColor: string;
  onGenerate?: () => void;
}) {
  if (media) {
    return (
      <div
        className={`w-full aspect-video rounded-lg overflow-hidden border ${borderColor}`}
      >
        {media}
      </div>
    );
  }
  return <MediaPlaceholder onGenerate={onGenerate} />;
}

const BORDER_COLORS: Record<CanvasElementType, string> = {
  character: "border-amber-500/30",
  image: "border-cyan-500/30",
  clip: "border-indigo-500/30",
  narration: "border-white/20",
  music: "border-violet-500/30",
  sound: "border-emerald-500/30",
};

const AUDIO_TYPES = new Set<CanvasElementType>([
  "character",
  "narration",
  "music",
  "sound",
]);

export function OutputPreview({
  type,
  onGenerate,
}: {
  type: CanvasElementType;
  onGenerate?: () => void;
}) {
  if (AUDIO_TYPES.has(type)) {
    return <AudioPlaceholder onGenerate={onGenerate} />;
  }
  return (
    <MediaPreview
      borderColor={BORDER_COLORS[type] ?? "border-white/20"}
      onGenerate={onGenerate}
    />
  );
}
