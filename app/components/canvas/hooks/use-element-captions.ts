import { useCallback } from "react";
import { useSlateStatic } from "slate-react";
import { enqueueCaptions } from "@/lib/captions/auto-captions";
import { captionsNodeId } from "@/lib/captions/captions-job";
import {
	captionsEdited,
	replaceCaptions,
	resetCaptions,
} from "@/lib/captions/caption-edits";
import type { ElementRef, GeneratedElement } from "@/lib/canvas/types";
import { resolveModel } from "@/lib/connectors/models";
import type { AssetResult } from "@/lib/connectors/types";
import { useProjectId } from "@/lib/project/project-provider";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/generation-queue-provider";

/** Generates speech to text on each element's result, with the project's Speech to Text pick at the time. */
export function useGenerateSTT() {
	const queue = useGenerationQueue();
	const editor = useSlateStatic();
	const projectId = useProjectId();
	return useCallback(
		(elements: ElementRef[]) =>
			enqueueCaptions(
				queue,
				elements,
				resolveModel("stt", editor.defaultModels().stt),
				projectId,
			),
		[queue, editor, projectId],
	);
}

export function useElementCaptions(
	element: GeneratedElement,
	result: AssetResult | null,
) {
	const queue = useGenerationQueue();
	const generateSTT = useGenerateSTT();
	const { status, error } = useQueueSelector((q) =>
		q.getElementSnapshot(captionsNodeId(element.id)),
	);
	return {
		captioned: result?.textTimestamps !== undefined,
		edited: result ? captionsEdited(result) : false,
		status,
		error,
		generate: () => generateSTT([element]),
		remove: () =>
			queue.reviseResult(element, (current) => replaceCaptions(current)),
		reset: () => queue.reviseResult(element, resetCaptions),
	};
}
