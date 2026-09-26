import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { DEFAULT_CONNECTOR_REGISTRY } from "@/lib/connectors/registry";
import { HttpTTSConnector } from "@/lib/connectors/tts/connector";
import { DEFAULT_TTS_MODEL } from "@/lib/connectors/tts/models";
import { createMetadataVoicePlugin } from "@/lib/connectors/tts/plugins/metadata-voice";
import { createVoiceHydratePlugin } from "@/lib/connectors/tts/plugins/voice-hydrate";
import { createVoiceSearchPlugin } from "@/lib/connectors/tts/plugins/voice-search";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { createProjectStore, type ProjectData } from "@/lib/project/store";
import { MetadataSchema } from "@/lib/project/types";
import {
	characterVoices,
	createCharacterVoicesPlugin,
	type ParamsWithCharacterVoices,
} from "../video/plugins/character-voices";
import type {
	ConnectorPlugin,
	GenerationContext,
	HostedVoicePreview,
	ModelRef,
	PluginContext,
	TTSConnector,
} from "../types";
import { mockGatewaySequence } from "./_gateway-mock";

const CARTESIA = { provider: "cartesia", model: "Sonic 3.6" } as const;
const HOSTED = { provider: "openslop", model: "Slop TTS v1" } as const;
const SEEDANCE = { provider: "openslop", model: "Slop Video v1" } as const;
const KLING = { provider: "openslop", model: "Slop Video v1 Fast" } as const;

const stateWith = (
	characters: Record<string, Record<string, string>>,
): ProjectData => ({
	metadata: MetadataSchema.parse({
		characters: Object.fromEntries(
			Object.entries(characters).map(([name, voice]) => [
				name,
				{ appearance: "", ...voice },
			]),
		),
	}),
	referenceImages: [],
});

const PICKED = { ...CARTESIA, voiceId: "v-sol" };

/** What each character's speech answers when asked for their voice. */
const SPOKEN_WITH: Record<string, string> = {
	Sol: "v-sol",
	Mira: "v-mira",
	Unpicked: "v-found",
	Mute: "v-mute",
};

const hosted = (voiceId: string): HostedVoicePreview => ({
	url: `https://audio/${voiceId}.mp3`,
	durationSec: 6,
});

describe("character-voices plugin", () => {
	let plugin: ConnectorPlugin<ParamsWithCharacterVoices>;
	let speech: Mock<(model: ModelRef) => TTSConnector>;
	let voiceFor: Mock<
		(
			model: ModelRef,
			name: string | undefined,
			context?: GenerationContext,
		) => Promise<string | undefined>
	>;
	let voicePreview: Mock<
		(
			model: ModelRef,
			voiceId: string,
		) => Promise<HostedVoicePreview | undefined>
	>;

	const before = (
		params: ParamsWithCharacterVoices,
		state: ProjectData,
		ctx: Partial<PluginContext> = {},
	) => {
		if (!plugin.beforeGenerate) throw new Error("no beforeGenerate");
		return plugin.beforeGenerate(params, {
			state,
			model: SEEDANCE,
			speech,
			...ctx,
		});
	};

	beforeEach(() => {
		plugin = createCharacterVoicesPlugin();
		voiceFor = vi.fn(async (_model, name) => name && SPOKEN_WITH[name]);
		voicePreview = vi.fn(async (_model, voiceId) => hosted(voiceId));
		speech = vi.fn(
			(model) =>
				({
					voiceFor: (name, context) => voiceFor(model, name, context),
					voicePreview: (voiceId) => voicePreview(model, voiceId),
				}) as TTSConnector,
		);
	});

	it("declares each character's voice, on the pair it was picked on", () => {
		const element: CanvasContentElement = {
			id: "video-1",
			type: "video",
			generationAttributes: { characters: "Sol, Mira" },
			children: [],
		};
		const state = stateWith({ Sol: PICKED, Mira: {} });

		const declared = characterVoices
			.specs(element)
			.map(([, spec]) =>
				spec({ state, canvas: [], registry: DEFAULT_CONNECTOR_REGISTRY }),
			);

		expect(declared).toMatchObject([
			{
				id: "project:voice:Sol",
				inputs: { attributes: { voiceId: "v-sol", ...CARTESIA } },
			},
			{ id: "project:voice:Mira", inputs: { attributes: { voiceId: "" } } },
		]);
	});

	it("borrows each character's voice from their speech on their own pair, named after them", async () => {
		const state = stateWith({
			Sol: PICKED,
			Mira: { ...HOSTED, resolvedVoiceId: "v-mira" },
		});
		const { signal } = new AbortController();

		await expect(
			before({ prompt: "they talk", characters: "Sol, Mira" }, state, {
				signal,
			}),
		).resolves.toEqual({
			prompt: "they talk",
			characters: "Sol, Mira",
			referenceAudios: [
				{ ...hosted("v-sol"), speaker: "Sol" },
				{ ...hosted("v-mira"), speaker: "Mira" },
			],
		});
		expect(voiceFor).toHaveBeenCalledWith(CARTESIA, "Sol", { state, signal });
		expect(voiceFor).toHaveBeenCalledWith(HOSTED, "Mira", { state, signal });
		expect(voicePreview).toHaveBeenCalledWith(CARTESIA, "v-sol");
		expect(voicePreview).toHaveBeenCalledWith(HOSTED, "v-mira");
	});

	// Speech finds and remembers a voice for a speaker with none; a video asks the same way.
	it("lends a character with no voice yet the one their speech settles on", async () => {
		const state = stateWith({ Unpicked: { ...CARTESIA }, Fresh: {} });
		voiceFor.mockResolvedValue("v-found");

		await expect(
			before({ prompt: "they talk", characters: "Unpicked, Fresh" }, state),
		).resolves.toMatchObject({
			referenceAudios: [
				{ ...hosted("v-found"), speaker: "Unpicked" },
				{ ...hosted("v-found"), speaker: "Fresh" },
			],
		});
		expect(speech).toHaveBeenCalledWith(CARTESIA);
		expect(speech).toHaveBeenCalledWith(DEFAULT_TTS_MODEL);
	});

	it("passes over a character the project does not know, one whose speech has no voice, or one the vendor cannot lend", async () => {
		voicePreview.mockImplementation(async (_model, voiceId) =>
			voiceId === "v-mute" ? undefined : hosted(voiceId),
		);
		const state = stateWith({
			Sol: PICKED,
			Silent: { ...CARTESIA },
			Mute: { ...CARTESIA, voiceId: "v-mute" },
		});

		await expect(
			before(
				{ prompt: "they talk", characters: "Sol, Silent, Mute, Unknown" },
				state,
			),
		).resolves.toMatchObject({
			referenceAudios: [{ ...hosted("v-sol"), speaker: "Sol" }],
		});
		expect(speech).toHaveBeenCalledTimes(3);
		expect(voicePreview).toHaveBeenCalledTimes(2);
	});

	it("leaves a video with no characters, or none voiced, alone", async () => {
		const state = stateWith({ Silent: {} });

		await expect(before({ prompt: "a sunset" }, state)).resolves.toEqual({
			prompt: "a sunset",
		});
		await expect(
			before({ prompt: "a sunset", characters: "Silent" }, state),
		).resolves.toEqual({ prompt: "a sunset", characters: "Silent" });
		expect(voicePreview).not.toHaveBeenCalled();
	});

	it("asks for no voices on a model that does not listen", async () => {
		const state = stateWith({ Sol: PICKED });

		await expect(
			before({ prompt: "they talk", characters: "Sol" }, state, {
				model: KLING,
			}),
		).resolves.toEqual({ prompt: "they talk", characters: "Sol" });
		expect(speech).not.toHaveBeenCalled();
	});

	it("fails loudly without speech to borrow a voice from", async () => {
		if (!plugin.beforeGenerate) throw new Error("no beforeGenerate");

		await expect(
			plugin.beforeGenerate(
				{ prompt: "they talk", characters: "Sol" },
				{ state: stateWith({ Sol: PICKED }), model: SEEDANCE },
			),
		).rejects.toThrow(/requires speech/);
	});

	describe("through speech's own plugins", () => {
		beforeEach(() => {
			vi.restoreAllMocks();
		});

		it("finds a voice for a character with none and remembers it on them, as narration does", async () => {
			const store = createProjectStore();
			store.getState().updateMetadata({
				characters: { Red: { appearance: "A girl", gender: "feminine" } },
			});
			const plugins = [
				createMetadataVoicePlugin(),
				createVoiceSearchPlugin(),
				createVoiceHydratePlugin(store),
			];
			const fetchSpy = mockGatewaySequence([
				{
					payload: { voices: [{ id: "v-red", name: "Red", description: "" }] },
				},
				{ payload: { preview: hosted("v-red") } },
			]);

			const params = await before(
				{ prompt: "she talks", characters: "Red" },
				store.getState(),
				{ speech: (model) => new HttpTTSConnector({ model, plugins }) },
			);

			expect(params.referenceAudios).toEqual([
				{ ...hosted("v-red"), speaker: "Red" },
			]);
			expect(store.getState().metadata.characters["Red"]).toMatchObject({
				...DEFAULT_TTS_MODEL,
				resolvedVoiceId: "v-red",
			});
			const searched = new URL(
				String(fetchSpy.mock.calls[0]?.[0]),
				"http://localhost",
			);
			expect(searched.searchParams.get("gender")).toBe("feminine");
			expect(searched.searchParams.get("model")).toBe(DEFAULT_TTS_MODEL.model);
		});
	});
});
