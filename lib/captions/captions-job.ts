import type { ElementRef } from "@/lib/canvas/types";
import type { AssetResult, ModelRef } from "@/lib/connectors/types";
import type { GenerationNode, NodeId } from "@/lib/generation/graph";
import type { GenerationQueue } from "@/lib/generation/queue";
import { isGenerationActive } from "@/lib/generation/snapshots";
import type { CommittedVersion } from "@/lib/generation/versions";
import { withSTTResult } from "./caption-edits";

const SUFFIX = ":captions";

export const captionsNodeId = (elementId: string): NodeId =>
	`${elementId}${SUFFIX}`;

const captionedOf = (id: NodeId) =>
	id.endsWith(SUFFIX) ? id.slice(0, -SUFFIX.length) : null;

const soundOf = (result: AssetResult) => result.videoUrl ?? result.audioUrl;

/** Runs speech to text on the result `element` holds now, so captioning never regenerates it. */
export function captionsNode(
	element: ElementRef,
	result: AssetResult,
	model: ModelRef,
): GenerationNode {
	const mediaUrl = soundOf(result);
	if (!mediaUrl) throw new Error("This clip has no sound to caption");
	return {
		id: captionsNodeId(element.id),
		inputs: { prompt: "", attributes: { mediaUrl }, reads: {} },
		dependsOn: {},
		job: {
			elementType: element.type,
			connectorType: "stt",
			model,
			config: {},
		},
	};
}

/** Records each commit, but lands speech to text on its element instead of keeping it as a version. */
export const withCaptionsLanding =
	(queue: GenerationQueue, record: (version: CommittedVersion) => void) =>
	(version: CommittedVersion) => {
		const elementId = captionedOf(version.elementId);
		if (!elementId) return record(version);
		const captioned = queue.getElementSnapshot(elementId);
		if (
			!captioned.result ||
			isGenerationActive(captioned.status) ||
			soundOf(captioned.result) !== version.inputs.attributes.mediaUrl
		) {
			queue.setError(
				version.elementId,
				"The clip changed while it was captioned",
			);
			return;
		}
		queue.reviseResult(
			{ id: elementId, type: version.elementType },
			(current) => withSTTResult(current, version.result),
		);
		queue.discard(version.elementId);
	};
