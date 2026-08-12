import {
	MetadataVoiceSchema,
	type DeepPartial,
	type Metadata,
} from "@/lib/project/types";
import { getElementText } from "./osmlSerializer";
import type { ParsedElement } from "./types";

type MetadataTagReader = (
	metadata: DeepPartial<Metadata>,
	attrs: Record<string, string>,
	text: string,
) => void;

const METADATA_TAGS: Record<string, MetadataTagReader> = {
	metadata_title: (metadata, _attrs, text) => {
		if (text) metadata.title = text;
	},
	metadata_style: (metadata, _attrs, text) => {
		if (text) metadata.style = text;
	},
	metadata_narration: (metadata, attrs) => {
		Object.assign(
			(metadata.narration ??= {}),
			MetadataVoiceSchema.parse(attrs),
		);
	},
	metadata_character: (metadata, attrs, text) => {
		const { name } = attrs;
		if (!name) return;
		(metadata.characters ??= {})[name] = {
			appearance: text,
			...MetadataVoiceSchema.parse(attrs),
		};
	},
};

/**
 * Projects the `metadata_*` tags of a parsed OSML node list into a project
 * metadata patch. Nodes of any other type (canvas elements) are ignored, so
 * this and `isParsedContentElement` split one node list into its two halves.
 */
export function collectMetadata(nodes: ParsedElement[]): DeepPartial<Metadata> {
	const metadata: DeepPartial<Metadata> = {};
	for (const node of nodes) {
		METADATA_TAGS[node.type]?.(
			metadata,
			node.customAttributes ?? {},
			getElementText(node).trim(),
		);
	}
	return metadata;
}

export function collectWritableMetadata(
	nodes: ParsedElement[],
	stored: Metadata,
): DeepPartial<Metadata> {
	const patch = collectMetadata(nodes);

	// Once the user sets these, the LLM-generated script shouldn't overwrite them
	if (stored.style.trim()) delete patch.style;
	if (stored.narration.language) delete patch.narration?.language;
	return patch;
}
