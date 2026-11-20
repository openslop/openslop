import { beforeEach, expect, it, vi } from "vitest";
import type { LanguageModelV3 } from "@ai-sdk/provider";
import { claudeAgentModel } from "../agent-model";
import { generateWithClaude } from "../generate";
vi.mock("../generate", () => ({ generateWithClaude: vi.fn() }));
beforeEach(() => vi.clearAllMocks());
it("returns tool requests to the app instead of executing them in Claude Code", async () => {
	vi.mocked(generateWithClaude).mockResolvedValue(
		JSON.stringify({
			text: "Updating the title",
			calls: [{ name: "set_title", input: '{"title":"Hello"}' }],
		}),
	);
	const model = claudeAgentModel("user").model as LanguageModelV3;
	const result = await model.doGenerate({
		prompt: [],
		tools: [
			{ type: "function", name: "set_title", inputSchema: { type: "object" } },
		],
	});
	expect(vi.mocked(generateWithClaude).mock.calls[0][4]).toMatchObject({
		$schema: "http://json-schema.org/draft-07/schema#",
	});
	expect(result.finishReason.unified).toBe("tool-calls");
	expect(result.content[1]).toMatchObject({
		type: "tool-call",
		toolName: "set_title",
		input: '{"title":"Hello"}',
	});
});
it("rejects calls when the app has withdrawn tools", async () => {
	vi.mocked(generateWithClaude).mockResolvedValue(
		JSON.stringify({ text: "", calls: [{ name: "set_title", input: "{}" }] }),
	);
	const model = claudeAgentModel("user").model as LanguageModelV3;
	await expect(
		model.doGenerate({
			prompt: [],
			toolChoice: { type: "none" },
			tools: [{ type: "function", name: "set_title", inputSchema: {} }],
		}),
	).rejects.toThrow("unavailable tool");
});
it("propagates disconnect cancellation", async () => {
	vi.mocked(generateWithClaude).mockResolvedValue(
		JSON.stringify({ text: "Hello", calls: [] }),
	);
	const controller = new AbortController();
	const model = claudeAgentModel("user", controller.signal)
		.model as LanguageModelV3;
	await model.doGenerate({ prompt: [] });
	expect(vi.mocked(generateWithClaude).mock.calls[0][3]).toBe(
		controller.signal,
	);
});
