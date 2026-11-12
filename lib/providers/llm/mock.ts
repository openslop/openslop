import type {
	LanguageModelV3Prompt,
	LanguageModelV3StreamPart,
} from "@ai-sdk/provider";
import { MockLanguageModelV3, simulateReadableStream } from "ai/test";
import omit from "lodash/omit";
import type { ValidationResult } from "@/lib/connectors/provider-key";
import type {
	LLMGenerateParams,
	LLMGenerateResult,
	LLMStreamChunk,
} from "@/lib/connectors/types";
import { SCENE_MARKER_PATTERN } from "@/lib/canvas/constants";
import { flatAttributes } from "@/lib/canvas/element-attributes";
import { isAssetElement } from "@/lib/canvas/guards";
import { getElementBodyText } from "@/lib/canvas/osml-serializer";
import { parseOSML } from "@/lib/canvas/osml-stream-parser";
import type { AgentToolName } from "@/lib/agent/tools/registry";
import { DERIVE_INSTRUCTION } from "@/lib/project/derive-art-style";
import { OUTLINE_INSTRUCTION } from "@/lib/script/prompt/outline";
import { NO_FINDINGS, REVIEW_INSTRUCTION } from "@/lib/script/prompt/review";
import { animateImageScene } from "@/lib/script/refine/animate-prompt";
import type { RefineOp } from "@/lib/script/refine/types";
import { sleep } from "@/lib/utils";
import type { Priced } from "../base";
import type { AgentModel } from "./agent-model";
import type { LLMProvider } from "./base";

import project from "./mock-fixtures/project.json";
import mockAssets from "./mock-fixtures/assets.md?raw";
import MOCK_SCRIPT from "./mock-fixtures/script.md?raw";
import MOCK_STYLE from "./mock-fixtures/style.md?raw";
import MOCK_OUTLINE from "./mock-fixtures/outline.md?raw";
import MOCK_THOUGHT from "./mock-fixtures/thought.md?raw";

const MOCK_ASSETS: RefineOp[] = parseOSML(mockAssets)
	.filter(isAssetElement)
	.map((asset) => ({
		op: "asset",
		type: asset.type,
		attrs: omit(flatAttributes(asset), ["provider", "model"]),
		text: getElementBodyText(asset),
	}));

const MOCK_RESPONSES: [matches: (prompt: string) => boolean, text: string][] = [
	[(prompt) => prompt.startsWith(DERIVE_INSTRUCTION), MOCK_STYLE],
	[(prompt) => prompt.startsWith(OUTLINE_INSTRUCTION), MOCK_OUTLINE],
	[(prompt) => prompt.startsWith(REVIEW_INSTRUCTION), NO_FINDINGS],
];

function mockResponse({ prompt }: LLMGenerateParams): string {
	return (
		MOCK_RESPONSES.find(([matches]) => matches(prompt))?.[1] ?? MOCK_SCRIPT
	);
}

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
			costUsd: 0,
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
		return 0;
	}

	agentModel(modelId: string): AgentModel {
		return {
			model: mockAgentModel(),
			modelId,
			providerOptions: {},
			cachedPrefix: {},
			costOf: () => 0,
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

type MockStep = { say: string; toolName?: AgentToolName; input?: unknown };

const READ_SCRIPT: MockStep = {
	say: "Reading the script. ",
	toolName: "read_script",
	input: {},
};

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

	if (!elementId) {
		return {
			say: "Naming the project. ",
			toolName: "set_title",
			input: { title: project.title },
		};
	}

	if (scene === null && !EDIT_REQUEST.test(asked)) {
		return {
			say: "No API key is set, so I am a mock. Ask me to change the script and I will edit it.",
		};
	}

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
	return {
		say: "Rewriting an element. ",
		toolName: "edit_script",
		input: { ops },
	};
}

/** A new project is named, given its assets, then written; a replaced script is read again. */
type NextStep = (results: ToolResult[]) => MockStep;

const NEXT_STEP: Record<string, NextStep> = {
	write_script: () => READ_SCRIPT,
	set_title: () => ({
		say: "Setting up the characters and the art style. ",
		toolName: "edit_script",
		input: { ops: MOCK_ASSETS },
	}),
	edit_script: (results) =>
		results.at(-2)?.toolName === "set_title"
			? {
					say: "Writing a script onto the canvas. ",
					toolName: "write_script",
					input: { brief: "A short mock story, written without an API key." },
				}
			: { say: "Done. That is as much as a mock can do without an API key." },
} satisfies Partial<Record<AgentToolName, NextStep>>;

function mockCall(prompt: LanguageModelV3Prompt): MockStep {
	const results = turnToolResults(prompt);
	const last = results.at(-1);
	// The canvas is never in the prompt, so a turn reads it before anything else.
	if (!last) return READ_SCRIPT;
	return (
		NEXT_STEP[last.toolName]?.(results) ??
		afterReading(lastUserText(prompt), last)
	);
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
				...parts("reasoning", "r0", MOCK_THOUGHT),
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
