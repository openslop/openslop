import { join } from "node:path";
import type {
	LanguageModelV3CallOptions,
	LanguageModelV3FunctionTool,
	LanguageModelV3StreamPart,
} from "@ai-sdk/provider";
import { describe, expect, it } from "vitest";
import { localAgentModel } from "../language-model";

const FAKE_AGENT = `node ${join(__dirname, "_fake-agent.mjs")}`;

const options = (
	tools: LanguageModelV3CallOptions["tools"] = [],
): LanguageModelV3CallOptions => ({
	prompt: [{ role: "user", content: [{ type: "text", text: "Hi" }] }],
	tools,
});

async function parts(callOptions: LanguageModelV3CallOptions) {
	const { stream } = await localAgentModel(FAKE_AGENT).doStream(callOptions);
	const reader = stream.getReader();
	const streamed: LanguageModelV3StreamPart[] = [];
	for (;;) {
		const { done, value } = await reader.read();
		if (done) return streamed;
		streamed.push(value);
	}
}

const ADD_NOTE: LanguageModelV3FunctionTool = {
	type: "function",
	name: "add_note",
	description: "Adds a note",
	inputSchema: { type: "object", properties: { text: { type: "string" } } },
};

describe("localAgentModel", () => {
	it("streams thoughts and messages as their own blocks and ends with the agent's turn", async () => {
		const streamed = await parts(options());
		expect(streamed.map(({ type }) => type)).toEqual([
			"stream-start",
			"reasoning-start",
			"reasoning-delta",
			"reasoning-end",
			"text-start",
			"text-delta",
			"text-delta",
			"text-end",
			"text-start",
			"text-delta",
			"text-end",
			"finish",
		]);
		expect(streamed.at(-1)).toMatchObject({
			finishReason: { unified: "stop", raw: "end_turn" },
		});
	});

	it("ends the step on a tool call, for the editor to run", async () => {
		const streamed = await parts(options([ADD_NOTE]));
		expect(streamed.at(-2)).toMatchObject({
			type: "tool-call",
			toolName: "add_note",
			input: JSON.stringify({ text: "hi" }),
		});
		expect(streamed.at(-1)).toMatchObject({
			finishReason: { unified: "tool-calls" },
		});
	});

	it("offers no tools when the turn withdraws them", async () => {
		const streamed = await parts({
			...options([ADD_NOTE]),
			toolChoice: { type: "none" },
		});
		expect(streamed.some(({ type }) => type === "tool-call")).toBe(false);
	});
});
