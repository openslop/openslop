import type { ProjectData } from "@/lib/project/store";
import { ASPECT_RATIO_DIMENSIONS } from "@/lib/video/aspectRatio";
import { sourceNode, type NodeSpec } from "./graph";

/**
 * Leaves of the graph. A plugin that declares one inherits staleness on every
 * change to it, which is what keeps reads from drifting out of the inputs.
 */
export const forReferenceImages: NodeSpec = (state) =>
	sourceNode("project:referenceImages", {
		urls: state.referenceImages.join(","),
	});

export const forArtStyle: NodeSpec = (state) =>
	sourceNode("project:artStyle", { style: state.metadata.style.trim() });

export const forAspectRatio: NodeSpec = (state) =>
	sourceNode("project:aspectRatio", {
		aspectRatio: state.metadata.videoSettings.aspectRatio,
	});

export const forVoice =
	(characterName?: string): NodeSpec =>
	(state) => {
		const { narration, characters } = state.metadata;
		const voice = characterName ? characters[characterName] : narration;
		return sourceNode(`project:voice:${characterName ?? "narrator"}`, {
			voiceId: voice?.voiceId ?? "",
		});
	};

export const aspectDimensions = (state: ProjectData) =>
	ASPECT_RATIO_DIMENSIONS[state.metadata.videoSettings.aspectRatio];
