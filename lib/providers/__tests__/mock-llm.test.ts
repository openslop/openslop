import type {
	LanguageModelV3Prompt,
	LanguageModelV3StreamPart,
} from "@ai-sdk/provider";
import { MockLanguageModelV3 } from "ai/test";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { attributeSchemaFor } from "@/lib/canvas/element-connector";
import { OSMLStreamParser } from "@/lib/canvas/osml-stream-parser";
import type { RefineOp } from "@/lib/script/refine/types";
import { MockLLM } from "../llm/mock";
import { MOCK_ASSETS_OSML, MOCK_SCRIPT } from "../llm/mock-fixtures";

describe("MockLLM", () => {
	it("falls back to a script for anything else", async () => {
		const {
			output: { text },
		} = await new MockLLM().generate({
			prompt: "write me a video",
		});

		expect(text).toContain("<speech");
	});

	it("writes only attribute values the canvas keeps", () => {
		const elements = new OSMLStreamParser().appendChunk(
			MOCK_ASSETS_OSML + MOCK_SCRIPT,
		);
		const dropped = elements.flatMap(({ type, attrs }) =>
			Object.entries(attrs)
				.filter(
					([key, value]) => !attributeSchemaFor(type, attrs).offers(key, value),
				)
				.map(([key, value]) => `${type} ${key}="${value}"`),
		);

		expect(dropped).toEqual([]);
	});
});

type Step = {
	text: string;
	thought: string;
	toolName?: string;
	toolCallId?: string;
	input?: unknown;
};

const EMPTY_CANVAS = "## Script\nThe canvas is empty.";
const WRITTEN_CANVAS = [
	"## Script",
	"```xml",
	'<asset_avatar id="avatar" name="Red">A girl in a red cloak.</asset_avatar>',
	"--- Scene 1 ---",
	'<speech id="n1">Once upon a time.</speech>',
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
		thought: chunks
			.flatMap((chunk) =>
				chunk.type === "reasoning-delta" ? [chunk.delta] : [],
			)
			.join(""),
		toolName: call?.toolName,
		toolCallId: call?.toolCallId,
		input: call ? JSON.parse(call.input) : undefined,
	};
}

describe("the mock agent model", () => {
	const random = (value: number) =>
		vi.spyOn(Math, "random").mockReturnValue(value);

	beforeEach(() => {
		vi.useFakeTimers();
		random(0.99);
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
		const { ops } = assets.input as { ops: RefineOp[] };
		const assetOps = ops.flatMap((op) => (op.op === "asset" ? [op] : []));
		expect(assetOps).toHaveLength(ops.length);
		expect(new Set(assetOps.map(({ type }) => type))).toEqual(
			new Set(["asset_style", "asset_avatar", "asset_voice"]),
		);
		expect(
			assetOps.flatMap(({ attrs }) => Object.keys(attrs ?? {})),
		).not.toContain("model");
		prompt.push(...ran("edit_script", `Applied ${ops.length} operations.`));

		const written = await step(prompt);
		expect(written).toMatchObject({
			toolName: "write_script",
			input: { osml: expect.any(String) },
		});
		prompt.push(...ran("write_script", "The script is on the canvas."));

		const reread = await step(prompt);
		expect(reread.toolName).toBe("read_script");
		prompt.push(...ran("read_script", WRITTEN_CANVAS));

		const answer = await step(prompt);
		expect(answer.toolName).toBeUndefined();
		expect(answer.text).not.toBe("");
	});

	it("writes a new project once, even when the ask reads like an edit", async () => {
		const prompt = user("add a scene about a fox");
		const steps = [
			["read_script", EMPTY_CANVAS],
			["set_title", "Set the title."],
			["edit_script", "Applied 3 operations."],
			["write_script", "The script is on the canvas."],
			["read_script", WRITTEN_CANVAS],
			["edit_script", "Applied 1 operation."],
			["fit_durations", "Every video fits its speech."],
		] as const;

		for (const [toolName, result] of steps) {
			expect((await step(prompt)).toolName).toBe(toolName);
			prompt.push(...ran(toolName, result));
		}

		expect((await step(prompt)).toolName).toBeUndefined();
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

		expect((await step(prompt)).toolName).toBe("fit_durations");
		prompt.push(...ran("fit_durations", "Every video fits its speech."));

		const done = await step(prompt);
		expect(done.toolName).toBeUndefined();
		expect(done.text).not.toBe("");
	});

	it("looks around a few times at random before it acts", async () => {
		random(0);
		const prompt = user("make the opening warmer");
		const looks: string[] = [];

		for (;;) {
			const { toolName } = await step(prompt);
			if (toolName === "read_script") break;
			looks.push(String(toolName));
			prompt.push(...ran(String(toolName), "Nothing much."));
		}

		expect(looks).toHaveLength(3);
		expect(new Set(looks).size).toBe(3);
	});

	it("loads up to six skills in one call", async () => {
		// Look, pick the last look (load_skill), take the most skills.
		random(0.99).mockReturnValueOnce(0).mockReturnValueOnce(0.99);

		const { toolName, input } = await step(user("make the opening warmer"));

		expect(toolName).toBe("load_skill");
		const { names } = input as { names: string[] };
		expect(new Set(names).size).toBe(6);
	});

	it("gives every call in a turn its own id", async () => {
		const prompt = user("make the opening warmer");

		const read = await step(prompt);
		prompt.push(...ran("read_script", WRITTEN_CANVAS));
		const edit = await step(prompt);

		expect(read.toolCallId).not.toBe(edit.toolCallId);
	});

	it("thinks before the first step and not always after", async () => {
		const prompt = user("make the opening warmer");

		expect((await step(prompt)).thought).not.toBe("");
		prompt.push(...ran("read_script", WRITTEN_CANVAS));

		expect((await step(prompt)).thought).toBe("");
	});
});
