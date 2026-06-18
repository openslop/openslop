import type { ElementSnapshot } from "@/lib/generation/queue";

export type GenerationState = {
	status: ElementSnapshot["status"];
	seconds: number;
};

export type PlaceholderProps = GenerationState & {
	error: string | null;
	onDiscard: () => void;
};
