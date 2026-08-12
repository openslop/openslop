import { describe, expect, it } from "vitest";
import { GatewayClient } from "@/lib/gateway/base";
import { storyModePlugin } from "@/lib/connectors/llm/plugins/story-mode";
import type {
	LLMGenerateParams,
	LLMGenerateResult,
	PluginContext,
} from "../types";

class MockLLMGateway extends GatewayClient<
	LLMGenerateParams,
	LLMGenerateResult
> {
	async generate(_params: LLMGenerateParams): Promise<LLMGenerateResult> {
		return {
			text: "A brave knight rescues a dragon who turns out to be friendly.",
			model: "test",
		};
	}
}

class RecordingLLMGateway extends MockLLMGateway {
	readonly prompts: string[] = [];

	override async generate(
		params: LLMGenerateParams,
	): Promise<LLMGenerateResult> {
		this.prompts.push(params.prompt);
		return super.generate(params);
	}
}

const { transformPrompt } = storyModePlugin;
if (!transformPrompt)
	throw new Error("storyModePlugin.transformPrompt is required");

describe("storyModePlugin", () => {
	it("calls gateway to generate a story outline and rewrites the prompt", async () => {
		const gateway = new MockLLMGateway();
		const ctx: PluginContext<LLMGenerateParams, LLMGenerateResult> = {
			gateway,
		};

		const result = await transformPrompt("a knight and a dragon", ctx);

		expect(result).toContain(
			"A brave knight rescues a dragon who turns out to be friendly.",
		);
		expect(result).toContain("5th-grade reading level");
	});

	it("carries the input language across the outline hop, the only place it can survive", async () => {
		const gateway = new RecordingLLMGateway();
		const result = await transformPrompt("un chevalier et un dragon", {
			gateway,
		});

		expect(gateway.prompts.at(0)).toContain("same language as that input");
		expect(result).toContain("same language as the following outline");
	});

	it("pins both hops to the project's language, like the OSML prompt does", async () => {
		const gateway = new RecordingLLMGateway();
		const result = await transformPrompt("a knight and a dragon", {
			gateway,
			state: { metadata: { language: "fr" } },
		} as never);

		expect(gateway.prompts.at(0)).toContain("outline in fr (ISO 639-1)");
		expect(result).toContain("in fr (ISO 639-1)");
		expect(result).not.toContain("same language as the following outline");
	});

	it("throws when no context is provided", async () => {
		await expect(transformPrompt("test")).rejects.toThrow(
			"story-mode plugin requires gateway context",
		);
	});

	describe("beforeGenerate", () => {
		const { beforeGenerate } = storyModePlugin;
		if (!beforeGenerate)
			throw new Error("storyModePlugin.beforeGenerate is required");

		it("does not leak the literal string 'undefined' when no upstream systemPrompt is set", async () => {
			const result = await beforeGenerate({ prompt: "a knight" });
			expect(result.systemPrompt).toBeDefined();
			expect(result.systemPrompt).not.toContain("undefined");
			expect(result.systemPrompt).toContain("Storywriting guidelines");
		});

		it("appends an upstream systemPrompt after the storytelling guidelines", async () => {
			const result = await beforeGenerate({
				prompt: "a knight",
				systemPrompt: "PROJECT METADATA PREAMBLE",
			});
			expect(result.systemPrompt).toContain("Storywriting guidelines");
			expect(result.systemPrompt).toContain("PROJECT METADATA PREAMBLE");
		});
	});
});
