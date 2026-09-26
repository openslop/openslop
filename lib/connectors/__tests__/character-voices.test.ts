import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { DEFAULT_CONNECTOR_REGISTRY } from "@/lib/connectors/registry";
import { HttpTTSConnector } from "@/lib/connectors/tts/connector";
import { DEFAULT_TTS_MODEL } from "@/lib/connectors/tts/models";
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
	HostedVoicePreview,
	ModelRef,
	PluginContext,
	TTSConnector,
	VoiceInfo,
	VoiceSearchParams,
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

const FOUND: VoiceInfo = { id: "v-found", name: "Found", description: "" };

const hosted = (voiceId: string): HostedVoicePreview => ({
	url: `https://audio/${voiceId}.mp3`,
	durationSec: 6,
});

describe("character-voices plugin", () => {
	let plugin: ConnectorPlugin<ParamsWithCharacterVoices>;
	let speech: Mock<(model: ModelRef) => TTSConnector>;
	let searchVoices: Mock<
		(model: ModelRef, params: VoiceSearchParams) => Promise<VoiceInfo[]>
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
			store: createProjectStore(state),
			model: SEEDANCE,
			speech,
			...ctx,
		});
	};

	beforeEach(() => {
		plugin = createCharacterVoicesPlugin();
		searchVoices = vi.fn(async () => [FOUND]);
		voicePreview = vi.fn(async (_model, voiceId) => hosted(voiceId));
		speech = vi.fn(
			(model) =>
				({
					searchVoices: (params) => searchVoices(model, params),
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
		const store = createProjectStore(stateWith({ Sol: PICKED, Mira: {} }));

		const declared = characterVoices.specs(element).map(([, spec]) =>
			spec({
				store,
				state: store.getState(),
				canvas: [],
				registry: DEFAULT_CONNECTOR_REGISTRY,
			}),
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

		await expect(
			before({ prompt: "they talk", characters: "Sol, Mira" }, state),
		).resolves.toEqual({
			prompt: "they talk",
			characters: "Sol, Mira",
			referenceAudios: [
				{ ...hosted("v-sol"), speaker: "Sol" },
				{ ...hosted("v-mira"), speaker: "Mira" },
			],
		});
		expect(searchVoices).not.toHaveBeenCalled();
		expect(voicePreview).toHaveBeenCalledWith(CARTESIA, "v-sol");
		expect(voicePreview).toHaveBeenCalledWith(HOSTED, "v-mira");
	});

	it("finds a character with no voice yet one on their own pair, and remembers it", async () => {
		const store = createProjectStore(
			stateWith({ Unpicked: { ...CARTESIA, gender: "feminine" }, Fresh: {} }),
		);

		await expect(
			before(
				{ prompt: "they talk", characters: "Unpicked, Fresh" },
				store.getState(),
				{ store },
			),
		).resolves.toMatchObject({
			referenceAudios: [
				{ ...hosted("v-found"), speaker: "Unpicked" },
				{ ...hosted("v-found"), speaker: "Fresh" },
			],
		});
		expect(searchVoices).toHaveBeenCalledWith(CARTESIA, {
			gender: "feminine",
			language: "en",
		});
		expect(searchVoices).toHaveBeenCalledWith(DEFAULT_TTS_MODEL, {
			language: "en",
		});
		const { characters } = store.getState().metadata;
		expect(characters["Unpicked"]).toMatchObject({
			...CARTESIA,
			resolvedVoiceId: "v-found",
		});
		expect(characters["Fresh"]).toMatchObject({
			...DEFAULT_TTS_MODEL,
			resolvedVoiceId: "v-found",
		});
	});

	it("fails the video when no voice sounds like a character, as their speech would", async () => {
		searchVoices.mockResolvedValue([]);

		await expect(
			before(
				{ prompt: "they talk", characters: "Silent" },
				stateWith({ Silent: { ...CARTESIA } }),
			),
		).rejects.toThrow("No matching voice found");
	});

	it("passes over a character the project does not know, or one the vendor cannot lend", async () => {
		voicePreview.mockImplementation(async (_model, voiceId) =>
			voiceId === "v-mute" ? undefined : hosted(voiceId),
		);
		const state = stateWith({
			Sol: PICKED,
			Mute: { ...CARTESIA, voiceId: "v-mute" },
		});

		await expect(
			before({ prompt: "they talk", characters: "Sol, Mute, Unknown" }, state),
		).resolves.toMatchObject({
			referenceAudios: [{ ...hosted("v-sol"), speaker: "Sol" }],
		});
		expect(speech).toHaveBeenCalledTimes(2);
		expect(voicePreview).toHaveBeenCalledTimes(2);
	});

	it("leaves a video with no characters alone", async () => {
		const state = stateWith({ Silent: {} });

		await expect(before({ prompt: "a sunset" }, state)).resolves.toEqual({
			prompt: "a sunset",
		});
		expect(speech).not.toHaveBeenCalled();
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

	describe("through speech's own vendor", () => {
		beforeEach(() => {
			vi.restoreAllMocks();
		});

		it("finds a voice for a character with none and remembers it on them, as narration does", async () => {
			const store = createProjectStore();
			store.getState().updateMetadata({
				characters: { Red: { appearance: "A girl", gender: "feminine" } },
			});
			const fetchSpy = mockGatewaySequence([
				{
					payload: { voices: [{ id: "v-red", name: "Red", description: "" }] },
				},
				{ payload: { preview: hosted("v-red") } },
			]);

			const params = await before(
				{ prompt: "she talks", characters: "Red" },
				store.getState(),
				{
					speech: (model) => new HttpTTSConnector({ model }),
					store,
				},
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
