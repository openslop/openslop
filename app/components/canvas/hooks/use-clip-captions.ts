import { useCallback } from "react";
import { useSlateStatic } from "slate-react";
import { captionsNode, captionsNodeId } from "@/lib/captions/captions-job";
import { removeCaptions, resetCaptions } from "@/lib/captions/caption-edits";
import type { ElementRef, GeneratedElement } from "@/lib/canvas/types";
import { resolveModel } from "@/lib/connectors/models";
import type { AssetResult } from "@/lib/connectors/types";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/generation-queue-provider";

/** Queues speech to text on each clip's take, with the project's Speech to Text pick at the time. */
export function useQueueSTT() {
	const queue = useGenerationQueue();
	const editor = useSlateStatic();
	return useCallback(
		(clips: ElementRef[]) => {
			const model = resolveModel("stt", editor.defaultModels().stt);
			queue.enqueueGraph(
				clips.flatMap((clip) => {
					const take = queue.getElementSnapshot(clip.id).result;
					return take ? [captionsNode(clip, take, model)] : [];
				}),
			);
		},
		[queue, editor],
	);
}

export function useClipCaptions(
	element: GeneratedElement,
	clip: AssetResult | null,
) {
	const queue = useGenerationQueue();
	const queueSTT = useQueueSTT();
	const { status, error } = useQueueSelector((q) =>
		q.getElementSnapshot(captionsNodeId(element.id)),
	);
	const revise = (change: (result: AssetResult) => AssetResult) => () =>
		queue.reviseResult(element, change);

	return {
		captioned: clip?.textTimestamps !== undefined,
		edited: Boolean(clip?.generatedTextTimestamps),
		status,
		error,
		generate: () => queueSTT([element]),
		remove: revise(removeCaptions),
		reset: revise(resetCaptions),
	};
}
