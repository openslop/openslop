import uniq from "lodash/uniq";
import type { AssetConnectorType } from "../connectors/types";
import type { GenerationNode } from "./graph";
import type { GenerationQueue } from "./queue";
import { namedList } from "./stale-reason";

const MEDIA_NAMES: Record<AssetConnectorType, string> = {
	image: "image",
	video: "video",
	tts: "speech",
	voice: "voice",
	music: "music",
	sfx: "sound effect",
	stt: "transcription",
};

/** What is actually holding `node` back: a blocker still queued behind its own dependencies gives way to those. */
function waitingFor(node: GenerationNode, queue: GenerationQueue): string[] {
	return uniq(
		queue.blockingDependencies(node).flatMap(([label, dep]) => {
			const pending = queue.pendingNode(dep.id);
			const deeper = pending ? waitingFor(pending, queue) : [];
			return deeper.length > 0 ? deeper : [label];
		}),
	);
}

/**
 * Why a queued element hasn't started, in the user's terms: a dependency often
 * has no card on the canvas, so naming it is the point. `null` means not waiting.
 */
export function queuedReason(
	id: string,
	queue: GenerationQueue,
): string | null {
	const node = queue.pendingNode(id);
	if (!node) return null;
	const blockers = waitingFor(node, queue);
	if (blockers.length > 0) return `Waiting for ${namedList(blockers)}`;
	const { connectorType } = node.job;
	if (queue.hasCapacity(connectorType)) return null;
	const limit = queue.limitFor(connectorType);
	return `Waiting for a free ${MEDIA_NAMES[connectorType]} slot (${limit} running)`;
}
