import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import {
	createSpeakerVoicePlugin,
	speakerVoice,
} from "@/lib/connectors/tts/plugins/speaker-voice";
import { DEFAULT_TTS_MODEL } from "@/lib/connectors/tts/models";
import { DEFAULT_CONNECTOR_REGISTRY } from "@/lib/connectors/registry";
import type { CanvasContentElement } from "@/lib/canvas/types";
import type {
	PluginContext,
	TTSGenerateParams,
	VoiceInfo,
	VoiceSearchParams,
} from "@/lib/connectors/types";
import { createProjectStore, type ProjectStore } from "@/lib/project/store";
import { stateCtx } from "./_state-ctx";

const FOUND: VoiceInfo = { id: "v-found", name: "Found", description: "" };

let store: ProjectStore;
let searchVoices: Mock<(params: VoiceSearchParams) => Promise<VoiceInfo[]>>;

beforeEach(() => {
	store = createProjectStore();
	searchVoices = vi.fn(async () => [FOUND]);
});

const ctx = (extra: Partial<PluginContext> = {}): PluginContext => ({
	...stateCtx(store),
	searchVoices,
	store,
	...extra,
});

const before = (
	params: TTSGenerateParams,
	context: PluginContext = ctx(),
): Promise<TTSGenerateParams> => {
	const { beforeGenerate } = createSpeakerVoicePlugin();
	if (!beforeGenerate) throw new Error("no beforeGenerate");
	return Promise.resolve(beforeGenerate(params, context));
};

describe("createSpeakerVoicePlugin", () => {
	it("has the expected name", () => {
		expect(createSpeakerVoicePlugin().name).toBe("speaker-voice");
	});

	describe("a voice with an id on the pair", () => {
		it("speaks with the id picked for it, keeping its traits, without searching", async () => {
			store.getState().updateMetadata({
				narration: {
					...DEFAULT_TTS_MODEL,
					gender: "feminine",
					voiceId: "v-picked",
				},
			});

			await expect(
				before({ prompt: "hello", ...DEFAULT_TTS_MODEL }),
			).resolves.toEqual({
				prompt: "hello",
				...DEFAULT_TTS_MODEL,
				gender: "feminine",
				voiceId: "v-picked",
			});
			expect(searchVoices).not.toHaveBeenCalled();
		});

		it("falls back to the resolved id when none was picked", async () => {
			store.getState().updateMetadata({
				narration: { ...DEFAULT_TTS_MODEL, resolvedVoiceId: "v-resolved" },
			});

			await expect(
				before({ prompt: "hello", ...DEFAULT_TTS_MODEL }),
			).resolves.toMatchObject({ voiceId: "v-resolved" });
			expect(searchVoices).not.toHaveBeenCalled();
		});

		it("speaks with the character's voice when the speech names one", async () => {
			store.getState().updateMetadata({
				characters: {
					Red: { appearance: "", ...DEFAULT_TTS_MODEL, voiceId: "v-red" },
				},
			});

			await expect(
				before({ prompt: "hi", name: "Red", ...DEFAULT_TTS_MODEL }),
			).resolves.toMatchObject({ name: "Red", voiceId: "v-red" });
		});

		it("does not rewrite what it already has", async () => {
			store.getState().updateMetadata({
				narration: { ...DEFAULT_TTS_MODEL, voiceId: "v-picked" },
			});
			const narration = store.getState().metadata.narration;

			await before({ prompt: "hi", ...DEFAULT_TTS_MODEL });

			expect(store.getState().metadata.narration).toBe(narration);
		});
	});

	describe("a voice with no id on the pair", () => {
		// A voice id only means something to the provider and model it came from.
		it("searches when its id was found on another pair", async () => {
			store.getState().updateMetadata({
				narration: {
					provider: "cartesia",
					model: "Sonic 3.6",
					gender: "feminine",
					voiceId: "v-cartesia",
				},
			});

			await expect(
				before({ prompt: "hello", ...DEFAULT_TTS_MODEL }),
			).resolves.toMatchObject({ voiceId: "v-found" });
			expect(searchVoices).toHaveBeenCalledWith(
				expect.objectContaining({ gender: "feminine" }),
			);
		});

		it("treats a voice that names no pair as found nowhere", async () => {
			store.getState().updateMetadata({ narration: { voiceId: "v-legacy" } });

			await expect(
				before({ prompt: "hello", ...DEFAULT_TTS_MODEL }),
			).resolves.toMatchObject({ voiceId: "v-found" });
		});

		it("searches by the character's traits when the speech names one", async () => {
			store.getState().updateMetadata({
				characters: {
					Red: {
						appearance: "A girl in red",
						gender: "feminine",
						accent: "southern",
						pitch: "high",
						description: "raspy",
					},
				},
			});

			await before({ prompt: "hi", name: "Red" });

			expect(searchVoices).toHaveBeenCalledWith({
				gender: "feminine",
				accent: "southern",
				pitch: "high",
				description: "raspy",
				language: "en",
			});
		});

		it("lets the voice's traits win over descriptors already in params", async () => {
			store.getState().updateMetadata({
				narration: { gender: "feminine", accent: "british" },
			});

			await before({ prompt: "hi", gender: "masculine", accent: "american" });

			expect(searchVoices).toHaveBeenCalledWith({
				gender: "feminine",
				accent: "british",
				language: "en",
			});
		});

		it("searches in the project's language, since the script no longer declares one", async () => {
			store.getState().updateMetadata({ language: "es" });

			await before({ prompt: "hola" });

			expect(searchVoices).toHaveBeenCalledWith({ language: "es" });
		});

		it("prefers a pinned project language over a voice language left by an earlier script", async () => {
			store.getState().updateMetadata({
				language: "es",
				narration: { language: "en" },
			});

			await before({ prompt: "hi" });

			expect(searchVoices).toHaveBeenCalledWith({ language: "es" });
		});

		it("keeps the voice's own language on auto, where the project declares none", async () => {
			store.getState().updateMetadata({ narration: { language: "fr" } });

			await before({ prompt: "hi" });

			expect(searchVoices).toHaveBeenCalledWith({ language: "fr" });
		});

		it("falls back to English when neither the project nor the voice names a language", async () => {
			await before({ prompt: "hi" });

			expect(searchVoices).toHaveBeenCalledWith({ language: "en" });
		});

		it("speaks with the first voice found, without the descriptors it searched by", async () => {
			searchVoices.mockResolvedValue([
				{ id: "v-1", name: "First", description: "" },
				{ id: "v-2", name: "Second", description: "" },
			]);
			store.getState().updateMetadata({
				characters: {
					Red: { appearance: "", gender: "feminine", age: "adult" },
				},
			});

			await expect(
				before({
					prompt: "hi",
					...DEFAULT_TTS_MODEL,
					name: "Red",
					query: "narrator",
					speed: "fast",
				}),
			).resolves.toEqual({
				prompt: "hi",
				...DEFAULT_TTS_MODEL,
				name: "Red",
				speed: "fast",
				voiceId: "v-1",
			});
		});

		it("throws when no voice matches", async () => {
			searchVoices.mockResolvedValue([]);

			await expect(before({ prompt: "hi" })).rejects.toThrow(
				"No matching voice found",
			);
		});

		it("throws without its vendor's voices to search", async () => {
			await expect(
				before({ prompt: "hi" }, ctx({ searchVoices: undefined })),
			).rejects.toThrow(/searchVoices/);
		});
	});

	describe("a speaker the project does not know", () => {
		it("speaks with the id already in params", async () => {
			await expect(
				before({ prompt: "hi", name: "Ghost", voiceId: "v-own" }),
			).resolves.toEqual({ prompt: "hi", name: "Ghost", voiceId: "v-own" });
			expect(searchVoices).not.toHaveBeenCalled();
		});

		it("searches by the element's own descriptors, and remembers nothing", async () => {
			const metadata = store.getState().metadata;

			await expect(
				before({ prompt: "hi", name: "Ghost", gender: "masculine" }),
			).resolves.toEqual({ prompt: "hi", name: "Ghost", voiceId: "v-found" });
			expect(searchVoices).toHaveBeenCalledWith({
				gender: "masculine",
				language: "en",
			});
			expect(store.getState().metadata).toBe(metadata);
		});
	});

	describe("remembering a voice it found", () => {
		it("keeps it on the character (not narration) the speech names", async () => {
			store.getState().updateMetadata({
				characters: { Red: { appearance: "A girl", gender: "feminine" } },
			});

			await before({ prompt: "hi", name: "Red" });

			const { metadata } = store.getState();
			expect(metadata.characters["Red"]?.resolvedVoiceId).toBe("v-found");
			expect(metadata.narration.resolvedVoiceId).toBeUndefined();
		});

		it("keeps it on narration when the speech names no one", async () => {
			store.getState().updateMetadata({ narration: { gender: "masculine" } });

			await before({ prompt: "hi" });

			expect(store.getState().metadata.narration.resolvedVoiceId).toBe(
				"v-found",
			);
		});

		it("leaves an id from no pair behind, so the one found is the one used", async () => {
			store.getState().updateMetadata({ narration: { voiceId: "v-legacy" } });

			await before({ prompt: "hi", ...DEFAULT_TTS_MODEL });

			expect(store.getState().metadata.narration).toMatchObject({
				...DEFAULT_TTS_MODEL,
				voiceId: undefined,
				resolvedVoiceId: "v-found",
			});
		});

		it("keeps it on the pair it was found on, beside the voice's traits", async () => {
			store.getState().updateMetadata({ narration: { gender: "feminine" } });

			await before({ prompt: "hi", ...DEFAULT_TTS_MODEL });

			expect(store.getState().metadata.narration).toEqual({
				...DEFAULT_TTS_MODEL,
				gender: "feminine",
				resolvedVoiceId: "v-found",
			});
		});

		it("throws without a store to keep it in", async () => {
			await expect(
				before({ prompt: "hi" }, ctx({ store: undefined })),
			).rejects.toThrow(/store/);
		});
	});

	describe("the model speech speaks with", () => {
		const cartesia = { provider: "cartesia", model: "Sonic 3.6" } as const;
		const narration = (
			attrs: Record<string, string>,
		): CanvasContentElement => ({
			id: "n1",
			type: "narration",
			generationAttributes: attrs,
			children: [],
		});
		const voiceInput = (element: CanvasContentElement) => {
			const [edge] = speakerVoice.specs(element);
			const node = edge?.[1]({
				store,
				state: store.getState(),
				canvas: [],
				registry: DEFAULT_CONNECTOR_REGISTRY,
			});
			return node && "inputs" in node ? node.inputs.attributes : undefined;
		};

		it("is the voice's pair once picked, and the element's own until then", () => {
			const { model } = createSpeakerVoicePlugin();
			expect(model?.(narration(cartesia), store.getState())).toEqual(cartesia);
			store.getState().updateMetadata({ narration: DEFAULT_TTS_MODEL });
			expect(model?.(narration(cartesia), store.getState())).toEqual(
				DEFAULT_TTS_MODEL,
			);
		});

		it("is what the element reads of its voice, with the id picked for it", () => {
			store.getState().updateMetadata({
				narration: { ...DEFAULT_TTS_MODEL, voiceId: "v-picked" },
			});
			expect(voiceInput(narration(cartesia))).toEqual({
				voiceId: "v-picked",
				...DEFAULT_TTS_MODEL,
			});
		});

		// The found id is remembered, not read, or generating would stale the element.
		it("leaves the id a search found out of what the element reads", () => {
			store.getState().updateMetadata({
				narration: { ...DEFAULT_TTS_MODEL, resolvedVoiceId: "v-found" },
			});
			expect(voiceInput(narration(cartesia))).toEqual({
				voiceId: "",
				...DEFAULT_TTS_MODEL,
			});
		});
	});
});
