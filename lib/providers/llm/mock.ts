import type {
	LLMGenerateParams,
	LLMGenerateResult,
} from "@/lib/connectors/types";
import { BaseProvider } from "../base";
import { pickRandom } from "../mock-utils";

const MOCK_SCRIPT = `<metadata_style>Warm, earth tones. Whimsical storybook illustration with soft watercolors, gentle brush strokes, warm lighting.</metadata_style>

<metadata_character name="Red">A cheerful girl around eight years old with warm brown skin, dark curly hair in two puffs, bright brown eyes, wearing a bright red hooded cloak over a white dress, small brown leather boots.</metadata_character>

<metadata_character name="Wolf">A large gray wolf with kind amber eyes, soft thick fur, wearing a worn brown vest with wooden buttons, slightly hunched posture, gentle expression despite sharp teeth.</metadata_character>

<image animate="true" animation="slow pan across the village to the forest path">A peaceful village at the edge of a lush green forest on a sunny morning. A cozy cottage with a red door sits near the forest path. Birds fly overhead. Flowers bloom along the dirt path leading into the woods.</image>

<music length="medium">Gentle, playful orchestral music with flutes and strings, lighthearted and cheerful</music>

<narration gender="female" age="adult" pitch="medium" accent="american" texture="warm, grandmotherly, kind" emotion="cheerful">Once upon a time, in a village at the edge of a great forest, there lived a kind girl named Red.</narration>

<image animate="true" animation="slow zoom in on Red at her cottage door" characters="Red">Red (a cheerful girl with brown skin, dark curly hair in two puffs, brown eyes, wearing a bright red hooded cloak and a white dress) stands at her cottage door holding a wicker basket filled with fresh vegetables including carrots, lettuce, and tomatoes. She smiles warmly. Morning sunlight streams through nearby trees.</image>

<narration gender="female" age="adult" pitch="medium" accent="american" texture="warm, grandmotherly, kind" emotion="happy">Red got her name from the beautiful red cloak she wore everywhere. Today, she was taking a basket of fresh vegetables to her grandmother, who lived deep in the woods.</narration>

<sound type="ambient">birds chirping</sound>

<narration gender="female" age="adult" pitch="medium" accent="american" texture="warm, grandmotherly, kind" emotion="content">Red skipped along the forest path, humming a cheerful tune.</narration>

<sound type="transient">footsteps on dirt path</sound>

<image animate="true" animation="gentle pan through the berry bushes" characters="Wolf">A different part of the forest with thick berry bushes full of ripe red berries. Wolf (a large gray wolf with kind amber eyes, soft fur, wearing a worn brown vest) carefully picks berries and places them in a wicker basket. Dappled sunlight filters through the forest canopy above.</image>

<narration gender="female" age="adult" pitch="medium" accent="american" texture="warm, grandmotherly, kind" emotion="mysterious">Not far away, someone else was in the forest that morning. Wolf was gathering wild berries near the path.</narration>

<sound type="ambient">rustling leaves</sound>

<narration gender="female" age="adult" pitch="medium" accent="american" texture="warm, grandmotherly, kind" emotion="sympathetic">Now, Wolf looked scary with his big teeth and sharp claws, but he had a secret. He didn't eat meat at all! He was a vegetarian who loved berries, nuts, and vegetables.</narration>

<character name="Wolf" gender="male" age="adult" pitch="low" accent="american" texture="gentle, soft-spoken, kind" emotion="content">"These berries will make Mother feel so much better. She loves berry soup."</character>

<narration gender="female" age="adult" pitch="medium" accent="american" texture="warm, grandmotherly, kind" emotion="calm">Wolf's mother had a terrible cold, and he wanted to bring her something special.</narration>
`;

type RefinementFactory = (ids: string[]) => string;

const MOCK_REFINEMENTS: RefinementFactory[] = [
	// Modify text on first element
	(ids) =>
		`{"op":"set","id":"${ids[0]}","text":"In a distant village, at the edge of an enchanted forest, there lived a brave girl named Red."}`,

	// Insert multiple elements at same anchor (tests stacking)
	(ids) =>
		[
			`{"op":"insert","anchor_id":"${ids[0]}","type":"sound","text":"mystical wind chimes"}`,
			`{"op":"insert","anchor_id":"${ids[0]}","type":"sound","text":"distant thunder"}`,
			`{"op":"insert","anchor_id":"${ids[0]}","type":"music","text":"Tense orchestral music with deep cellos and timpani"}`,
		].join("\n"),

	// Remove an element then insert at same anchor (tests stale anchor fallback)
	(ids) =>
		[
			`{"op":"remove","id":"${ids[1]}"}`,
			`{"op":"insert","anchor_id":"${ids[0]}","type":"narration","text":"The forest grew darker as she ventured deeper."}`,
		].join("\n"),

	// Change element type (tests type change + hydration)
	(ids) =>
		`{"op":"set","id":"${ids[0]}","type":"character","attrs":{"name":"Red","emotion":"excited"},"text":"I can see grandmother's house from here!"}`,

	// Insert at top (tests position:"before" with no anchor)
	() =>
		[
			`{"op":"insert","position":"before","type":"narration","text":"Long ago, in a land of endless forests..."}`,
			`{"op":"insert","position":"before","type":"image","attrs":{"animate":"true"},"text":"A sweeping aerial view of an ancient forest stretching to the horizon"}`,
		].join("\n"),

	// Multiple set ops on different elements (tests independent edits)
	(ids) =>
		ids
			.slice(0, 3)
			.map(
				(id, i) =>
					`{"op":"set","id":"${id}","attrs":{"emotion":"${["excited", "scared", "calm"][i]}"}}`,
			)
			.join("\n"),

	// Append multiple to end (tests no-anchor stacking)
	() =>
		[
			`{"op":"insert","type":"sound","text":"wolf howling in the distance"}`,
			`{"op":"insert","type":"narration","text":"Red paused, her heart pounding."}`,
			`{"op":"insert","type":"sound","text":"snapping twigs"}`,
			`{"op":"insert","type":"character","attrs":{"name":"Red","emotion":"scared"},"text":"Who's there?"}`,
		].join("\n"),
];

function extractIds(prompt: string): string[] {
	return [...prompt.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
}

function isRefineRequest(params: LLMGenerateParams): boolean {
	return params.prompt.includes("## Refinement Request");
}

function buildRefineResponse(params: LLMGenerateParams): string {
	const ids = extractIds(params.prompt);
	const factory = pickRandom(MOCK_REFINEMENTS);
	return factory(ids);
}

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockLLM extends BaseProvider<
	LLMGenerateParams,
	LLMGenerateResult,
	LLMGenerateResult
> {
	protected readonly blobConfig = { type: "llm", provider: "mock" };

	protected toFiles() {
		return [];
	}

	protected async store(result: LLMGenerateResult) {
		return result;
	}

	protected async _generate(
		params: LLMGenerateParams,
	): Promise<LLMGenerateResult> {
		const text = isRefineRequest(params)
			? buildRefineResponse(params)
			: MOCK_SCRIPT;
		return {
			text,
			model: "mock",
			usage: { inputTokens: 0, outputTokens: 0 },
		};
	}

	async *stream(
		params: LLMGenerateParams,
	): AsyncGenerator<{ text: string; done: boolean }> {
		await delay(500);
		const text = isRefineRequest(params)
			? buildRefineResponse(params)
			: MOCK_SCRIPT;
		let i = 0;
		while (i < text.length) {
			const size = 1 + Math.floor(Math.random() * 12);
			await delay(20 + Math.random() * 40);
			yield { text: text.slice(i, i + size), done: false };
			i += size;
		}
		yield { text: "", done: true };
	}
}
