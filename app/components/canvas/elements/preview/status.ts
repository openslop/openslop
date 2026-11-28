import type { ReactNode } from "react";
import type { ElementSnapshot } from "@/lib/generation/snapshots";

export type GenerationState = Pick<ElementSnapshot, "status" | "startedAt"> & {
	queuedReason: string | null;
};

export type PlaceholderProps = GenerationState & {
	error: string | null;
	onDiscard: () => void;
};

export type PreviewOverlays = {
	topRight?: ReactNode;
};

export type ElementPreviewProps = PlaceholderProps &
	PreviewOverlays & {
		result: ElementSnapshot["result"];
	};
