import { resolveModel } from "@/lib/connectors/models";
import type { ModelPick } from "@/lib/connectors/types";
import type { ProjectData } from "@/lib/project/store";
import { metadataVoiceFor } from "@/lib/project/types";
import { ASPECT_RATIO_DIMENSIONS } from "@/lib/project/aspectRatio";
import { sourceNode, type NodeSpec } from "./graph";

/**
 * Leaves of the graph. A plugin that declares one inherits staleness on every
 * change to it, which is what keeps reads from drifting out of the inputs.
 */
export const forReferenceImages: NodeSpec = ({ state }) => ({
	node: sourceNode("project:referenceImages", {
		urls: state.referenceImages.join(","),
	}),
	label: "the reference images",
});

export const forArtStyle: NodeSpec = ({ state }) => ({
	node: sourceNode("project:artStyle", { style: state.metadata.style.trim() }),
	label: "the art style",
});

export const forAspectRatio: NodeSpec = ({ state }) => ({
	node: sourceNode("project:aspectRatio", {
		aspectRatio: state.metadata.videoSettings.aspectRatio,
	}),
	label: "the aspect ratio",
});

export const voiceNodeId = (characterName?: string) =>
	`project:voice:${characterName ?? "narrator"}`;

/**
 * What an element reads of its voice: the id picked for it and the pair it
 * speaks with, which is the voice's own pair or else the first candidate's.
 * The id a search found is left out, since recording it would stale the
 * element that just found it.
 */
export const forVoice =
	(
		characterName: string | undefined,
		...candidates: (ModelPick | undefined)[]
	): NodeSpec =>
	({ state }) => {
		const voice = metadataVoiceFor(state.metadata, characterName);
		const model = resolveModel("tts", voice, ...candidates);
		return {
			node: sourceNode(voiceNodeId(characterName), {
				voiceId: voice?.voiceId ?? "",
				...model,
			}),
			label: `${characterName ?? "the narrator"}'s voice`,
		};
	};

export const aspectDimensions = (state: ProjectData) =>
	ASPECT_RATIO_DIMENSIONS[state.metadata.videoSettings.aspectRatio];
