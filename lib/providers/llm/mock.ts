import type {
	LLMGenerateParams,
	LLMGenerateResult,
} from "@/lib/connectors/types";
import { BaseProvider } from "../base";
import { pickRandom } from "../mock-utils";

const MOCK_SCRIPT = `<metadata_title>Little Red</metadata_title>

<metadata_style>Warm, earth tones. Whimsical storybook illustration with soft watercolors, gentle brush strokes, warm lighting.</metadata_style>

<metadata_narration gender="feminine" age="adult" pitch="medium" accent="american" description="warm, grandmotherly, kind"></metadata_narration>

<metadata_character name="Red" gender="feminine" age="child" pitch="high" accent="american" description="bright, cheerful, youthful">A cheerful girl around eight years old with warm brown skin, dark curly hair in two puffs, bright brown eyes, wearing a bright red hooded cloak over a white dress, small brown leather boots.</metadata_character>

<metadata_character name="Wolf" gender="masculine" age="adult" pitch="low" accent="american" description="gentle, soft-spoken, kind">A large gray wolf with kind amber eyes, soft thick fur, wearing a worn brown vest with wooden buttons, slightly hunched posture, gentle expression despite sharp teeth.</metadata_character>

<metadata_character name="Mother" gender="feminine" age="adult" pitch="medium" accent="american" description="caring, gentle, melodic">Red's mother, a tall woman with warm brown skin, long black braided hair tied back with a green ribbon, kind dark eyes, wearing a long blue dress and a flour-dusted apron.</metadata_character>

<metadata_character name="Granny" gender="feminine" age="adult" pitch="medium" accent="american" description="caring, gentle, melodic">Red's grandmother, a small elderly woman with deep brown skin, silver hair in a bun, twinkling hazel eyes behind round spectacles, wearing a soft purple shawl.</metadata_character>

<image animate="true" animation="slow pan across the village to the forest path">A peaceful village at the edge of a lush green forest on a sunny morning. A cozy cottage with a red door sits near the forest path. Birds fly overhead. Flowers bloom along the dirt path leading into the woods.</image>

<music length="medium">Gentle, playful orchestral music with flutes and strings, lighthearted and cheerful</music>

<narration emotion="cheerful">Once upon a time, in a village at the edge of a great forest, there lived a kind girl named Red.</narration>

<image animate="true" animation="warm dolly in toward the kitchen window" characters="Red,Mother">Inside a sunlit kitchen with copper pots hanging on the wall, Red (a cheerful girl with brown skin, dark curly hair in two puffs, brown eyes, wearing a bright red hooded cloak and a white dress) stands beside her Mother (a tall woman with warm brown skin, long black braided hair tied back with a green ribbon, kind dark eyes, wearing a long blue dress and a flour-dusted apron). Mother gently places a wicker basket of fresh vegetables in Red's hands.</image>

<character name="Mother" emotion="gentle">"Take these straight to Granny, sweetheart. And please don't dawdle along the way."</character>

<character name="Red" emotion="excited">"I won't, Mama! I'll be back before sundown!"</character>

<image animate="true" animation="slow zoom in on Red at her cottage door" characters="Red">Red stands at her cottage door holding a wicker basket filled with fresh vegetables including carrots, lettuce, and tomatoes. She smiles warmly. Morning sunlight streams through nearby trees.</image>

<narration emotion="happy">Red got her name from the beautiful red cloak she wore everywhere. Today, she was taking a basket of fresh vegetables to her grandmother, who lived deep in the woods.</narration>

<sound type="ambient">birds chirping</sound>

<narration emotion="content">Red skipped along the forest path, humming a cheerful tune.</narration>

<sound type="transient">footsteps on dirt path</sound>

<image animate="true" animation="gentle pan upward through the forest canopy" characters="Owl">High in the branches of an ancient oak, Owl (a tawny owl with copper and brown speckled feathers, enormous golden eyes, wearing a tiny silver pendant) watches with wisdom in her gaze. Sunlight filters through the leaves around her.</image>

<narration emotion="wonder">High above, Owl watched silently from the trees. She had been the keeper of these woods for longer than anyone could remember.</narration>

<character name="Owl" emotion="calm">"A child enters the forest today. The wind tells me she will not walk alone."</character>

<image animate="true" animation="gentle pan through the berry bushes" characters="Wolf">A different part of the forest with thick berry bushes full of ripe red berries. Wolf (a large gray wolf with kind amber eyes, soft fur, wearing a worn brown vest) carefully picks berries and places them in a wicker basket. Dappled sunlight filters through the forest canopy above.</image>

<narration emotion="mysterious">Not far away, someone else was in the forest that morning. Wolf was gathering wild berries near the path.</narration>

<sound type="ambient">rustling leaves</sound>

<narration emotion="sympathetic">Now, Wolf looked scary with his big teeth and sharp claws, but he had a secret. He didn't eat meat at all! He was a vegetarian who loved berries, nuts, and vegetables.</narration>

<character name="Wolf" emotion="content">"These berries will make Mother feel so much better. She loves berry soup."</character>

<narration emotion="calm">Wolf's mother had a terrible cold, and he wanted to bring her something special.</narration>

<image animate="true" animation="warm camera dolly as the two meet on the path" characters="Red,Wolf">Red and Wolf meet face to face on a sunlit forest path. Red holds her vegetable basket; Wolf holds his berry basket. Both look surprised but unafraid. A shaft of golden light falls between them. Wildflowers grow along the path.</image>

<character name="Red" emotion="curious">"Oh! Hello, Mr. Wolf. Are those berries for someone special?"</character>

<character name="Wolf" emotion="happy">"For my mother. She has a cold. And you, little one?"</character>

<character name="Red" emotion="cheerful">"Vegetables for my Granny. She lives just past the great oak."</character>

<narration emotion="warm">They decided to walk together, two unlikely friends sharing the forest path.</narration>

<sound type="ambient">forest stream burbling</sound>

<image animate="true" animation="tracking shot following them down the path" characters="Red,Wolf">Red and Wolf walk side by side along a winding forest path lined with ferns. Red gestures animatedly while talking; Wolf listens with a gentle smile. A small stream sparkles in the background. The light is dappled and warm.</image>

<music length="short">Light, twinkling music with playful pizzicato strings</music>

<character name="Wolf" emotion="curious">"Tell me about your Granny. What is she like?"</character>

<character name="Red" emotion="proud">"She tells the best stories! And she knits the warmest mittens. And she always has cookies."</character>

<image animate="true" animation="wide reveal as they round a bend" characters="Red,Wolf,Hunter">A clearing where the forest path meets a sturdy bridge over a stream. Hunter (a broad-shouldered woodsman with a thick brown beard, blue eyes, wearing a green cloak with a hatchet at his belt) stands by the bridge waving warmly at Red and Wolf as they approach. His sturdy brown boots crunch on the gravel.</image>

<character name="Hunter" emotion="hearty">"Well now! Little Red and her woodland friend! You two heading to the old oak cottage?"</character>

<character name="Red" emotion="excited">"Yes, Mr. Hunter! Granny isn't feeling well."</character>

<character name="Hunter" emotion="kind">"Then walk safe. Tell her I'll bring firewood by tomorrow."</character>

<sound type="transient">creaking wooden bridge</sound>

<narration emotion="warm">They thanked Hunter and crossed the little bridge, the stream singing beneath their feet.</narration>

<image animate="true" animation="slow push-in toward the cottage door" characters="Granny">A small thatched cottage nestled among ancient oaks, with smoke curling from the chimney and a window box of bright marigolds. Granny (a small elderly woman with deep brown skin, silver hair in a bun, twinkling hazel eyes behind round spectacles, wearing a soft purple shawl) stands at the open door, leaning on a wooden cane, smiling warmly.</image>

<character name="Granny" emotion="delighted">"Red, my darling! And who is this handsome fellow you've brought along?"</character>
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
