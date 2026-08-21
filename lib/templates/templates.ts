import { BLOB_BASE_URL } from "@/lib/blob";
import type { ArtStyle } from "@/lib/project/artStyles";
import type { MetadataCharacter, MetadataVoice } from "@/lib/project/types";
import type { VideoLength } from "@/lib/video/videoLength";

const templateAsset = (name: string) =>
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
	/** The sentence opener the pill shows and the user's brief starts with. */
	promptPrefix: string;
	color: string;
	length: VideoLength;
	style?: ArtStyle;
	referenceImages: string[];
	characters?: Record<string, MetadataCharacter>;
	/** Prebuilt avatars, seeded as the character avatar nodes' results. */
	characterAvatars?: Record<string, string>;
	narration?: MetadataVoice;
	showcase?: TemplateShowcase;
}

export const TEMPLATES: Template[] = [
	{
		id: "pov-life",
		length: "5-10m",
		name: "POV Life",
		promptPrefix: "POV: Your life at every stage as a",
		color: "#F59E0B",
		style: {
			description:
				"2D cartoon illustration, thick black outlines, muted desaturated colors, cinematic night lighting, flat shading, western animation style, no gradients",
		},
		referenceImages: [
			templateAsset("pov-life-stages-2"),
			templateAsset("pov-life-stages-3"),
		],
		characters: {
			Protagonist: {
				description: "American male, neutral accent",
				appearance:
					"male, average build, slightly hunched posture, bald, wearing a worn olive green jacket, grey t-shirt underneath, faded blue jeans, brown work boots",
			},
		},
		characterAvatars: { Protagonist: templateAsset("pov-life-stages-4") },
		narration: {
			gender: "masculine",
			age: "adult",
			pitch: "medium",
			accent: "american",
			description: "wise",
		},
		showcase: {
			image: templateAsset("pov-life-stages-1"),
			title: "POV Your Life as A...",
			description:
				"Long-form, second-person POV voiceover with cartoon illustrations that walk a viewer through ascending stages of a role, career, or world",
			examplePrompt: "tech CEO",
		},
	},
	{
		id: "sleep-story",
		length: "5-10m",
		name: "Sleep Story",
		promptPrefix: "A sleep story about",
		color: "#6366F1",
		referenceImages: [
			templateAsset("sleep-story-1"),
			templateAsset("sleep-story-3"),
			templateAsset("sleep-story-4"),
		],
		narration: {
			gender: "masculine",
			accent: "british",
			age: "child",
			description: "Wistful, young male for emotional narrations",
			voiceId: "4f7f1324-1853-48a6-b294-4e78e8036a83",
		},
		showcase: {
			image: templateAsset("sleep-story-1"),
			title: "Get Sleepy with...",
			description:
				"Long-form, slow, soothing narration designed to lull listeners to sleep",
			examplePrompt: "a cat who wanders around gardens at night",
		},
	},
	{
		id: "finance-tips",
		length: "5-10m",
		name: "Finance Tips",
		promptPrefix: "Finance tips for",
		color: "#3B82F6",
		style: {
			description:
				"Flat 2D cartoon, bold black outlines, cel-shaded flat colors, oversized rounded heads with prominent chins, small oval eyes, bean-shaped bodies, stubby limbs. Vector-style props with thick outlines. Saturated colors. Explainer-cartoon aesthetic. Plain white background.",
		},
		referenceImages: [
			templateAsset("finance-tips-2"),
			templateAsset("finance-tips-3"),
			templateAsset("finance-tips-4"),
		],
		characters: {
			Ethan: {
				description: "American male, neutral accent",
				appearance:
					"man with short light brown hair parted to the side, oversized rounded head with prominent chin and double-chin, small oval eyes with tiny black pupils, thin arched eyebrows, long pointed nose, small mouth. Bean-shaped body with stubby limbs. Wearing a blue hoodie and blue pants with white sneakers",
			},
		},
		characterAvatars: { Ethan: templateAsset("finance-tips-1") },
		narration: {
			gender: "masculine",
			age: "adult",
			pitch: "medium",
			accent: "american",
			description: "wise",
		},
		showcase: {
			image: templateAsset("finance-tips-4"),
			title: "Finance tips",
			description: "Long-form, stories to teach personal finance lessons",
			examplePrompt:
				"Subscriptions, bank fees, impulse buys, unused gym memberships - the money leaks most people ignore",
		},
	},
	{
		id: "true-crime",
		length: "5-10m",
		name: "True Crime",
		promptPrefix: "A true crime story about",
		color: "#8A0000",
		style: {
			description:
				"Semi-realistic digital comic illustration, cel-shaded with bold ink outlines, muted earthy palette, cinematic dramatic lighting, gritty detailed textures, expressive characters, vertical 9:16 composition, Rockstar Games concept art style",
		},
		referenceImages: [
			templateAsset("true-crime-1"),
			templateAsset("true-crime-2"),
			templateAsset("true-crime-3"),
			templateAsset("true-crime-4"),
		],
		narration: {
			gender: "masculine",
			age: "adult",
			pitch: "medium",
			accent: "american",
			description: "Friendly young adult male",
		},
		showcase: {
			image: templateAsset("true-crime-5"),
			title: "True Crime",
			description:
				"Long-form, wild true crime stories told like a buddy spilling the craziest thing he ever heard",
			examplePrompt: "Andres Escobar",
		},
	},
	{
		id: "pov-financial-lifestyle",
		length: "10-15m",
		name: "POV Financial Lifestyle",
		promptPrefix: "POV: You're a",
		color: "#059669",
		style: {
			description:
				"Flat 2D vector cartoon illustration in a modern animated web-comic style. Bold, clean black outlines of even weight. Smooth cel-shaded coloring with soft gradient lighting, gentle ambient glow, and warm cozy color palettes. Slightly muted, desaturated tones with warm highlights. The Protagonist has rounded, soft proportions and a friendly approachable look, rendered against richly illustrated environments. Clean, polished, professional digital cartoon aesthetic reminiscent of explainer-video and meme-style animation.",
		},
		referenceImages: [
			templateAsset("pov-financial-lifestyle-1"),
			templateAsset("pov-financial-lifestyle-2"),
			templateAsset("pov-financial-lifestyle-3"),
			templateAsset("pov-financial-lifestyle-4"),
		],
		characters: {
			Protagonist: {
				description: "Young American man",
				appearance:
					"A young everyman with a smooth, rounded egg-shaped head, pale skin, no nose, small black dot eyes, thick straight dark eyebrows, and a faint neutral mouth. He wears a navy baseball cap (worn forward or backward) and casual everyday clothing—hoodies, button-up shirts, or jackets in muted tones.",
			},
		},
		characterAvatars: {
			Protagonist: templateAsset("pov-financial-lifestyle-5"),
		},
		narration: {
			gender: "masculine",
			age: "adult",
			pitch: "medium",
			accent: "american",
			description:
				"Inviting, cheerful young adult male named Corey for casual conversation",
		},
		showcase: {
			image: templateAsset("pov-financial-lifestyle-1"),
			title: "POV Financial Lifestyle",
			description:
				"Walk the viewer through a money-driven lifestyle with advice along the way",
			examplePrompt: "silent millionaire with $110 million",
		},
	},
	{
		id: "celebrity-death",
		length: "10-15m",
		name: "Celebrity Death",
		promptPrefix: "Death of every",
		color: "#C7BFB2",
		style: {
			description:
				"Hand-drawn digital doodle illustration, thick uneven black ink outlines, flat solid color fills with slight sketchy shading, minimal detail, chibi big-head figures with simple stick limbs, plain flat background with a single horizon line, muted primary palette, white banner with handwritten marker-style caption at top, whiteboard-animation aesthetic. Thick black outlines, flat color, deliberately crude.",
		},
		referenceImages: [
			templateAsset("celebrity-death-1"),
			templateAsset("celebrity-death-2"),
			templateAsset("celebrity-death-3"),
			templateAsset("celebrity-death-4"),
		],
		narration: {
			gender: "masculine",
			age: "adult",
			accent: "american",
			description: "Steady, enunciating, confident young male for narrations",
		},
		showcase: {
			image: templateAsset("celebrity-death-2"),
			title: "Death of every...",
			description:
				"Historical explainer of death of every celebrity of a certain category",
			examplePrompt: "greatest footballer",
		},
	},
	{
		id: "stick-explainer",
		length: "5-10m",
		name: "Stick Explainer",
		promptPrefix: "Stickman explainer about",
		color: "#AA8AB1",
		style: {
			description:
				"Hand-drawn digital doodle illustration, thick uneven black ink outlines, flat solid color fills with slight sketchy shading, minimal detail, chibi big-head figures with simple stick limbs, plain flat background with a single horizon line, muted primary palette, white banner with handwritten marker-style caption at top, whiteboard-animation aesthetic. Thick black outlines, flat color, deliberately crude.",
		},
		referenceImages: [
			templateAsset("stick-explainer-1"),
			templateAsset("stick-explainer-2"),
			templateAsset("stick-explainer-3"),
		],
		narration: {
			gender: "masculine",
			age: "adult",
			accent: "american",
			description: "Steady, enunciating, confident young male for narrations",
		},
		showcase: {
			image: templateAsset("stick-explainer-3"),
			title: "Stickman explainer about...",
			description: "Stickman explainer about a certain topic",
			examplePrompt: "AI slop",
		},
	},
];

const TEMPLATE_MAP = new Map(TEMPLATES.map((t) => [t.id, t]));

/** Optional lookup for ids from outside the app, where a miss is a stale id. */
export function getTemplateById(id: string): Template | undefined {
	return TEMPLATE_MAP.get(id);
}

/** Lookup for ids sourced from `TEMPLATES`, where a miss is a programming error. */
export function getTemplate(id: string): Template {
	const template = TEMPLATE_MAP.get(id);
	if (!template) throw new Error(`Unknown template id "${id}"`);
	return template;
}
