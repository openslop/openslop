import { celebrityDeath } from "./data/celebrity-death";
import { financeTips } from "./data/finance-tips";
import { povFinancialLifestyle } from "./data/pov-financial-lifestyle";
import { povLife } from "./data/pov-life";
import { sleepStory } from "./data/sleep-story";
import { stickExplainer } from "./data/stick-explainer";
import { trueCrime } from "./data/true-crime";
import { z } from "zod";
import { BLOB_BASE_URL } from "@/lib/blob";
import { VoiceSchema } from "@/lib/project/types";
import { VIDEO_LENGTHS } from "@/lib/project/video-length";

const text = z.string().min(1);
const templateAsset = text.transform(
	(name) => `${BLOB_BASE_URL}/assets/upload/template/${name}`,
);
const voice = VoiceSchema.extend({
	gender: VoiceSchema.shape.gender.unwrap(),
	age: VoiceSchema.shape.age.unwrap(),
	pitch: VoiceSchema.shape.pitch.unwrap(),
	accent: VoiceSchema.shape.accent.unwrap(),
	description: VoiceSchema.shape.description.unwrap(),
	language: VoiceSchema.shape.language.unwrap(),
	pickedVoiceId: VoiceSchema.shape.pickedVoiceId.unwrap(),
	provider: VoiceSchema.shape.provider.unwrap(),
	model: VoiceSchema.shape.model.unwrap(),
}).strict();

export const TemplateSchema = z.strictObject({
	id: text,
	name: text,
	/** The sentence opener the pill shows and the user's brief starts with. */
	promptPrefix: text,
	color: z.string().regex(/^#[\da-f]{6}$/i),
	exampleText: text,
	systemPrompt: text,
	length: z.enum(VIDEO_LENGTHS),
	style: z.strictObject({
		description: text,
		thumbnail: templateAsset.optional(),
	}),
	referenceImages: z.array(templateAsset),
	characters: z
		.record(
			text,
			voice.extend({ appearance: text, avatar: templateAsset.optional() }),
		)
		.optional(),
	narration: voice,
	showcase: z.strictObject({
		image: templateAsset,
		title: text,
		description: text,
		examplePrompt: text,
	}),
});

export type TemplateInput = z.input<typeof TemplateSchema>;
export type Template = z.infer<typeof TemplateSchema>;

export const TEMPLATES = z
	.array(TemplateSchema)
	.parse([
		povLife,
		sleepStory,
		financeTips,
		trueCrime,
		povFinancialLifestyle,
		celebrityDeath,
		stickExplainer,
	]);

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
