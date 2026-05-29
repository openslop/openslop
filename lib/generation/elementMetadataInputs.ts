import { compact } from "lodash";
import type {
	CanvasContentElement,
	CanvasElementType,
} from "@/lib/canvas/types";
import type { Metadata } from "@/lib/project/types";

type MetadataAttributes = (
	element: CanvasContentElement,
	metadata: Metadata,
) => Record<string, string>;

const NONE: Record<string, string> = {};

const characterAvatars: MetadataAttributes = (element, metadata) => {
	const urls = compact(
		compact(
			(element.customAttributes?.characters ?? "")
				.split(",")
				.map((s) => s.trim()),
		)
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

export const ELEMENT_METADATA_INPUTS: Partial<
	Record<CanvasElementType, MetadataAttributes>
> = {
	image: characterAvatars,
	animated_image: characterAvatars,
	character: characterVoiceId,
	narration: narratorVoiceId,
};
