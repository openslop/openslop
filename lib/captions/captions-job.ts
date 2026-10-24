import type { ElementRef } from "@/lib/canvas/types";
import type { AssetResult, ModelRef } from "@/lib/connectors/types";
import type { GenerationNode, NodeId } from "@/lib/generation/graph";
import type { GenerationQueue } from "@/lib/generation/queue";
import { isGenerationActive } from "@/lib/generation/snapshots";
import type { CommittedVersion } from "@/lib/generation/versions";
import { withSTTResult } from "./caption-edits";

const SUFFIX = ":captions";

export const captionsNodeId = (clipId: string): NodeId => `${clipId}${SUFFIX}`;

const clipOf = (id: NodeId) =>
	id.endsWith(SUFFIX) ? id.slice(0, -SUFFIX.length) : null;

const soundOf = (take: AssetResult) => take.videoUrl ?? take.audioUrl;

/** Runs speech to text on the take `clip` holds now, so captioning never remakes the clip. */
export function captionsNode(
	clip: ElementRef,
	take: AssetResult,
	model: ModelRef,
): GenerationNode {
	const mediaUrl = soundOf(take);
	if (!mediaUrl) throw new Error("This clip has no sound to caption");
	return {
		id: captionsNodeId(clip.id),
		inputs: { prompt: "", attributes: { mediaUrl }, reads: {} },
		dependsOn: {},
		job: {
			elementType: clip.type,
			connectorType: "stt",
			model,
			config: {},
		},
	};
}

/** Records each commit, but lands speech to text on its clip instead of keeping it as a version. */
export const withCaptionsLanding =
	(queue: GenerationQueue, record: (version: CommittedVersion) => void) =>
	(version: CommittedVersion) => {
		const clipId = clipOf(version.elementId);
		if (!clipId) return record(version);
		const clip = queue.getElementSnapshot(clipId);
		if (
			!clip.result ||
			isGenerationActive(clip.status) ||
			soundOf(clip.result) !== version.inputs.attributes.mediaUrl
		) {
			queue.setError(
				version.elementId,
				"The clip changed while it was captioned",
			);
			return;
		}
		queue.reviseResult({ id: clipId, type: version.elementType }, (current) =>
			withSTTResult(current, version.result),
		);
		queue.discard(version.elementId);
	};
