import type { ModelRef } from "@/lib/connectors/types";
import type { ProjectData } from "@/lib/project/store";
import { metadataVoiceFor, pickedVoiceIdOn } from "@/lib/project/types";
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

/** The voice as an element on a pair reads it: the id picked for that pair, if any. */
export const forVoice =
	(characterName: string | undefined, model: ModelRef): NodeSpec =>
	(state) => {
		const voice = metadataVoiceFor(state.metadata, characterName);
		return sourceNode(
			`project:voice:${characterName ?? "narrator"}`,
			{ voiceId: (voice && pickedVoiceIdOn(voice, model)) ?? "" },
			`${characterName ?? "the narrator"}'s voice`,
		);
	};

export const aspectDimensions = (state: ProjectData) =>
	ASPECT_RATIO_DIMENSIONS[state.metadata.videoSettings.aspectRatio];
