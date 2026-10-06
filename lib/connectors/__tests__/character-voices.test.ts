import { beforeEach, describe, expect, it, vi } from "vitest";
import { asset } from "@/lib/canvas/__tests__/_assets";
import { voiceAttrs } from "@/lib/canvas/assets";
import { createCanvasNode } from "@/lib/canvas/createCanvasNode";
import type { ScriptElement } from "@/lib/canvas/types";
import { DEFAULT_TTS_MODEL } from "@/lib/connectors/tts/models";
import {
	createCharacterVoicesPlugin,
	type ParamsWithCharacterVoices,
} from "../video/plugins/character-voices";
import type { ModelRef, TTSConnector, VoiceSearchParams } from "../types";
import { buildCtx, pluginCtx, readsOf } from "./_state-ctx";

const tts = vi.hoisted(() => ({
	searchVoices: vi.fn(),
	voicePreview: vi.fn(),
	createConnector: vi.fn(),
}));
vi.mock("@/lib/connectors/factory", async (importOriginal) => ({
	...(await importOriginal<typeof import("@/lib/connectors/factory")>()),
	createConnector: tts.createConnector,
}));

const SEEDANCE = { provider: "openslop", model: "Slop Video v1" } as const;
const KLING = { provider: "openslop", model: "Slop Video v1 Fast" } as const;
const MUTE = "v-mute";

beforeEach(() => {
	tts.searchVoices.mockReset();
	tts.searchVoices.mockResolvedValue([
		{ id: "v-found", name: "Found", description: "" },
	]);
	tts.voicePreview.mockReset();
	tts.voicePreview.mockImplementation(async (voiceId: string) =>
		voiceId === MUTE
			? undefined
			: { url: `https://audio/${voiceId}.mp3`, durationSec: 6 },
	);
	tts.createConnector.mockImplementation(
		(_type: string, model: ModelRef): Partial<TTSConnector> => ({
			searchVoices: (params: VoiceSearchParams) =>
				tts.searchVoices(model, params),
			voicePreview: tts.voicePreview,
		}),
	);
});

const plugin = createCharacterVoicesPlugin();

const video = (characters?: string, model: ModelRef = SEEDANCE) =>
	createCanvasNode("video", {
		id: "video-1",
		attrs: characters ? { characters, ...model } : model,
	});

const voice = (name: string, voiceId?: string) =>
	asset("asset_character", {
		name,
		attrs: voiceId ? voiceAttrs({ ...DEFAULT_TTS_MODEL, voiceId }) : {},
	});

const prepare = async (
	characters: string | undefined,
	canvas: ScriptElement[],
	model: ModelRef = SEEDANCE,
) => {
	if (!plugin.prepare) throw new Error("no prepare");
	return plugin.prepare(video(characters, model), buildCtx(canvas));
};

const before = async (
	params: ParamsWithCharacterVoices,
	canvas: ScriptElement[] = [],
	model: ModelRef | null = SEEDANCE,
) => {
	if (!plugin.beforeGenerate) throw new Error("no beforeGenerate");
	return plugin.beforeGenerate(params, {
		...pluginCtx({ reads: readsOf(plugin, video(params.characters), canvas) }),
		model: model ?? undefined,
	});
};

describe("character-voices plugin", () => {
	it("reads the voice each shown character has chosen, and declares no dependency", () => {
		expect(
			readsOf(plugin, video("Sol, Ghost"), [voice("Sol", "v-sol")]),
		).toEqual({
			"Sol's voice": JSON.stringify({ ...DEFAULT_TTS_MODEL, voiceId: "v-sol" }),
		});
		expect(plugin.dependencies).toBeUndefined();
	});

	describe("prepare", () => {
		it("settles a voice on each character whose voice has no id yet", async () => {
			await expect(
				prepare("Sol, Mira", [voice("Sol", "v-sol"), voice("Mira")]),
			).resolves.toEqual([
				{
					type: "asset_character",
					name: "Mira",
					attrs: voiceAttrs({ ...DEFAULT_TTS_MODEL, voiceId: "v-found" }),
				},
			]);
			expect(tts.searchVoices).toHaveBeenCalledOnce();
		});

		it.each([
			["a character with no character asset", "Ghost", [], SEEDANCE],
			["a video model that does not listen", "Mira", [voice("Mira")], KLING],
			["a video with no characters", undefined, [], SEEDANCE],
		])("searches no voice for %s", async (_, characters, canvas, model) => {
			await expect(prepare(characters, canvas, model)).resolves.toEqual([]);
			expect(tts.searchVoices).not.toHaveBeenCalled();
		});
	});

	describe("beforeGenerate", () => {
		it("lends each character's voice preview as a reference audio named after them", async () => {
			await expect(
				before({ prompt: "they talk", characters: "Sol, Mira" }, [
					voice("Sol", "v-sol"),
					voice("Mira", "v-mira"),
				]),
			).resolves.toEqual({
				prompt: "they talk",
				characters: "Sol, Mira",
				referenceAudios: [
					{ url: "https://audio/v-sol.mp3", durationSec: 6, speaker: "Sol" },
					{ url: "https://audio/v-mira.mp3", durationSec: 6, speaker: "Mira" },
				],
			});
		});

		it("passes over a character with no voice, or one whose voice has no preview", async () => {
			await expect(
				before({ prompt: "they talk", characters: "Sol, Mute, Ghost" }, [
					voice("Sol", "v-sol"),
					voice("Mute", MUTE),
				]),
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
				before(params, [voice("Sol", "v-sol")], model),
			).resolves.toEqual(params);
			expect(tts.voicePreview).not.toHaveBeenCalled();
		});

		it("fails loudly without the pair it runs on", async () => {
			await expect(
				before({ prompt: "they talk", characters: "Sol" }, [], null),
			).rejects.toThrow(/requires model/);
		});
	});
});
