import { convertToModelMessages } from "ai";
import { describe, expect, it } from "vitest";
import {
	hasPendingToolCall,
	settleUnansweredCalls,
	toolCallsMade,
	upsertMessage,
	pruneTranscript,
} from "../messages";
import {
	DRAFTING_TOOLS,
	SLOPPY_TOOLS,
	SNAPSHOT_TOOLS,
} from "../tools/registry";
import type { SloppyMessage } from "../types";

const asked: SloppyMessage = {
	id: "m1",
	role: "user",
	parts: [{ type: "text", text: "make it shorter" }],
};

const turn = (
	state: "input-available" | "output-available",
	parts = 1,
): SloppyMessage => ({
	id: "m2",
	role: "assistant",
	metadata: { workSeconds: 3 },
	parts: Array.from({ length: parts }, (_part, index) => ({
		type: "tool-read_script",
		toolCallId: `call-${index}`,
		input: {},
		...(state === "output-available"
			? { state, output: "the script" }
			: { state }),
	})),
});

describe("upsertMessage", () => {
	it("appends a message the transcript has not seen", () => {
		expect(upsertMessage([asked], turn("input-available"))).toEqual([
			asked,
			turn("input-available"),
		]);
	});

	it("replaces the message a later step grew, rather than storing it twice", () => {
		const grown = turn("output-available");
		const messages = upsertMessage([asked, turn("input-available")], grown);

		expect(messages).toEqual([asked, grown]);
	});
});

describe("toolCallsMade", () => {
	it("counts what the turn has spent of its budget", () => {
		expect(toolCallsMade([asked, turn("output-available", 3)])).toBe(3);
	});

	it("is nothing when the turn has only just been asked for", () => {
		expect(toolCallsMade([asked])).toBe(0);
	});
});

describe("hasPendingToolCall", () => {
	it("sees a call the editor has been handed and not answered", () => {
		expect(hasPendingToolCall([asked, turn("input-available")])).toBe(true);
	});

	it("sees none once the editor has answered", () => {
		expect(hasPendingToolCall([asked, turn("output-available")])).toBe(false);
	});

	it("sees only the tools it is asked about", () => {
		const pending = [asked, turn("input-available")];
		expect(hasPendingToolCall(pending, DRAFTING_TOOLS)).toBe(false);
		expect(hasPendingToolCall(pending, SNAPSHOT_TOOLS)).toBe(true);
	});
});

describe("settleUnansweredCalls", () => {
	it("settles a call the editor never answered, so nothing waits on it", () => {
		const settled = settleUnansweredCalls([asked, turn("input-available")]);

		expect(settled).toEqual([
			asked,
			{
				...turn("input-available"),
				parts: [
					{
						type: "tool-read_script",
						toolCallId: "call-0",
						input: {},
						state: "output-error",
						errorText: "Stopped before the editor ran it",
					},
				],
			},
		]);
		expect(hasPendingToolCall(settled)).toBe(false);
	});

	it("leaves answered calls and what the user said alone", () => {
		const transcript = [asked, turn("output-available")];

		expect(settleUnansweredCalls(transcript)).toEqual(transcript);
	});
});

describe("pruneTranscript", () => {
	const read = (toolCallId: string, output: string) =>
		({
			type: "tool-read_script",
			toolCallId,
			state: "output-available",
			input: {},
			output,
		}) as const;

	const look: SloppyMessage["parts"][number] = {
		type: "tool-view_image",
		toolCallId: "v1",
		state: "output-available",
		input: { id: "img1" },
		output: { id: "img1", prompt: "a cat", urls: ["https://cdn.test/cat.png"] },
	};

	const edit: SloppyMessage["parts"][number] = {
		type: "tool-edit_script",
		toolCallId: "e1",
		state: "output-available",
		input: { ops: [{ op: "remove", id: "n1" }] },
		output: "Applied 1 operation.",
	};

	const say = (text: string) => ({ type: "text", text }) as const;
	const step = { type: "step-start" } as const;

	const thought = (text: string) =>
		({
			type: "reasoning",
			text,
			providerMetadata: { anthropic: { signature: `sig-${text}` } },
		}) as const;

	const turnWith = (id: string, ...parts: SloppyMessage["parts"]) =>
		({ id, role: "assistant", parts }) as SloppyMessage;

	const modelView = async (messages: SloppyMessage[]) =>
		pruneTranscript(
			await convertToModelMessages(messages, { tools: SLOPPY_TOOLS }),
		);

	const stale = {
		type: "text",
		value:
			"Taken in an earlier turn and not kept. The canvas may have changed since.",
	};

	const finished = turnWith(
		"m2",
		thought("first"),
		say("ok boss reading the script"),
		read("a", "the script as it was"),
		step,
		say("on it boss, making him taller"),
		edit,
		step,
		say("done boss"),
	);

	it("keeps the announcement and the call it announced together", async () => {
		const [user, announced, result] = await modelView([asked, finished, asked]);

		expect(user).toEqual({
			role: "user",
			content: [{ type: "text", text: "make it shorter" }],
		});
		expect(announced).toEqual({
			role: "assistant",
			content: [
				{ type: "text", text: "ok boss reading the script" },
				expect.objectContaining({ type: "tool-call", toolName: "read_script" }),
			],
		});
		expect(result).toMatchObject({
			role: "tool",
			content: [
				{ type: "tool-result", toolName: "read_script", output: stale },
			],
		});
	});

	it("drops a finished turn's reasoning and keeps its edits", async () => {
		const sent = JSON.stringify(await modelView([asked, finished, asked]));

		expect(sent).not.toContain("reasoning");
		expect(sent).toContain("Applied 1 operation.");
	});

	it("keeps a finished turn's look as a look, without the picture", async () => {
		const looked = turnWith("m2", say("let me see"), look, step, say("cute"));
		const [, , result] = await modelView([asked, looked, asked]);

		expect(result).toMatchObject({
			role: "tool",
			content: [{ type: "tool-result", toolName: "view_image", output: stale }],
		});
	});

	it("keeps every reading the turn in flight has taken", async () => {
		const inFlight = turnWith(
			"m2",
			read("a", "the script as it was"),
			edit,
			read("b", "the script as it stands"),
		);
		const sent = JSON.stringify(await modelView([asked, inFlight]));

		expect(sent).toContain("the script as it was");
		expect(sent).toContain("the script as it stands");
	});

	it("keeps the reasoning of the turn in flight, which is signed with its calls", async () => {
		const inFlight = turnWith("m2", thought("first"), read("a", "was"));
		const [, thinking] = await modelView([asked, inFlight]);

		expect(thinking).toMatchObject({
			role: "assistant",
			content: [
				{ type: "reasoning", text: "first" },
				{ type: "tool-call", toolName: "read_script" },
			],
		});
	});
});
