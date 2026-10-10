import { describe, expect, it } from "vitest";
import { asset } from "@/lib/canvas/__tests__/_assets";
import { createCanvasElement } from "@/lib/canvas/createCanvasElement";
import {
	createCharacterVoicesPlugin,
	type ParamsWithCharacterVoices,
} from "../video/plugins/characterVoices";
import type { AssetResult, ModelRef } from "../types";
import { dependenciesOf, pluginCtx } from "./_stateCtx";

const SEEDANCE = { provider: "openslop", model: "Slop Video v1" } as const;
const KLING = { provider: "openslop", model: "Slop Video v1 Fast" } as const;

const plugin = createCharacterVoicesPlugin();

const video = (characters?: string, model: ModelRef = SEEDANCE) =>
	createCanvasElement("video", {
		id: "video-1",
		attrs: characters ? { characters, ...model } : model,
	});

const found = (voiceId: string): AssetResult => ({
	audioUrl: `https://audio/${voiceId}.mp3`,
	durationSec: 6,
});

const before = async (
	params: ParamsWithCharacterVoices,
	voices: Record<string, AssetResult> = {},
	model: ModelRef = SEEDANCE,
) => {
	if (!plugin.beforeGenerate) throw new Error("no beforeGenerate");
	return plugin.beforeGenerate(
		{ ...params, ...model },
		pluginCtx({ dependencies: voices }),
	);
};

describe("character-voices plugin", () => {
	it("depends on the voice of each shown character that has one", () => {
		const sol = asset("asset_voice", { name: "Sol" });

		expect(dependenciesOf(plugin, video("Sol, Ghost"), [sol])).toEqual({
			"Sol's voice": sol.id,
		});
	});

	it("depends on no voice for a video model that does not listen", () => {
		expect(
			dependenciesOf(plugin, video("Sol", KLING), [
				asset("asset_voice", { name: "Sol" }),
			]),
		).toEqual({});
	});

	describe("beforeGenerate", () => {
		it("lends each character's voice preview as a reference audio named after them", async () => {
			await expect(
				before(
					{ prompt: "they talk", characters: "Sol, Mira" },
					{ "Sol's voice": found("v-sol"), "Mira's voice": found("v-mira") },
				),
			).resolves.toEqual({
				prompt: "they talk",
				characters: "Sol, Mira",
				...SEEDANCE,
				referenceAudios: [
					{ url: "https://audio/v-sol.mp3", durationSec: 6, speaker: "Sol" },
					{ url: "https://audio/v-mira.mp3", durationSec: 6, speaker: "Mira" },
				],
			});
		});

		it("passes over a character with no voice", async () => {
			await expect(
				before(
					{ prompt: "they talk", characters: "Sol, Ghost" },
					{ "Sol's voice": found("v-sol") },
				),
			).resolves.toMatchObject({
				referenceAudios: [
					{ url: "https://audio/v-sol.mp3", durationSec: 6, speaker: "Sol" },
				],
			});
		});

		it.each([
			["characters that lend no voice", "Ghost", SEEDANCE],
			["no characters", undefined, SEEDANCE],
			["a model that does not listen", "Sol", KLING],
		])("leaves a video with %s alone", async (_, characters, model) => {
			const params = { prompt: "they talk", characters };
			await expect(
				before(params, { "Sol's voice": found("v-sol") }, model),
			).resolves.toEqual({ ...params, ...model });
		});
	});
});
