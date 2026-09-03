import { beforeEach, describe, expect, it } from "vitest";
import { createMetadataVoicePlugin } from "@/lib/connectors/tts/plugins/metadata-voice";
import { DEFAULT_TTS_MODEL } from "@/lib/connectors/tts/models";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { createProjectStore, type ProjectStore } from "@/lib/project/store";
import { stateCtx } from "./_state-ctx";

let store: ProjectStore;

beforeEach(() => {
	store = createProjectStore();
});

describe("createMetadataVoicePlugin", () => {
	it("has the expected name", () => {
		expect(createMetadataVoicePlugin().name).toBe("metadata-voice");
	});

	it("returns params unchanged when narration metadata empty and no name", () => {
		const { beforeGenerate } = createMetadataVoicePlugin();
		const params = { prompt: "hello" };
		expect(beforeGenerate?.(params, stateCtx(store))).toEqual(params);
	});

	it("merges metadata.narration voice fields when no name", () => {
		store.getState().updateMetadata({
			narration: { gender: "feminine", accent: "british", age: "adult" },
		});
		const { beforeGenerate } = createMetadataVoicePlugin();
		expect(beforeGenerate?.({ prompt: "hello" }, stateCtx(store))).toEqual({
			prompt: "hello",
			gender: "feminine",
			accent: "british",
			age: "adult",
		});
	});

	it("merges metadata.characters[name] voice fields when name set", () => {
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
		const { beforeGenerate } = createMetadataVoicePlugin();
		expect(
			beforeGenerate?.({ prompt: "hi", name: "Red" }, stateCtx(store)),
		).toEqual({
			prompt: "hi",
			name: "Red",
			gender: "feminine",
			accent: "southern",
			pitch: "high",
			description: "raspy",
		});
	});

	// The connector already carries the pair; only the voice's traits are merged.
	it("keeps the voice's model out of the generation params", () => {
		store.getState().updateMetadata({
			narration: {
				gender: "feminine",
				provider: "cartesia",
				model: "Sonic 3.5",
			},
		});
		const { beforeGenerate } = createMetadataVoicePlugin();
		expect(beforeGenerate?.({ prompt: "hello" }, stateCtx(store))).toEqual({
			prompt: "hello",
			gender: "feminine",
		});
	});

	it("uses the voice's id on the pair it was found on", () => {
		store.getState().updateMetadata({
			narration: { ...DEFAULT_TTS_MODEL, voiceId: "v-picked" },
		});
		const { beforeGenerate } = createMetadataVoicePlugin();
		expect(
			beforeGenerate?.(
				{ prompt: "hello", ...DEFAULT_TTS_MODEL },
				stateCtx(store),
			),
		).toEqual({ prompt: "hello", ...DEFAULT_TTS_MODEL, voiceId: "v-picked" });
	});

	it("falls back to the resolved id when none was picked", () => {
		store.getState().updateMetadata({
			narration: { ...DEFAULT_TTS_MODEL, resolvedVoiceId: "v-found" },
		});
		const { beforeGenerate } = createMetadataVoicePlugin();
		expect(
			beforeGenerate?.(
				{ prompt: "hello", ...DEFAULT_TTS_MODEL },
				stateCtx(store),
			),
		).toMatchObject({ voiceId: "v-found" });
	});

	// A voice id only means something to the provider and model it came from.
	it("leaves the id behind when the element runs on another pair", () => {
		store.getState().updateMetadata({
			narration: {
				provider: "cartesia",
				model: "Sonic 3.5",
				gender: "feminine",
				voiceId: "v-cartesia",
				resolvedVoiceId: "v-cartesia",
			},
		});
		const { beforeGenerate } = createMetadataVoicePlugin();
		expect(
			beforeGenerate?.(
				{ prompt: "hello", ...DEFAULT_TTS_MODEL },
				stateCtx(store),
			),
		).toEqual({ prompt: "hello", ...DEFAULT_TTS_MODEL, gender: "feminine" });
	});

	it("treats a voice that names no pair as found nowhere", () => {
		store.getState().updateMetadata({ narration: { voiceId: "v-legacy" } });
		const { beforeGenerate } = createMetadataVoicePlugin();
		expect(
			beforeGenerate?.(
				{ prompt: "hello", ...DEFAULT_TTS_MODEL },
				stateCtx(store),
			),
		).toMatchObject({ voiceId: undefined });
	});

	it("returns params unchanged when name references unknown character", () => {
		store.getState().updateMetadata({
			narration: { gender: "masculine" },
		});
		const { beforeGenerate } = createMetadataVoicePlugin();
		const params = { prompt: "hi", name: "Ghost" };
		expect(beforeGenerate?.(params, stateCtx(store))).toEqual(params);
	});

	it("metadata wins over voice descriptors already in params", () => {
		store.getState().updateMetadata({
			narration: { gender: "feminine", accent: "british" },
		});
		const { beforeGenerate } = createMetadataVoicePlugin();
		expect(
			beforeGenerate?.(
				{
					prompt: "hi",
					gender: "masculine",
					accent: "american",
				},
				stateCtx(store),
			),
		).toEqual({
			prompt: "hi",
			gender: "feminine",
			accent: "british",
		});
	});

	it("narrates the project's language, since the script no longer declares one", () => {
		store.getState().updateMetadata({ language: "es" });
		const { beforeGenerate } = createMetadataVoicePlugin();
		expect(beforeGenerate?.({ prompt: "hola" }, stateCtx(store))).toEqual({
			prompt: "hola",
			language: "es",
		});
	});

	it("leaves the language open on auto, so voice search falls back", () => {
		const { beforeGenerate } = createMetadataVoicePlugin();
		const result = beforeGenerate?.({ prompt: "hi" }, stateCtx(store));
		expect(result).not.toHaveProperty("language", "auto");
	});

	it("prefers a pinned project language over a voice language left by an earlier script", () => {
		store.getState().updateMetadata({
			language: "es",
			narration: { language: "en" },
		});
		const { beforeGenerate } = createMetadataVoicePlugin();
		expect(beforeGenerate?.({ prompt: "hi" }, stateCtx(store))).toEqual({
			prompt: "hi",
			language: "es",
		});
	});

	it("keeps the voice's own language on auto, where the project declares none", () => {
		store.getState().updateMetadata({ narration: { language: "fr" } });
		const { beforeGenerate } = createMetadataVoicePlugin();
		expect(beforeGenerate?.({ prompt: "hi" }, stateCtx(store))).toEqual({
			prompt: "hi",
			language: "fr",
		});
	});

	it("does not set fields that are absent in metadata", () => {
		store.getState().updateMetadata({
			narration: { gender: "feminine" },
		});
		const { beforeGenerate } = createMetadataVoicePlugin();
		const result = beforeGenerate?.({ prompt: "hi" }, stateCtx(store));
		expect(result).toEqual({ prompt: "hi", gender: "feminine" });
		expect(result).not.toHaveProperty("age");
		expect(result).not.toHaveProperty("pitch");
		expect(result).not.toHaveProperty("accent");
		expect(result).not.toHaveProperty("description");
	});

	describe("dependencies", () => {
		const cartesia = { provider: "cartesia", model: "Sonic 3.5" } as const;
		const narration = (
			attrs: Record<string, string>,
		): CanvasContentElement => ({
			id: "n1",
			type: "narration",
			generationAttributes: attrs,
			children: [],
		});
		const voiceInput = (element: CanvasContentElement) => {
			const [spec] = createMetadataVoicePlugin().dependencies?.(element) ?? [];
			const node = spec?.(store.getState());
			return node && "inputs" in node ? node.inputs.attributes : undefined;
		};

		it("reads the id picked for the element's own pair", () => {
			store.getState().updateMetadata({
				narration: { ...cartesia, voiceId: "v-cartesia" },
			});
			expect(voiceInput(narration(cartesia))).toEqual({
				voiceId: "v-cartesia",
			});
		});

		// The found id is remembered, not read, or generating would stale the element.
		it("reads nothing on another pair, and never the id a search found", () => {
			store.getState().updateMetadata({
				narration: {
					...DEFAULT_TTS_MODEL,
					voiceId: "v-slop",
					resolvedVoiceId: "v-slop",
				},
			});
			expect(voiceInput(narration(cartesia))).toEqual({ voiceId: "" });
			expect(voiceInput(narration(DEFAULT_TTS_MODEL))).toEqual({
				voiceId: "v-slop",
			});
		});
	});
});
