import compact from "lodash/compact";
import type { ReactNode } from "react";
import type { ActionMenuItem } from "@/components/ui/action-menu";
import {
	CaptionsAlert,
	Hourglass,
	MagicCaptions,
	RotateCcw,
	Trash2,
} from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import type { GenerationStatus } from "@/lib/generation/snapshots";

/** Captions on anything that can carry them: an element's result or a library file. */
export interface CaptionsControl {
	captioned: boolean;
	error?: string | null;
	generate: () => void;
	resetEdits?: () => void;
}

interface CaptionsFace {
	label: string;
	icon: ReactNode;
}

/** What shows in place of the captions' actions while they are on their way. */
export function captionsPending(status: GenerationStatus): CaptionsFace | null {
	if (status === "idle") return null;
	return status === "queued"
		? { label: "Captions queued", icon: <Hourglass /> }
		: { label: "Generating captions…", icon: <Spinner /> };
}

/** The one action before there are captions, a retry once generating them failed. */
export function generateCaptionsItem({
	error,
	generate,
}: CaptionsControl): ActionMenuItem & CaptionsFace {
	return error
		? {
				key: "generate",
				label: `Captions failed: ${error}. Try again`,
				icon: <CaptionsAlert />,
				variant: "destructive",
				onSelect: generate,
			}
		: {
				key: "generate",
				label: "Generate captions",
				icon: <MagicCaptions />,
				onSelect: generate,
			};
}

/** Generate before there are captions; regenerate, reset edits or remove after. */
export function captionsActions(
	captions: CaptionsControl,
	onRemove: () => void,
): ActionMenuItem[] {
	if (!captions.captioned) return [generateCaptionsItem(captions)];
	return compact([
		{
			key: "regenerate",
			label: "Regenerate captions",
			icon: <MagicCaptions />,
			onSelect: captions.generate,
		},
		captions.resetEdits && {
			key: "reset",
			label: "Reset edits",
			icon: <RotateCcw />,
			onSelect: captions.resetEdits,
		},
		{
			key: "remove",
			label: "Remove captions",
			icon: <Trash2 />,
			variant: "destructive",
			onSelect: onRemove,
		},
	]);
}
