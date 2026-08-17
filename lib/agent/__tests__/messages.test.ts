import { describe, expect, it } from "vitest";
import {
	addUsage,
	carriedMetadata,
	hasPendingToolCall,
	toolCallsMade,
	upsertMessage,
	withoutStaleReadings,
} from "../messages";
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
	metadata: {
		request: { system: "you are Sloppy", model: "claude-opus-5" },
		usage: { inputTokens: 100, outputTokens: 50, workSeconds: 3 },
	},
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
});

describe("carriedMetadata", () => {
	it("reads what the turn spent and what it is running on", () => {
		expect(carriedMetadata([asked, turn("output-available")])).toEqual({
			request: { system: "you are Sloppy", model: "claude-opus-5" },
			usage: { inputTokens: 100, outputTokens: 50, workSeconds: 3 },
		});
	});

	it("is unset on a turn that has not run yet", () => {
		expect(carriedMetadata([asked])).toBeUndefined();
	});
});

describe("addUsage", () => {
	it("adds a step to what the turn already spent", () => {
		expect(
			addUsage(
				{ inputTokens: 100, outputTokens: 50, workSeconds: 3 },
				{ inputTokens: 12, outputTokens: 7 },
				2,
			),
		).toEqual({ inputTokens: 112, outputTokens: 57, workSeconds: 5 });
	});

	it("starts from nothing on the first step of a turn", () => {
		expect(
			addUsage(undefined, { inputTokens: 12, outputTokens: 7 }, 2),
		).toEqual({ inputTokens: 12, outputTokens: 7, workSeconds: 2 });
	});
});

describe("withoutStaleReadings", () => {
	const read = (toolCallId: string, output: string) =>
		({
			type: "tool-read_script",
			toolCallId,
			state: "output-available",
			input: {},
			output,
		}) as const;

	const edit: SloppyMessage["parts"][number] = {
		type: "tool-edit_script",
		toolCallId: "e1",
		state: "output-available",
		input: { ops: [{ op: "remove", id: "n1" }] },
		output: "Applied 1 operation.",
	};

	const turnWith = (id: string, ...parts: SloppyMessage["parts"]) =>
		({ id, role: "assistant", parts }) as SloppyMessage;

	it("keeps every reading the turn in flight has taken", () => {
		const inFlight = turnWith(
			"m2",
			read("a", "was"),
			edit,
			read("b", "stands"),
		);

		expect(withoutStaleReadings([asked, inFlight])).toEqual([asked, inFlight]);
	});

	it("drops the readings of a turn that has finished", () => {
		const finished = turnWith("m2", read("a", "was"), edit);

		expect(withoutStaleReadings([asked, finished, asked])).toEqual([
			asked,
			turnWith("m2", edit),
			asked,
		]);
	});

	it("leaves what the user said alone", () => {
		expect(withoutStaleReadings([asked])).toEqual([asked]);
	});
});
