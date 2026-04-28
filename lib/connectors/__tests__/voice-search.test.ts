import { describe, expect, it, vi } from "vitest";
import { createVoiceSearchPlugin } from "../plugins/voice-search";
import type { PluginContext, VoiceInfo } from "../types";

function ctxWith(voices: VoiceInfo[]): {
	ctx: PluginContext;
	searchVoices: ReturnType<typeof vi.fn>;
} {
	const searchVoices = vi.fn(async () => voices);
	return { ctx: { searchVoices }, searchVoices };
}

describe("createVoiceSearchPlugin", () => {
	it("has the expected name", () => {
		expect(createVoiceSearchPlugin().name).toBe("voice-search");
	});

	it("returns params unchanged when voiceId already set", async () => {
		const { ctx, searchVoices } = ctxWith([{ id: "x", name: "X" }]);
		const { beforeGenerate } = createVoiceSearchPlugin();
		const params = { prompt: "hi", voiceId: "preset", gender: "male" };
		const result = await beforeGenerate?.(params, ctx);
		expect(result).toEqual(params);
		expect(searchVoices).not.toHaveBeenCalled();
	});

	it("calls searchVoices with all voice descriptors", async () => {
		const { ctx, searchVoices } = ctxWith([{ id: "v-42", name: "Forty-Two" }]);
		const { beforeGenerate } = createVoiceSearchPlugin();
		await beforeGenerate?.(
			{
				prompt: "hi",
				gender: "female",
				accent: "british",
				query: "narrator",
				language: "en",
				age: "adult",
				pitch: "high",
				texture: "raspy",
				name: "Red",
			},
			ctx,
		);
		expect(searchVoices).toHaveBeenCalledWith({
			gender: "female",
			age: "adult",
			pitch: "high",
			accent: "british",
			texture: "raspy",
			query: "narrator",
			language: "en",
		});
	});

	it("assigns first voice's id and strips descriptor/lookup fields", async () => {
		const { ctx } = ctxWith([
			{ id: "v-1", name: "First" },
			{ id: "v-2", name: "Second" },
		]);
		const { beforeGenerate } = createVoiceSearchPlugin();
		const result = await beforeGenerate?.(
			{
				prompt: "hi",
				model: "test-model",
				gender: "female",
				age: "adult",
				pitch: "high",
				accent: "british",
				texture: "raspy",
				name: "Red",
				query: "narrator",
				language: "en",
			},
			ctx,
		);
		expect(result).toEqual({
			prompt: "hi",
			model: "test-model",
			voiceId: "v-1",
		});
	});

	it("throws when searchVoices returns empty", async () => {
		const { ctx } = ctxWith([]);
		const { beforeGenerate } = createVoiceSearchPlugin();
		await expect(
			beforeGenerate?.({ prompt: "hi", gender: "alien" }, ctx),
		).rejects.toThrow("No matching voice found");
	});

	it("throws when ctx.searchVoices is missing", async () => {
		const { beforeGenerate } = createVoiceSearchPlugin();
		await expect(beforeGenerate?.({ prompt: "hi" }, {})).rejects.toThrow(
			/searchVoices/,
		);
	});
});
