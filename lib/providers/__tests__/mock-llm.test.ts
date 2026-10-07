import type {
	LanguageModelV3Prompt,
	LanguageModelV3StreamPart,
} from "@ai-sdk/provider";
import { MockLanguageModelV3 } from "ai/test";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { outlinePrompt } from "@/lib/script/prompt/outline";
import { NO_FINDINGS, reviewPrompt } from "@/lib/script/prompt/review";
import { MockLLM } from "../llm/mock";

describe("MockLLM", () => {
	it("answers an outline prompt with an outline, not a script", async () => {
		const { text } = await new MockLLM().generate({
			prompt: outlinePrompt("two friends in a forest", "English"),
		});

		expect(text).toContain("Premise:");
		expect(text).not.toContain("<narration");
	});

	it("answers a review with no findings, so a mock run ends the loop", async () => {
		const { text } = await new MockLLM().generate({
			prompt: reviewPrompt('<video id="v1">Shot 1: a rabbit.</video>'),
		});

		expect(text).toBe(NO_FINDINGS);
	});

	it("falls back to a script for anything else, with no metadata tags in it", async () => {
		const { text } = await new MockLLM().generate({
			prompt: "write me a video",
		});

		expect(text).toContain("<narration");
		expect(text).not.toContain("metadata_");
	});
});

type Step = { text: string; toolName?: string; input?: unknown };

const EMPTY_CANVAS = "## Script\nThe canvas is empty.";
const WRITTEN_CANVAS = [
	"## Script",
	"```xml",
	'<asset_avatar id="asset_avatar:Red" name="Red">A girl in a red cloak.</asset_avatar>',
	"--- Scene 1 ---",
	'<narration id="n1">Once upon a time.</narration>',
	'<image id="img1">A cottage at dawn.</image>',
	"```",
].join("\n");

const user = (text: string): LanguageModelV3Prompt => [
	{ role: "user", content: [{ type: "text", text }] },
];

const ran = (toolName: string, result: string): LanguageModelV3Prompt => [
	{
		role: "assistant",
		content: [
			{
				type: "tool-call",
				toolCallId: `mock-${toolName}`,
				toolName,
				input: {},
			},
		],
	},
	{
		role: "tool",
		content: [
			{
				type: "tool-result",
				toolCallId: `mock-${toolName}`,
				toolName,
				output: { type: "text", value: result },
			},
		],
	},
];

async function step(prompt: LanguageModelV3Prompt): Promise<Step> {
	const { model } = new MockLLM().agentModel("mock");
	if (!(model instanceof MockLanguageModelV3))
		throw new Error("the mock agent runs on a mock model");
	const { stream } = await model.doStream({ prompt });

	const chunks: LanguageModelV3StreamPart[] = [];
	const reader = stream.getReader();
	const drained = (async () => {
		for (;;) {
			const { done, value } = await reader.read();
			if (done) return;
			chunks.push(value);
		}
	})();
	await vi.runAllTimersAsync();
	await drained;

	const call = chunks.find((chunk) => chunk.type === "tool-call");
	return {
		text: chunks
			.flatMap((chunk) => (chunk.type === "text-delta" ? [chunk.delta] : []))
			.join(""),
		toolName: call?.toolName,
		input: call ? JSON.parse(call.input) : undefined,
	};
}

describe("the mock agent model", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("names a new project, sets up its assets, then writes the script", async () => {
		const prompt = user("a story about a girl in a red cloak");

		const read = await step(prompt);
		expect(read).toMatchObject({ toolName: "read_script", input: {} });
		prompt.push(...ran("read_script", EMPTY_CANVAS));

		const titled = await step(prompt);
		expect(titled).toMatchObject({
			toolName: "set_title",
			input: { title: expect.any(String) },
		});
		prompt.push(...ran("set_title", "Set the title."));

		const assets = await step(prompt);
		expect(assets.toolName).toBe("edit_script");
		const { ops } = assets.input as { ops: { op: string; type: string }[] };
		expect(new Set(ops.map(({ op, type }) => `${op} ${type}`))).toEqual(
			new Set([
				"insert asset_style",
				"insert asset_avatar",
				"insert asset_voice",
			]),
		);
		prompt.push(...ran("edit_script", `Applied ${ops.length} operations.`));

		const written = await step(prompt);
		expect(written).toMatchObject({
			toolName: "write_script",
			input: { brief: expect.any(String) },
		});
		prompt.push(...ran("write_script", "The script is on the canvas."));

		const reread = await step(prompt);
		expect(reread.toolName).toBe("read_script");
		prompt.push(...ran("read_script", WRITTEN_CANVAS));

		const answer = await step(prompt);
		expect(answer.toolName).toBeUndefined();
		expect(answer.text).not.toBe("");
	});

	it("makes one edit to a script already on the canvas, then finishes", async () => {
		const prompt = user("make the opening warmer");

		expect((await step(prompt)).toolName).toBe("read_script");
		prompt.push(...ran("read_script", WRITTEN_CANVAS));

		const edit = await step(prompt);
		expect(edit).toMatchObject({
			toolName: "edit_script",
			input: { ops: [{ op: "set", id: "n1", text: expect.any(String) }] },
		});
		prompt.push(...ran("edit_script", "Applied 1 operation."));

		const done = await step(prompt);
		expect(done.toolName).toBeUndefined();
		expect(done.text).not.toBe("");
	});
});
