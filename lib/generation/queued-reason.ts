import uniq from "lodash/uniq";
import { namedList } from "@/lib/format";
import type { AssetConnectorType } from "../connectors/types";
import type { GenerationNode } from "./graph";
import type { GenerationQueue } from "./queue";

const MEDIA_NAMES: Record<AssetConnectorType, string> = {
	image: "image",
	video: "video",
	tts: "speech",
	voice: "voice",
	music: "music",
	sfx: "sound effect",
	stt: "transcription",
};

/** The blockers at the bottom of `node`'s chain, past any still queued behind their own. */
function waitingFor(node: GenerationNode, queue: GenerationQueue): string[] {
	return uniq(
		queue.blockingDependencies(node).flatMap(([label, dep]) => {
			const pending = queue.pendingNode(dep.id);
			const deeper = pending ? waitingFor(pending, queue) : [];
			return deeper.length > 0 ? deeper : [label];
		}),
	);
}

/** Why a queued element hasn't started, naming dependencies that often have no card on the canvas. */
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
