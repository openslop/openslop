import type { ReactNode } from "react";
import type { ElementSnapshot } from "@/lib/generation/snapshots";

export type GenerationState = {
	status: ElementSnapshot["status"];
	seconds: number;
};

export type PlaceholderProps = GenerationState & {
	error: string | null;
	onDiscard: () => void;
};

export type PreviewOverlays = {
	topRight?: ReactNode;
};

/** The uniform contract every entry in `ELEMENT_PREVIEWS` renders against. */
export type ElementPreviewProps = PlaceholderProps &
	PreviewOverlays & {
		result: ElementSnapshot["result"];
	};
