import type { ProjectData } from "@/lib/project/store";
import { metadataVoiceFor } from "@/lib/project/types";
import { ASPECT_RATIO_DIMENSIONS } from "@/lib/video/aspectRatio";
import { sourceNode, type NodeSpec } from "./graph";

/**
 * Leaves of the graph. A plugin that declares one inherits staleness on every
 * change to it, which is what keeps reads from drifting out of the inputs.
 */
export const forReferenceImages: NodeSpec = (state) =>
	sourceNode(
		"project:referenceImages",
		{ urls: state.referenceImages.join(",") },
		"the reference images",
	);

export const forArtStyle: NodeSpec = (state) =>
	sourceNode(
		"project:artStyle",
		{ style: state.metadata.style.trim() },
		"the art style",
	);

export const forAspectRatio: NodeSpec = (state) =>
	sourceNode(
		"project:aspectRatio",
		{ aspectRatio: state.metadata.videoSettings.aspectRatio },
		"the aspect ratio",
	);

export const forVoice =
	(characterName?: string): NodeSpec =>
	(state) => {
		const voice = metadataVoiceFor(state.metadata, characterName);
		return sourceNode(
			`project:voice:${characterName ?? "narrator"}`,
			{
				voiceId: voice?.voiceId ?? "",
				provider: voice?.provider ?? "",
				model: voice?.model ?? "",
			},
			`${characterName ?? "the narrator"}'s voice`,
		);
	};

export const aspectDimensions = (state: ProjectData) =>
	ASPECT_RATIO_DIMENSIONS[state.metadata.videoSettings.aspectRatio];
