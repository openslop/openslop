import type { ElementRef } from "@/lib/canvas/types";
import type { AssetResult, ModelRef } from "@/lib/connectors/types";
import type { GenerationNode, NodeId } from "@/lib/generation/graph";
import { replaceCaptions } from "./caption-edits";

export const captionsNodeId = (elementId: string): NodeId =>
	`captions:${elementId}`;

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
		lands: {
			on: element,
			revise: (current, { textTimestamps }) => {
				if (soundOf(current) !== mediaUrl)
					throw new Error("The clip changed while it was captioned");
				if (!textTimestamps)
					throw new Error("This speech to text result has no words");
				return replaceCaptions(current, textTimestamps);
			},
		},
	};
}
