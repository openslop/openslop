import uniq from "lodash/uniq";
import { namedList } from "@/lib/format";
import type { AssetConnectorType } from "../connectors/types";
import type { GenerationNode } from "./graph";
import type { GenerationQueue } from "./queue";

const MEDIA_NAMES: Record<AssetConnectorType, string> = {
	image: "images",
	video: "videos",
	tts: "voice lines",
	voice: "voices",
	music: "music tracks",
	sfx: "sound effects",
	stt: "transcriptions",
};

/** The blockers at the bottom of `node`'s chain, past any still queued behind their own. */
function waitingFor(node: GenerationNode, queue: GenerationQueue): string[] {
	return uniq(
		queue.blockingDependencies(node).flatMap(([label, dep]) => {
			const deeper = waitingFor(dep, queue);
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
	return `On hold, waiting for other ${MEDIA_NAMES[connectorType]} to finish`;
}
