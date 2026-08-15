import type {
	LanguageModelV3Prompt,
	LanguageModelV3StreamPart,
} from "@ai-sdk/provider";
import { MockLanguageModelV3, simulateReadableStream } from "ai/test";
import type {
	LLMGenerateParams,
	LLMGenerateResult,
} from "@/lib/connectors/types";
import { matchAnimateImagePrompt } from "@/lib/script/refine/animatePrompt";
import type { AgentModel } from "./agentModel";

const MOCK_SCRIPT = `<metadata_title>Little Red</metadata_title>

<metadata_style>Warm, earth tones. Whimsical storybook illustration with soft watercolors, gentle brush strokes, warm lighting.</metadata_style>

<metadata_narration gender="feminine" age="adult" pitch="medium" accent="american" description="warm, grandmotherly, kind" language="en"></metadata_narration>

<metadata_character name="Red" gender="feminine" age="child" pitch="high" accent="american" description="bright, cheerful, youthful" language="en">A cheerful girl around eight years old with warm brown skin, dark curly hair in two puffs, bright brown eyes, wearing a bright red hooded cloak over a white dress, small brown leather boots.</metadata_character>

<metadata_character name="Wolf" gender="masculine" age="adult" pitch="low" accent="american" description="gentle, soft-spoken, kind" language="en">A large gray wolf with kind amber eyes, soft thick fur, wearing a worn brown vest with wooden buttons, slightly hunched posture, gentle expression despite sharp teeth.</metadata_character>

<metadata_character name="Mother" gender="feminine" age="adult" pitch="medium" accent="american" description="caring, gentle, melodic" language="en">Red's mother, a tall woman with warm brown skin, long black braided hair tied back with a green ribbon, kind dark eyes, wearing a long blue dress and a flour-dusted apron.</metadata_character>

<metadata_character name="Granny" gender="feminine" age="adult" pitch="medium" accent="american" description="caring, gentle, melodic" language="en">Red's grandmother, a small elderly woman with deep brown skin, silver hair in a bun, twinkling hazel eyes behind round spectacles, wearing a soft purple shawl.</metadata_character>

<animated_image videoPrompt="slow pan across the village to the forest path">A peaceful village at the edge of a lush green forest on a sunny morning. A cozy cottage with a red door sits near the forest path. Birds fly overhead. Flowers bloom along the dirt path leading into the woods.</animated_image>

<music length="medium">Gentle, playful orchestral music with flutes and strings, lighthearted and cheerful</music>

<narration emotion="cheerful">Once upon a time, in a village at the edge of a great forest, there lived a kind girl named Red.</narration>

<image motion="pushIn" characters="Red,Mother">Inside a sunlit kitchen with copper pots hanging on the wall, Red (a cheerful girl with brown skin, dark curly hair in two puffs, brown eyes, wearing a bright red hooded cloak and a white dress) stands beside her Mother (a tall woman with warm brown skin, long black braided hair tied back with a green ribbon, kind dark eyes, wearing a long blue dress and a flour-dusted apron). Mother gently places a wicker basket of fresh vegetables in Red's hands.</image>

<character name="Mother" emotion="gentle">"Take these straight to Granny, sweetheart. And please don't dawdle along the way."</character>

<character name="Red" emotion="excited">"I won't, Mama! I'll be back before sundown!"</character>

<image motion="tiltDown" characters="Red">Red stands at her cottage door holding a wicker basket filled with fresh vegetables including carrots, lettuce, and tomatoes. She smiles warmly. Morning sunlight streams through nearby trees.</image>

<narration emotion="happy">Red got her name from the beautiful red cloak she wore everywhere. Today, she was taking a basket of fresh vegetables to her grandmother, who lived deep in the woods.</narration>

<sound loops="5">birds chirping</sound>

<narration emotion="content">Red skipped along the forest path, humming a cheerful tune.</narration>

<sound>footsteps on dirt path</sound>

<animated_image videoPrompt="gentle pan upward through the forest canopy" characters="Owl">High in the branches of an ancient oak, Owl (a tawny owl with copper and brown speckled feathers, enormous golden eyes, wearing a tiny silver pendant) watches with wisdom in her gaze. Sunlight filters through the leaves around her.</animated_image>

<narration emotion="wonder">High above, Owl watched silently from the trees. She had been the keeper of these woods for longer than anyone could remember.</narration>

<character name="Owl" emotion="calm">"A child enters the forest today. The wind tells me she will not walk alone."</character>

<clip duration="4" motion="handheldDrift" characters="Wolf">A different part of the forest with thick berry bushes full of ripe red berries. Wolf (a large gray wolf with kind amber eyes, soft fur, wearing a worn brown vest) carefully picks berries and places them in a wicker basket. Dappled sunlight filters through the forest canopy above.</clip>

<narration emotion="mysterious">Not far away, someone else was in the forest that morning. Wolf was gathering wild berries near the path.</narration>

<sound loops="4">rustling leaves</sound>

<narration emotion="sympathetic">Now, Wolf looked scary with his big teeth and sharp claws, but he had a secret. He didn't eat meat at all! He was a vegetarian who loved berries, nuts, and vegetables.</narration>

<character name="Wolf" emotion="content">"These berries will make Mother feel so much better. She loves berry soup."</character>

<narration emotion="calm">Wolf's mother had a terrible cold, and he wanted to bring her something special.</narration>

<image characters="Red,Wolf">Red and Wolf meet face to face on a sunlit forest path. Red holds her vegetable basket; Wolf holds his berry basket. Both look surprised but unafraid. A shaft of golden light falls between them. Wildflowers grow along the path.</image>

<character name="Red" emotion="curious">"Oh! Hello, Mr. Wolf. Are those berries for someone special?"</character>

<character name="Wolf" emotion="happy">"For my mother. She has a cold. And you, little one?"</character>

<character name="Red" emotion="cheerful">"Vegetables for my Granny. She lives just past the great oak."</character>

<narration emotion="warm">They decided to walk together, two unlikely friends sharing the forest path.</narration>

<sound loops="6">forest stream burbling</sound>

<clip duration="5" motion="panRight" characters="Red,Wolf">Red and Wolf walk side by side along a winding forest path lined with ferns. Red gestures animatedly while talking; Wolf listens with a gentle smile. A small stream sparkles in the background. The light is dappled and warm.</clip>

<music length="short">Light, twinkling music with playful pizzicato strings</music>

<character name="Wolf" emotion="curious">"Tell me about your Granny. What is she like?"</character>

<character name="Red" emotion="proud">"She tells the best stories! And she knits the warmest mittens. And she always has cookies."</character>

<image motion="panLeft" characters="Red,Wolf,Hunter">A clearing where the forest path meets a sturdy bridge over a stream. Hunter (a broad-shouldered woodsman with a thick brown beard, blue eyes, wearing a green cloak with a hatchet at his belt) stands by the bridge waving warmly at Red and Wolf as they approach. His sturdy brown boots crunch on the gravel.</image>

<character name="Hunter" emotion="hearty">"Well now! Little Red and her woodland friend! You two heading to the old oak cottage?"</character>

<character name="Red" emotion="excited">"Yes, Mr. Hunter! Granny isn't feeling well."</character>

<character name="Hunter" emotion="kind">"Then walk safe. Tell her I'll bring firewood by tomorrow."</character>

<sound>creaking wooden bridge</sound>

<narration emotion="warm">They thanked Hunter and crossed the little bridge, the stream singing beneath their feet.</narration>

<animated_image videoPrompt="slow push-in toward the cottage door" characters="Granny">A small thatched cottage nestled among ancient oaks, with smoke curling from the chimney and a window box of bright marigolds. Granny (a small elderly woman with deep brown skin, silver hair in a bun, twinkling hazel eyes behind round spectacles, wearing a soft purple shawl) stands at the open door, leaning on a wooden cane, smiling warmly.</animated_image>

<character name="Granny" emotion="delighted">"Red, my darling! And who is this handsome fellow you've brought along?"</character>
`;

const MOCK_STYLE =
	"Warm, painterly storybook illustration with soft watercolor washes, gentle outlines, and golden hour lighting; whimsical and nostalgic.";

const MOCK_CHARACTER_APPEARANCE =
	"A cheerful young person with warm brown skin, dark curly hair, bright expressive eyes, wearing a simple colorful outfit; soft painterly storybook style.";

const MOCK_OUTLINE = `Premise: In a village at the edge of an enchanted forest, a cheerful girl named Red sets out to deliver vegetables to her ailing grandmother and unexpectedly befriends a gentle, vegetarian wolf gathering berries for his own sick mother.

Characters: Red (curious, kind); Wolf (gentle, misunderstood); Mother and Granny (warm anchors of home); Hunter (a watchful protector); Owl (the forest's quiet conscience).

Themes: Looking past appearances; small acts of care; the forest as a shared home.

Conflict: Red has been warned not to dawdle, and Wolf's frightening exterior collides with her mother's caution — both must decide whether to trust what they see.

Twists: The "big bad wolf" is the kindest soul in the forest; Owl has been silently steering their meeting all along.

Resolution: Red and Wolf arrive together at Granny's cottage, share their baskets, and the village learns that friendship can grow in the most unlikely places.`;

const MOCK_RESPONSES: {
	matches: (prompt: string) => boolean;
	respond: (params: LLMGenerateParams) => string;
}[] = [
	{
		matches: (p) => /describe the visual art style/i.test(p),
		respond: () => MOCK_STYLE,
	},
	{
		matches: (p) => /describe the visual appearance of the character/i.test(p),
		respond: () => MOCK_CHARACTER_APPEARANCE,
	},
	{
		matches: (p) => p.startsWith("Briefly outline an engaging story"),
		respond: () => MOCK_OUTLINE,
	},
];

function mockResponse(params: LLMGenerateParams): string {
	const match = MOCK_RESPONSES.find((m) => m.matches(params.prompt));
	return match ? match.respond(params) : MOCK_SCRIPT;
}

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockLLM {
	async generate(params: LLMGenerateParams): Promise<LLMGenerateResult> {
		return {
			text: mockResponse(params),
			model: "mock",
			usage: { inputTokens: 0, outputTokens: 0 },
		};
	}

	async *stream(
		params: LLMGenerateParams,
	): AsyncGenerator<{ text: string; done: boolean }> {
		await delay(500);
		const text = mockResponse(params);
		let i = 0;
		while (i < text.length) {
			const size = 1 + Math.floor(Math.random() * 12);
			await delay(20 + Math.random() * 40);
			yield { text: text.slice(i, i + size), done: false };
			i += size;
		}
		yield { text: "", done: true };
	}

	agentModel(): AgentModel {
		return {
			model: mockAgentModel(),
			modelId: "mock",
			providerOptions: {},
		};
	}
}

const ELEMENT_ID = /id="([^"]+)"/;
const EDIT_REQUEST =
	/\b(add|remove|delete|change|edit|rewrite|shorten|lengthen|make|replace|move|swap|fix|tweak|animate|shorter|longer|warmer|colder)\b/i;

function textOf(message: LanguageModelV3Prompt[number]): string {
	if (typeof message.content === "string") return message.content;
	return message.content
		.map((part) => (part.type === "text" ? part.text : ""))
		.join("");
}

function promptText(prompt: LanguageModelV3Prompt): string {
	return prompt.map(textOf).join("\n");
}

/** What the user actually asked for, apart from the prompt around it. */
function lastUserText(prompt: LanguageModelV3Prompt): string {
	const user = [...prompt].reverse().find((m) => m.role === "user");
	return user ? textOf(user) : "";
}

function parts(
	kind: "text" | "reasoning",
	id: string,
	text: string,
): LanguageModelV3StreamPart[] {
	return [
		{ type: `${kind}-start`, id },
		...text
			.split(/(?<= )/)
			.map((delta) => ({ type: `${kind}-delta` as const, id, delta })),
		{ type: `${kind}-end`, id },
	] as LanguageModelV3StreamPart[];
}

/**
 * Only edits when the message reads like a request to change something, so a
 * plain question gets a plain answer the way a real model would give one.
 */
function mockCall(prompt: LanguageModelV3Prompt) {
	const asked = lastUserText(prompt);
	const animateId = matchAnimateImagePrompt(asked);
	const elementId = animateId ?? ELEMENT_ID.exec(promptText(prompt))?.[1];

	if (!elementId) {
		return {
			say: "Writing a script onto the canvas. ",
			toolName: "write_script",
			input: { brief: "A short mock story, written without an API key." },
		};
	}

	if (!animateId && !EDIT_REQUEST.test(asked)) {
		return {
			say: "No API key is set, so I am a mock. Ask me to change the script and I will edit it.",
		};
	}

	return {
		say: "Rewriting an element. ",
		toolName: "edit_script",
		input: {
			ops: [
				animateId
					? {
							op: "set",
							id: elementId,
							type: "animated_image",
							attrs: { videoPrompt: "slow cinematic push-in" },
						}
					: {
							op: "set",
							id: elementId,
							text: "A mock edit, from the agent running without an API key.",
						},
			],
		},
	};
}

/**
 * A language model rather than a short-circuit in the route, so the whole agent
 * path runs unchanged without an API key.
 */
function mockAgentModel() {
	return new MockLanguageModelV3({
		doStream: async ({ prompt }) => {
			const { say, toolName, input } = mockCall(prompt);
			const chunks: LanguageModelV3StreamPart[] = [
				{ type: "stream-start", warnings: [] },
				...parts("reasoning", "r0", "Reading the canvas. "),
				...parts("text", "t0", say),
				...(toolName
					? ([
							{
								type: "tool-call",
								toolCallId: `mock-${toolName}`,
								toolName,
								input: JSON.stringify(input),
							},
						] as LanguageModelV3StreamPart[])
					: []),
				{
					type: "finish",
					finishReason: toolName
						? { unified: "tool-calls", raw: "tool_use" }
						: { unified: "stop", raw: "end_turn" },
					usage: {
						inputTokens: { total: 0, noCache: 0, cacheRead: 0, cacheWrite: 0 },
						outputTokens: { total: 0, text: 0, reasoning: 0 },
					},
				},
			];
			return {
				stream: simulateReadableStream({
					chunks,
					chunkDelayInMs: 20,
					initialDelayInMs: 200,
				}),
			};
		},
	});
}
