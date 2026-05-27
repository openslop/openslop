import type { Metadata } from "@/lib/project/types";
import { compact } from "lodash";
import type { CanvasContentElement, CanvasElementType } from "../types";

type MetadataInputResolver = (
	element: CanvasContentElement,
	metadata: Metadata,
) => Record<string, string>;

function parseNames(raw: string | undefined = ""): string[] {
	return compact(raw.split(",").map((s) => s.trim()));
}

const characterAvatars: MetadataInputResolver = (element, metadata) => {
	const names = parseNames(element.customAttributes?.characters).sort();
	const urls = compact(
		names.map((name) => metadata.characters[name]?.avatarUrl),
	);
	const result: Record<string, string> = {};
	if (urls.length > 0) result.characterAvatars = urls.join(",");
	return result;
};

const characterVoiceId: MetadataInputResolver = (element, metadata) => {
	const name = element.customAttributes?.name;
	const voiceId = name ? metadata.characters[name]?.voiceId : undefined;
	const result: Record<string, string> = {};
	if (voiceId !== undefined) result.voiceId = voiceId;
	return result;
};

const narratorVoiceId: MetadataInputResolver = (_element, metadata) => {
	const { voiceId } = metadata.narration;
	const result: Record<string, string> = {};
	if (voiceId !== undefined) result.voiceId = voiceId;
	return result;
};

export const ELEMENT_METADATA_INPUTS: Partial<
	Record<CanvasElementType, MetadataInputResolver>
> = {
	image: characterAvatars,
	animated_image: characterAvatars,
	character: characterVoiceId,
	narration: narratorVoiceId,
};
