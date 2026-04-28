import type { DeepPartial, Metadata } from "@/lib/project/types";

export type MetadataTagConfig = {
	apply: (
		partial: DeepPartial<Metadata>,
		attrs: Record<string, string>,
		text: string,
	) => void;
};

export const METADATA_TAG_CONFIGS: Record<string, MetadataTagConfig> = {
	metadata_style: {
		apply: (p, _attrs, text) => {
			if (text) p.style = text;
		},
	},
	metadata_narration: {
		apply: (p, attrs) => {
			const { id: _id, ...rest } = attrs;
			Object.assign((p.narration ??= {}), rest);
		},
	},
	metadata_character: {
		apply: (p, attrs, text) => {
			const { name, id: _id, ...voice } = attrs;
			if (!name || !text) return;
			(p.characters ??= {})[name] = { description: text, ...voice };
		},
	},
};

export type MetadataTagType = keyof typeof METADATA_TAG_CONFIGS;
export const METADATA_TAG_TYPES = new Set(Object.keys(METADATA_TAG_CONFIGS));
