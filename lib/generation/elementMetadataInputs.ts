import { compact } from "lodash";
import { parseCharacterNames } from "@/lib/canvas/characterNames";
import type {
	CanvasContentElement,
	CanvasElementType,
} from "@/lib/canvas/types";
import type { Metadata } from "@/lib/project/types";
import {
	ASPECT_RATIO_DIMENSIONS,
	DEFAULT_ASPECT_RATIO,
} from "@/lib/video/aspectRatio";

type MetadataAttributes = (
	element: CanvasContentElement,
	metadata: Metadata,
) => Record<string, string | number>;

const NONE: Record<string, string | number> = {};

const characterAvatars: MetadataAttributes = (element, metadata) => {
	const urls = compact(
		parseCharacterNames(element.customAttributes?.characters)
			.sort()
			.map((name) => metadata.characters[name]?.avatarUrl),
	);
	return urls.length ? { characterAvatars: urls.join(",") } : NONE;
};

const characterVoiceId: MetadataAttributes = (element, metadata) => {
	const name = element.customAttributes?.name;
	const voiceId = name ? metadata.characters[name]?.voiceId : undefined;
	return voiceId ? { voiceId } : NONE;
};

const narratorVoiceId: MetadataAttributes = (_, { narration }) =>
	narration.voiceId ? { voiceId: narration.voiceId } : NONE;

const getAspectDims = (metadata: Metadata) =>
	ASPECT_RATIO_DIMENSIONS[
		metadata.videoSettings?.aspectRatio ?? DEFAULT_ASPECT_RATIO
	];

const imageDims: MetadataAttributes = (_, metadata) =>
	getAspectDims(metadata).image;

const videoDims: MetadataAttributes = (_, metadata) =>
	getAspectDims(metadata).video;

const animatedImageDims: MetadataAttributes = (_, metadata) => {
	const { image, video } = getAspectDims(metadata);
	return {
		width: image.width,
		height: image.height,
		videoWidth: video.width,
		videoHeight: video.height,
	};
};

const combine =
	(...fns: MetadataAttributes[]): MetadataAttributes =>
	(element, metadata) =>
		Object.assign({}, ...fns.map((fn) => fn(element, metadata)));

export const ELEMENT_METADATA_INPUTS: Partial<
	Record<CanvasElementType, MetadataAttributes>
> = {
	image: combine(imageDims, characterAvatars),
	animated_image: combine(animatedImageDims, characterAvatars),
	clip: videoDims,
	character: characterVoiceId,
	narration: narratorVoiceId,
};
