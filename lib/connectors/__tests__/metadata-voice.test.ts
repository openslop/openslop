import { afterEach, describe, expect, it } from "vitest";
import { createMetadataVoicePlugin } from "@/lib/connectors/tts/plugins/metadata-voice";
import { clearProjectStore, getProjectStore } from "@/lib/project/store";
import { stateCtx } from "./_state-ctx";

const projectId = "metadata-voice-test-project";

afterEach(() => {
	clearProjectStore(projectId);
});

describe("createMetadataVoicePlugin", () => {
	it("has the expected name", () => {
		expect(createMetadataVoicePlugin().name).toBe("metadata-voice");
	});

	it("returns params unchanged when narration metadata empty and no name", () => {
		const { beforeGenerate } = createMetadataVoicePlugin();
		const params = { prompt: "hello" };
		expect(beforeGenerate?.(params, stateCtx(projectId))).toEqual(params);
	});

	it("merges metadata.narration voice fields when no name", () => {
		getProjectStore(projectId)
			.getState()
			.updateMetadata({
				narration: { gender: "feminine", accent: "british", age: "adult" },
			});
		const { beforeGenerate } = createMetadataVoicePlugin();
		expect(beforeGenerate?.({ prompt: "hello" }, stateCtx(projectId))).toEqual({
			prompt: "hello",
			gender: "feminine",
			accent: "british",
			age: "adult",
		});
	});

	it("merges metadata.characters[name] voice fields when name set", () => {
		getProjectStore(projectId)
			.getState()
			.updateMetadata({
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
			beforeGenerate?.({ prompt: "hi", name: "Red" }, stateCtx(projectId)),
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
		getProjectStore(projectId)
			.getState()
			.updateMetadata({
				narration: { gender: "masculine" },
			});
		const { beforeGenerate } = createMetadataVoicePlugin();
		const params = { prompt: "hi", name: "Ghost" };
		expect(beforeGenerate?.(params, stateCtx(projectId))).toEqual(params);
	});

	it("metadata wins over voice descriptors already in params", () => {
		getProjectStore(projectId)
			.getState()
			.updateMetadata({
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
				stateCtx(projectId),
			),
		).toEqual({
			prompt: "hi",
			gender: "feminine",
			accent: "british",
		});
	});

	it("does not set fields that are absent in metadata", () => {
		getProjectStore(projectId)
			.getState()
			.updateMetadata({
				narration: { gender: "feminine" },
			});
		const { beforeGenerate } = createMetadataVoicePlugin();
		const result = beforeGenerate?.({ prompt: "hi" }, stateCtx(projectId));
		expect(result).toEqual({ prompt: "hi", gender: "feminine" });
		expect(result).not.toHaveProperty("age");
		expect(result).not.toHaveProperty("pitch");
		expect(result).not.toHaveProperty("accent");
		expect(result).not.toHaveProperty("description");
	});
});
