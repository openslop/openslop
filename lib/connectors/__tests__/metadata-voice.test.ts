import { beforeEach, describe, expect, it } from "vitest";
import { createMetadataVoicePlugin } from "@/lib/connectors/tts/plugins/metadata-voice";
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
});
