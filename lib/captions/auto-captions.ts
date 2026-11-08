import type { Descendant } from "slate";
import { getContentElements } from "@/lib/canvas/scenes";
import {
	isCaptionable,
	type ContentElement,
	type ElementRef,
} from "@/lib/canvas/types";
import type { ModelRef } from "@/lib/connectors/types";
import type { GenerationQueue } from "@/lib/generation/queue";
import {
	isGenerationActive,
	type ElementSnapshot,
} from "@/lib/generation/snapshots";
import { captionsEdited } from "./caption-edits";
import { captionsNode, captionsNodeId } from "./captions-job";

type ContentRef = Pick<ContentElement, "id" | "type">;

type GetSnapshot = (id: string) => ElementSnapshot;

type SkippedElement = { id: string; reason: string };

export type CaptionsReport = { queued: string[]; skipped: SkippedElement[] };

export const captionableElements = (nodes: Descendant[]): ContentElement[] =>
	getContentElements(nodes).filter(({ type }) => isCaptionable(type));

export const withoutCaptions = (
	elements: ContentRef[],
	getSnapshot: GetSnapshot,
) =>
	elements.filter(
		({ id }) => getSnapshot(id).result?.textTimestamps === undefined,
	);

export const isCaptioning = (getSnapshot: GetSnapshot, id: string) =>
	isGenerationActive(getSnapshot(captionsNodeId(id)).status);

function skipReason(
	{ id, type }: ContentRef,
	getSnapshot: GetSnapshot,
): string | undefined {
	if (!isCaptionable(type)) return "never shows captions";
	const { status, result } = getSnapshot(id);
	if (!result) return "isn't generated yet";
	if (isGenerationActive(status)) return "is still generating";
	if (isCaptioning(getSnapshot, id)) return "is already being captioned";
	if (captionsEdited(result)) return "has hand-edited captions";
}

export function planCaptions(
	elements: ContentRef[],
	getSnapshot: GetSnapshot,
): { ready: ContentRef[]; skipped: SkippedElement[] } {
	const ready: ContentRef[] = [];
	const skipped: SkippedElement[] = [];
	for (const element of elements) {
		const reason = skipReason(element, getSnapshot);
		if (reason) skipped.push({ id: element.id, reason });
		else ready.push(element);
	}
	return { ready, skipped };
}

/** Runs speech to text on the result each element holds now. */
export function enqueueCaptions(
	queue: GenerationQueue,
	elements: ElementRef[],
	model: ModelRef,
	projectId: string,
) {
	queue.enqueueGraph(
		elements.map((element) => {
			const { result } = queue.getElementSnapshot(element.id);
			if (!result)
				throw new Error(`Element "${element.id}" has nothing to caption`);
			return captionsNode(element, result, model, projectId);
		}),
	);
}

/** Queues speech to text on every element it can run on now, and says why it skipped the rest. */
export function captionElements(
	queue: GenerationQueue,
	elements: ContentRef[],
	model: ModelRef,
	projectId: string,
): CaptionsReport {
	const { ready, skipped } = planCaptions(elements, queue.getElementSnapshot);
	enqueueCaptions(queue, ready, model, projectId);
	return { queued: ready.map(({ id }) => id), skipped };
}
