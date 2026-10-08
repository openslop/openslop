import { beforeEach, describe, expect, it, vi } from "vitest";
import { asset } from "@/lib/canvas/__tests__/_assets";
import { NARRATOR } from "@/lib/canvas/assets";
import { createCanvasElement } from "@/lib/canvas/createCanvasElement";
import type { CanvasElement } from "@/lib/canvas/types";
import { createSpeakerVoicePlugin } from "@/lib/connectors/tts/plugins/speaker-voice";
import { DEFAULT_TTS_MODEL } from "@/lib/connectors/tts/models";
import type {
	ModelRef,
	PluginContext,
	TTSConnector,
	TTSGenerateParams,
	VoiceSearchParams,
} from "@/lib/connectors/types";
import type { Voice } from "@/lib/project/types";
import { buildCtx, pluginCtx, projectState, readsOf } from "./_state-ctx";

const tts = vi.hoisted(() => ({
	searchVoices: vi.fn(),
	createConnector: vi.fn(),
}));
vi.mock("@/lib/connectors/factory", async (importOriginal) => ({
	...(await importOriginal<typeof import("@/lib/connectors/factory")>()),
	createConnector: tts.createConnector,
}));

const CARTESIA = { provider: "cartesia", model: "Sonic 3.6" } as const;

beforeEach(() => {
	tts.searchVoices.mockReset();
	tts.searchVoices.mockResolvedValue([
		{ id: "v-found", name: "Found", description: "" },
	]);
	tts.createConnector.mockImplementation(
		(_type: string, model: ModelRef): Partial<TTSConnector> => ({
			searchVoices: (params: VoiceSearchParams) =>
				tts.searchVoices(model, params),
		}),
	);
});

const plugin = createSpeakerVoicePlugin();

const line = (name?: string, attrs: Record<string, string> = {}) =>
	name
		? createCanvasElement("character", { id: "c1", attrs: { name, ...attrs } })
		: createCanvasElement("narration", { id: "n1", attrs });

const voice = (name: string, attrs: Partial<Voice> = {}) =>
	asset("asset_voice", { name, attrs });

const settled = (name: string, model: ModelRef) => ({
	type: "asset_voice",
	name,
	attrs: { ...model, voiceId: "v-found" },
});

const readOff = (element: CanvasElement, canvas: CanvasElement[]) =>
	pluginCtx({ reads: readsOf(plugin, element, canvas) });

const prepare = async (
	element: CanvasElement,
	canvas: CanvasElement[],
	language?: Voice["language"],
) => {
	if (!plugin.prepare) throw new Error("no prepare");
	return plugin.prepare(
		element,
		buildCtx(canvas, { state: projectState({}, { language }) }),
	);
};

const before = (params: TTSGenerateParams, ctx: PluginContext) => {
	if (!plugin.beforeGenerate) throw new Error("no beforeGenerate");
	return Promise.resolve(plugin.beforeGenerate(params, ctx));
};

describe("createSpeakerVoicePlugin", () => {
	describe("what it reads", () => {
		it("reads the voice chosen for the narrator, and for the character a line names", () => {
			const chosen = { ...DEFAULT_TTS_MODEL, voiceId: "v-1" };
			const canvas = [voice(NARRATOR, chosen), voice("Red", chosen)];

			expect(readsOf(plugin, line(), canvas)).toEqual({
				"Narrator's voice": JSON.stringify(chosen),
			});
			expect(readsOf(plugin, line("Red"), canvas)).toEqual({
				"Red's voice": JSON.stringify(chosen),
			});
		});

		it("reads no voice while the speaker has no voice asset", () => {
			expect(readsOf(plugin, line("Ghost"), [])).not.toHaveProperty(
				"Ghost's voice",
			);
		});

		it("reads neither the search filters nor the project's language, so changing them stales nothing", () => {
			const chosen = { ...DEFAULT_TTS_MODEL, voiceId: "v-1" };
			const filtered = voice(NARRATOR, {
				...chosen,
				gender: "feminine",
				language: "fr",
			});

			expect(
				readsOf(
					plugin,
					line(),
					[filtered],
					projectState({}, { language: "es" }),
				),
			).toEqual(readsOf(plugin, line(), [voice(NARRATOR, chosen)]));
		});
	});

	describe("the model speech speaks with", () => {
		const own = line(undefined, CARTESIA);

		it("is the pair its voice was found on, over its own", () => {
			expect(plugin.model?.(own, [voice(NARRATOR, DEFAULT_TTS_MODEL)])).toEqual(
				DEFAULT_TTS_MODEL,
			);
		});

		it("is its own while its speaker has no voice", () => {
			expect(plugin.model?.(own, [])).toEqual(CARTESIA);
		});
	});

	describe("prepare", () => {
		it("settles nothing for a speaker whose voice already has an id on its pair", async () => {
			const red = voice("Red", { ...DEFAULT_TTS_MODEL, voiceId: "v-red" });

			await expect(prepare(line("Red", CARTESIA), [red])).resolves.toEqual([]);
			expect(tts.searchVoices).not.toHaveBeenCalled();
		});

		it.each([
			[
				"the voice's pair, over the line's own",
				[
					voice("Red", {
						...CARTESIA,
						gender: "masculine",
						accent: "british",
					}),
				],
				DEFAULT_TTS_MODEL,
				{ gender: "masculine", accent: "british", language: "en" },
			],
			[
				"the line's own, while it has no voice asset",
				[],
				CARTESIA,
				{ language: "en" },
			],
		])(
			"finds a voice by the speaker's traits on %s, and settles it on their voice asset",
			async (_, canvas, own, search) => {
				await expect(prepare(line("Red", own), canvas)).resolves.toEqual([
					settled("Red", CARTESIA),
				]);
				expect(tts.searchVoices).toHaveBeenCalledExactlyOnceWith(
					CARTESIA,
					search,
				);
			},
		);

		it("settles the narrator's voice onto the narrator's voice asset for a narration", async () => {
			await expect(prepare(line(), [voice(NARRATOR)])).resolves.toEqual([
				settled(NARRATOR, DEFAULT_TTS_MODEL),
			]);
		});

		it("settles onto the narrator's voice asset for a narration even with no narrator yet", async () => {
			await expect(prepare(line(), [])).resolves.toEqual([
				settled(NARRATOR, DEFAULT_TTS_MODEL),
			]);
		});

		it.each([
			["the project's language over the voice's own", "es", "es"],
			["the voice's own language on auto", undefined, "fr"],
		] as const)("searches in %s", async (_, setting, language) => {
			await prepare(line(), [voice(NARRATOR, { language: "fr" })], setting);

			expect(tts.searchVoices).toHaveBeenCalledWith(DEFAULT_TTS_MODEL, {
				language,
			});
		});

		it("throws when no voice matches", async () => {
			tts.searchVoices.mockResolvedValue([]);

			await expect(prepare(line(), [voice(NARRATOR)])).rejects.toThrow(
				"No matching voice found",
			);
		});
	});

	describe("beforeGenerate", () => {
		it("speaks with the voice its speaker's voice asset recorded, over its own", async () => {
			const red = voice("Red", { ...DEFAULT_TTS_MODEL, voiceId: "v-red" });

			await expect(
				before(
					{
						prompt: "hi",
						name: "Red",
						...DEFAULT_TTS_MODEL,
						voiceId: "v-own",
						speed: "fast",
					},
					readOff(line("Red"), [red]),
				),
			).resolves.toEqual({
				prompt: "hi",
				name: "Red",
				...DEFAULT_TTS_MODEL,
				voiceId: "v-red",
				speed: "fast",
			});
		});
	});
});
