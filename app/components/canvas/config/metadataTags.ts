import {
	type DeepPartial,
	type Metadata,
	MetadataVoiceSchema,
} from "@/lib/project/types";

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
			Object.assign((p.narration ??= {}), MetadataVoiceSchema.parse(attrs));
		},
	},
	metadata_character: {
		apply: (p, attrs, text) => {
			const { name } = attrs;
			if (!name) return;
			(p.characters ??= {})[name] = {
				appearance: text,
				...MetadataVoiceSchema.parse(attrs),
			};
		},
	},
};

export type MetadataTagType = keyof typeof METADATA_TAG_CONFIGS;
export const METADATA_TAG_TYPES = new Set(Object.keys(METADATA_TAG_CONFIGS));
