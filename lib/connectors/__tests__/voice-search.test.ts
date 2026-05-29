import { describe, expect, it, vi } from "vitest";
import { createVoiceSearchPlugin } from "@/lib/connectors/tts/plugins/voice-search";
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
		const { ctx, searchVoices } = ctxWith([
			{ id: "x", name: "X", description: "" },
		]);
		const { beforeGenerate } = createVoiceSearchPlugin();
		const params = {
			prompt: "hi",
			voiceId: "preset",
			gender: "masculine" as const,
		};
		const result = await beforeGenerate?.(params, ctx);
		expect(result).toEqual(params);
		expect(searchVoices).not.toHaveBeenCalled();
	});

	it("calls searchVoices with all voice descriptors", async () => {
		const { ctx, searchVoices } = ctxWith([
			{ id: "v-42", name: "Forty-Two", description: "" },
		]);
		const { beforeGenerate } = createVoiceSearchPlugin();
		await beforeGenerate?.(
			{
				prompt: "hi",
				gender: "feminine",
				accent: "british",
				query: "narrator",
				language: "en",
				age: "adult",
				pitch: "high",
				description: "raspy",
				name: "Red",
			},
			ctx,
		);
		expect(searchVoices).toHaveBeenCalledWith({
			gender: "feminine",
			age: "adult",
			pitch: "high",
			accent: "british",
			description: "raspy",
			query: "narrator",
			language: "en",
		});
	});

	it("assigns first voice's id, strips descriptors, and preserves name", async () => {
		const { ctx } = ctxWith([
			{ id: "v-1", name: "First", description: "" },
			{ id: "v-2", name: "Second", description: "" },
		]);
		const { beforeGenerate } = createVoiceSearchPlugin();
		const result = await beforeGenerate?.(
			{
				prompt: "hi",
				model: "test-model",
				gender: "feminine",
				age: "adult",
				pitch: "high",
				accent: "british",
				description: "raspy",
				name: "Red",
				query: "narrator",
				language: "en",
			},
			ctx,
		);
		expect(result).toEqual({
			prompt: "hi",
			model: "test-model",
			name: "Red",
			voiceId: "v-1",
		});
	});

	it("defaults language to 'en' when not provided", async () => {
		const { ctx, searchVoices } = ctxWith([
			{ id: "v-1", name: "First", description: "" },
		]);
		const { beforeGenerate } = createVoiceSearchPlugin();
		await beforeGenerate?.({ prompt: "hi", gender: "feminine" }, ctx);
		expect(searchVoices).toHaveBeenCalledWith(
			expect.objectContaining({ language: "en" }),
		);
	});

	it("throws when searchVoices returns empty", async () => {
		const { ctx } = ctxWith([]);
		const { beforeGenerate } = createVoiceSearchPlugin();
		await expect(
			beforeGenerate?.({ prompt: "hi", gender: "masculine" }, ctx),
		).rejects.toThrow("No matching voice found");
	});

	it("throws when ctx.searchVoices is missing", async () => {
		const { beforeGenerate } = createVoiceSearchPlugin();
		await expect(beforeGenerate?.({ prompt: "hi" }, {})).rejects.toThrow(
			/searchVoices/,
		);
	});
});
