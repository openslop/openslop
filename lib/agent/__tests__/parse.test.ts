import { describe, expect, it } from "vitest";
import { parseSloppyMessage, parseSloppyMessages } from "../messages";

describe("parseSloppyMessage", () => {
	it("reads a message the editor sent", async () => {
		const message = await parseSloppyMessage({
			id: "m1",
			role: "user",
			parts: [{ type: "text", text: "make it shorter" }],
		});

		expect(message).toMatchObject({ id: "m1", role: "user" });
	});

	it("reads a step carrying what a tool returned", async () => {
		const message = await parseSloppyMessage({
			id: "m2",
			role: "assistant",
			parts: [
				{
					type: "tool-read_script",
					toolCallId: "c1",
					state: "output-available",
					input: {},
					output: "the script",
				},
			],
		});

		expect(message?.parts).toHaveLength(1);
	});

	it("refuses a message in the wrong shape rather than throwing", async () => {
		await expect(parseSloppyMessage({ role: "wizard" })).resolves.toBeNull();
	});

	it("refuses an unanswered call carrying input its own tool cannot take", async () => {
		const message = await parseSloppyMessage({
			id: "m3",
			role: "assistant",
			parts: [
				{
					type: "tool-edit_script",
					toolCallId: "c1",
					state: "input-available",
					input: { brief: "not ops" },
				},
			],
		});

		expect(message).toBeNull();
	});

	it("refuses a step claiming a tool returned something other than text", async () => {
		const message = await parseSloppyMessage({
			id: "m4",
			role: "assistant",
			parts: [
				{
					type: "tool-read_script",
					toolCallId: "c1",
					state: "output-available",
					input: {},
					output: { not: "a string" },
				},
			],
		});

		expect(message).toBeNull();
	});
});

describe("parseSloppyMessages", () => {
	it("reads a conversation nobody has said anything in yet", async () => {
		await expect(parseSloppyMessages([])).resolves.toEqual([]);
	});

	it("reads the rows of a conversation that has run", async () => {
		const messages = await parseSloppyMessages([
			{ id: "m1", role: "user", parts: [{ type: "text", text: "hi" }] },
			{
				id: "m2",
				role: "assistant",
				parts: [{ type: "text", text: "ok boss" }],
			},
		]);

		expect(messages.map((message) => message.id)).toEqual(["m1", "m2"]);
	});
});
