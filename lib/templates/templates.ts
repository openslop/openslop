import { celebrityDeath } from "./data/celebrity-death";
import { financeTips } from "./data/finance-tips";
import { povFinancialLifestyle } from "./data/pov-financial-lifestyle";
import { povLife } from "./data/pov-life";
import { sleepStory } from "./data/sleep-story";
import { stickExplainer } from "./data/stick-explainer";
import { trueCrime } from "./data/true-crime";
import type { ArtStyle } from "@/lib/project/art-styles";
import type { Voice } from "@/lib/project/types";
import type { VideoLength } from "@/lib/project/video-length";

export interface TemplateShowcase {
	image: string;
	title: string;
	description: string;
	examplePrompt: string;
}

type TemplateCharacter = Voice & {
	appearance: string;
	avatar?: string;
};

export interface Template {
	id: string;
	name: string;
	/** The sentence opener the pill shows and the user's brief starts with. */
	promptPrefix: string;
	color: string;
	exampleText: string;
	systemPrompt: string;
	length: VideoLength;
	style: ArtStyle;
	referenceImages: string[];
	characters?: Record<string, TemplateCharacter>;
	narration: Voice;
	showcase: TemplateShowcase;
}

export const TEMPLATES: Template[] = [
	povLife,
	sleepStory,
	financeTips,
	trueCrime,
	povFinancialLifestyle,
	celebrityDeath,
	stickExplainer,
];

const TEMPLATE_MAP = new Map<string | undefined, Template>(
	TEMPLATES.map((t) => [t.id, t]),
);

/** Lookup for a stored id, where a miss is a template that has left the catalog. */
export function getTemplateById(id: string | undefined): Template | undefined {
	return TEMPLATE_MAP.get(id);
}

/** Lookup for ids sourced from `TEMPLATES`, where a miss is a programming error. */
export function getTemplate(id: string): Template {
	const template = TEMPLATE_MAP.get(id);
	if (!template) throw new Error(`Unknown template id "${id}"`);
	return template;
}
