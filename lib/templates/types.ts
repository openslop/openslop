import { BLOB_BASE_URL } from "@/lib/blob";
import type { MetadataCharacter, MetadataVoice } from "@/lib/project/types";

export const templateAsset = (name: string) =>
	`${BLOB_BASE_URL}/assets/upload/template/${name}`;

export interface TemplateShowcase {
	image: string;
	title: string;
	description: string;
	examplePrompt: string;
}

export interface Template {
	id: string;
	name: string;
	pillText: string;
	color: string;
	exampleText: string;
	systemPrompt: string;
	style?: string;
	referenceImages: string[];
	characters?: Record<string, MetadataCharacter>;
	narration?: MetadataVoice;
	showcase?: TemplateShowcase;
}
