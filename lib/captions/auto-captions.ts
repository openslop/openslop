import uniqBy from "lodash/uniqBy";
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
import { captionableSequences } from "@/lib/render/caption-rule";
import type { RenderLayout } from "@/lib/render/types";
import { captionsEdited } from "./caption-edits";
import { captionsNode, captionsNodeId } from "./captions-job";

type Clip = Pick<ContentElement, "id" | "type">;

type GetSnapshot = (id: string) => ElementSnapshot;

type SkippedClip = { id: string; reason: string };

export type CaptionsReport = { queued: string[]; skipped: SkippedClip[] };

/** Every clip on the timeline that would show captions. */
export const captionableClips = (
	layout: Pick<RenderLayout, "series" | "sequences">,
): Clip[] =>
	uniqBy(
		captionableSequences(layout).map(({ element }) => element),
		"id",
	);

export const withoutCaptions = (clips: Clip[], getSnapshot: GetSnapshot) =>
	clips.filter(
		({ id }) => getSnapshot(id).result?.textTimestamps === undefined,
	);

export const isCaptioning = (getSnapshot: GetSnapshot, id: string) =>
	isGenerationActive(getSnapshot(captionsNodeId(id)).status);

function skipReason(
	{ id, type }: Clip,
	getSnapshot: GetSnapshot,
): string | undefined {
	if (!isCaptionable(type)) return "never shows captions";
	const { status, result } = getSnapshot(id);
	if (!result) return "has no result yet";
	if (isGenerationActive(status)) return "is generating";
	if (isCaptioning(getSnapshot, id)) return "is already being captioned";
	if (captionsEdited(result)) return "has hand-edited captions";
}

export function planCaptions(
	clips: Clip[],
	getSnapshot: GetSnapshot,
): { ready: Clip[]; skipped: SkippedClip[] } {
	const ready: Clip[] = [];
	const skipped: SkippedClip[] = [];
	for (const clip of clips) {
		const reason = skipReason(clip, getSnapshot);
		if (reason) skipped.push({ id: clip.id, reason });
		else ready.push(clip);
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

/** Queues speech to text on every clip it can run on now, and says why it skipped the rest. */
export function captionClips(
	queue: GenerationQueue,
	clips: Clip[],
	model: ModelRef,
	projectId: string,
): CaptionsReport {
	const { ready, skipped } = planCaptions(clips, queue.getElementSnapshot);
	enqueueCaptions(queue, ready, model, projectId);
	return { queued: ready.map(({ id }) => id), skipped };
}
