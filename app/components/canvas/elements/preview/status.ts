import type { ElementSnapshot } from "@/lib/generation/queue";
import type { CanvasElementType } from "../../types";

export type GenerationState = {
	status: ElementSnapshot["status"];
	seconds: number;
};

export type PlaceholderProps = GenerationState & {
	error: string | null;
	onGenerate: () => void;
	onDiscard: () => void;
};

export function deriveStatus(
	generating: boolean,
	queued: boolean,
): ElementSnapshot["status"] {
	if (queued) return "queued";
	if (generating) return "generating";
	return "idle";
}

export const BORDER_COLORS: Record<CanvasElementType, string> = {
	character: "border-amber-500/30",
	image: "border-cyan-500/30",
	clip: "border-indigo-500/30",
	narration: "border-white/20",
	music: "border-violet-500/30",
	sound: "border-emerald-500/30",
};

export const WAVE_COLORS: Record<CanvasElementType, string> = {
	character: "rgb(251, 191, 36)",
	narration: "rgb(128, 128, 128)",
	music: "rgb(167, 139, 250)",
	sound: "rgb(52, 211, 153)",
	image: "rgb(34, 211, 238)",
	clip: "rgb(129, 140, 248)",
};
