import type {
	LanguageModelV3Prompt,
	LanguageModelV3StreamPart,
} from "@ai-sdk/provider";
import { MockLanguageModelV3, simulateReadableStream } from "ai/test";
import omit from "lodash/omit";
import sampleSize from "lodash/sampleSize";
import type { ValidationResult } from "@/lib/connectors/provider-key";
import {
	type LLMGenerateParams,
	type LLMGenerateResult,
	type LLMStreamChunk,
	MODEL_REF_KEYS,
} from "@/lib/connectors/types";
import { SCENE_MARKER_PATTERN } from "@/lib/canvas/constants";
import { flatAttributes } from "@/lib/canvas/element-attributes";
import { isAssetElement } from "@/lib/canvas/guards";
import { getElementBodyText } from "@/lib/canvas/osml-serializer";
import { parseOSML } from "@/lib/canvas/osml-stream-parser";
import { SKILL_NAMES } from "@/lib/agent/skills/registry";
import type { AgentToolName } from "@/lib/agent/tools/registry";
import { DERIVE_INSTRUCTION } from "@/lib/project/derive-art-style";
import { animateImageScene } from "@/lib/script/refine/animate-prompt";
import type { RefineOp } from "@/lib/script/refine/types";
import { pickRandom, sleep } from "@/lib/utils";
import type { Priced } from "../base";
import { MOCK_COST_USD } from "../mock-utils";
import type { AgentModel } from "./agent-model";
import type { LLMProvider } from "./base";
import {
	MOCK_ANSWER,
	MOCK_ASSETS_OSML,
	MOCK_DONE,
	MOCK_GLANCES,
	MOCK_SCRIPT,
	MOCK_STYLE,
	MOCK_THOUGHT,
	MOCK_TITLE,
} from "./mock-fixtures";

const MOCK_ASSETS: RefineOp[] = parseOSML(MOCK_ASSETS_OSML)
	.filter(isAssetElement)
	.map((asset) => ({
		op: "asset",
		type: asset.type,
		attrs: omit(flatAttributes(asset), MODEL_REF_KEYS),
		text: getElementBodyText(asset),
	}));

const mockResponse = ({ prompt }: LLMGenerateParams): string =>
	prompt.startsWith(DERIVE_INSTRUCTION) ? MOCK_STYLE : MOCK_SCRIPT;

export class MockLLM implements LLMProvider {
	async validate(): Promise<ValidationResult> {
		return { ok: true };
	}

	async generate(
		params: LLMGenerateParams,
	): Promise<Priced<LLMGenerateResult>> {
		return {
			output: {
				text: mockResponse(params),
				model: "mock",
				usage: { inputTokens: 0, outputTokens: 0 },
			},
			costUsd: MOCK_COST_USD,
		};
	}

	async *stream(
		params: LLMGenerateParams,
	): AsyncGenerator<LLMStreamChunk, number> {
		await sleep(500);
		const text = mockResponse(params);
		let offset = 0;
		while (offset < text.length) {
			const size = 1 + Math.floor(Math.random() * 12);
			await sleep(20 + Math.random() * 40);
			yield { text: text.slice(offset, offset + size), done: false };
			offset += size;
		}
		yield { text: "", done: true };
		return MOCK_COST_USD;
	}

	agentModel(modelId: string): AgentModel {
		return {
			model: mockAgentModel(),
			modelId,
			providerOptions: {},
			cachedPrefix: {},
			costOf: () => MOCK_COST_USD,
		};
	}
}

/** The first element that says something: a blank canvas still holds an empty one. */
const ELEMENT_ID = /id="([^"]+)"[^>]*>[^<]/;
const IMAGE_ID = /<image[^>]*\bid="([^"]+)"/;

/** What a script reads as between one scene marker and the next. */
const sceneSection = (script: string, scene: number): string =>
	script.split(SCENE_MARKER_PATTERN)[scene] ?? "";
const EDIT_REQUEST =
	/\b(add|remove|delete|change|edit|rewrite|shorten|lengthen|make|replace|move|swap|fix|tweak|animate|shorter|longer|warmer|colder)\b/i;

function textOf(message: LanguageModelV3Prompt[number]): string {
	if (typeof message.content === "string") return message.content;
	return message.content
		.map((part) => (part.type === "text" ? part.text : ""))
		.join("");
}

function outputText(output: { type: string; value?: unknown }): string {
	return typeof output.value === "string" ? output.value : "";
}

function turnToolResults(prompt: LanguageModelV3Prompt): ToolResult[] {
	// An earlier turn's reads describe a canvas that has since been edited.
	const askedAt = prompt.findLastIndex((message) => message.role === "user");
	return prompt
		.slice(askedAt + 1)
		.flatMap((message) => (message.role === "tool" ? message.content : []))
		.flatMap((part) =>
			part.type === "tool-result"
				? [{ toolName: part.toolName, text: outputText(part.output) }]
				: [],
		);
}

/** What the user actually asked for, apart from the prompt around it. */
function lastUserText(prompt: LanguageModelV3Prompt): string {
	const user = prompt.findLast((message) => message.role === "user");
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

type ToolResult = { toolName: string; text: string };

type MockStep = { say?: string; toolName?: AgentToolName; input?: unknown };

const READ_SCRIPT: MockStep = { toolName: "read_script", input: {} };

/** Read-only calls a real turn makes to look around before it acts. */
const NO_INPUT = () => ({});
const LOOKS: { toolName: AgentToolName; input: () => unknown }[] = [
	{ toolName: "read_media", input: NO_INPUT },
	{ toolName: "read_generation", input: NO_INPUT },
	{ toolName: "read_script_settings", input: NO_INPUT },
	{ toolName: "read_video_settings", input: NO_INPUT },
	{ toolName: "read_title", input: NO_INPUT },
	{ toolName: "list_models", input: NO_INPUT },
	{ toolName: "estimate_total_length", input: NO_INPUT },
	{ toolName: "estimate_speech_lengths", input: NO_INPUT },
	{
		toolName: "load_skill",
		input: () => ({
			names: sampleSize(SKILL_NAMES, 1 + Math.floor(Math.random() * 6)),
		}),
	},
];
const LOOK_NAMES = new Set<string>(LOOKS.map(({ toolName }) => toolName));
const LOOK_CHANCE = 0.6;
const LOOKS_IN_A_ROW = 3;

/** Each look at most once a turn, so the looking always runs out. */
function look(results: ToolResult[]): MockStep | undefined {
	const trailing = results.slice(
		results.findLastIndex(({ toolName }) => !LOOK_NAMES.has(toolName)) + 1,
	).length;
	if (trailing >= LOOKS_IN_A_ROW || Math.random() >= LOOK_CHANCE) return;
	const seen = new Set(results.map(({ toolName }) => toolName));
	const unseen = LOOKS.filter(({ toolName }) => !seen.has(toolName));
	if (unseen.length === 0) return;
	const { toolName, input } = pickRandom(unseen);
	return { toolName, input: input() };
}

/**
 * Only edits when the message reads like a request to change something, so a
 * plain question gets a plain answer the way a real model would give one.
 */
function afterReading(asked: string, { text: script }: ToolResult): MockStep {
	const scene = animateImageScene(asked);
	const elementId =
		scene === null
			? ELEMENT_ID.exec(sceneSection(script, 1))?.[1]
			: IMAGE_ID.exec(sceneSection(script, scene))?.[1];

	if (!elementId)
		return { toolName: "set_title", input: { title: MOCK_TITLE } };

	if (scene === null && !EDIT_REQUEST.test(asked)) return { say: MOCK_ANSWER };

	const ops =
		scene === null
			? [
					{
						op: "set",
						id: elementId,
						text: "A mock edit, from the agent running without an API key.",
					},
				]
			: [
					{
						op: "insert",
						anchor_id: elementId,
						position: "before",
						elements: [
							{
								type: "video",
								text: "Shot 1: Slow cinematic push-in, the light shifting gently across the frame.",
							},
						],
					},
					{ op: "remove", id: elementId },
				];
	return { toolName: "edit_script", input: { ops } };
}

/** A new project is named, given its assets, then written; a replaced script is read again, and an edit is fitted. */
type NextStep = (actions: ToolResult[]) => MockStep;

const NEXT_STEP: Record<string, NextStep> = {
	write_script: () => READ_SCRIPT,
	set_title: () => ({ toolName: "edit_script", input: { ops: MOCK_ASSETS } }),
	edit_script: (actions) =>
		actions.at(-2)?.toolName === "set_title"
			? {
					say: "The cast is ready. Writing the script now.",
					toolName: "write_script",
					input: { osml: MOCK_SCRIPT },
				}
			: { toolName: "fit_durations", input: {} },
	fit_durations: () => ({ say: MOCK_DONE }),
} satisfies Partial<Record<AgentToolName, NextStep>>;

function mockCall(
	prompt: LanguageModelV3Prompt,
	results: ToolResult[],
): MockStep {
	const looked = look(results);
	if (looked) return looked;
	const actions = results.filter(({ toolName }) => !LOOK_NAMES.has(toolName));
	const last = actions.at(-1);
	// The canvas is never in the prompt, so a turn reads it before anything else.
	if (!last) return READ_SCRIPT;
	return (
		NEXT_STEP[last.toolName]?.(actions) ??
		afterReading(lastUserText(prompt), last)
	);
}

/** A turn thinks hard before its first step, and only now and then after that. */
const thought = (results: ToolResult[]): string | undefined =>
	results.length === 0
		? MOCK_THOUGHT
		: Math.random() < 0.4
			? pickRandom(MOCK_GLANCES)
			: undefined;

/**
 * A language model rather than a short-circuit in the route, so the whole agent
 * path runs unchanged without an API key.
 */
function mockAgentModel() {
	return new MockLanguageModelV3({
		doStream: async ({ prompt }) => {
			const results = turnToolResults(prompt);
			const { say, toolName, input } = mockCall(prompt, results);
			const think = thought(results);
			const chunks: LanguageModelV3StreamPart[] = [
				{ type: "stream-start", warnings: [] },
				...(think ? parts("reasoning", "r0", think) : []),
				...(say ? parts("text", "t0", say) : []),
				...(toolName
					? ([
							{
								type: "tool-call",
								toolCallId: `mock-${toolName}-${results.length}`,
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
