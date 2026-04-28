import { afterEach, describe, expect, it } from "vitest";
import { createMetadataVoicePlugin } from "../plugins/metadata-voice";
import { clearProjectStore, getProjectStore } from "@/lib/project/store";

const projectId = "metadata-voice-test-project";

afterEach(() => {
	clearProjectStore(projectId);
});

describe("createMetadataVoicePlugin", () => {
	it("has the expected name", () => {
		expect(createMetadataVoicePlugin(projectId).name).toBe("metadata-voice");
	});

	it("returns params unchanged when narration metadata empty and no name", () => {
		const { beforeGenerate } = createMetadataVoicePlugin(projectId);
		const params = { prompt: "hello" };
		expect(beforeGenerate?.(params)).toEqual(params);
	});

	it("merges metadata.narration voice fields when no name", () => {
		getProjectStore(projectId)
			.getState()
			.updateMetadata({
				narration: { gender: "female", accent: "british", age: "adult" },
			});
		const { beforeGenerate } = createMetadataVoicePlugin(projectId);
		expect(beforeGenerate?.({ prompt: "hello" })).toEqual({
			prompt: "hello",
			gender: "female",
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
						description: "A girl in red",
						gender: "female",
						accent: "southern",
						pitch: "high",
						texture: "raspy",
					},
				},
			});
		const { beforeGenerate } = createMetadataVoicePlugin(projectId);
		expect(beforeGenerate?.({ prompt: "hi", name: "Red" })).toEqual({
			prompt: "hi",
			name: "Red",
			gender: "female",
			accent: "southern",
			pitch: "high",
			texture: "raspy",
		});
	});

	it("returns params unchanged when name references unknown character", () => {
		getProjectStore(projectId)
			.getState()
			.updateMetadata({
				narration: { gender: "male" },
			});
		const { beforeGenerate } = createMetadataVoicePlugin(projectId);
		const params = { prompt: "hi", name: "Ghost" };
		expect(beforeGenerate?.(params)).toEqual(params);
	});

	it("metadata wins over voice descriptors already in params", () => {
		getProjectStore(projectId)
			.getState()
			.updateMetadata({
				narration: { gender: "female", accent: "british" },
			});
		const { beforeGenerate } = createMetadataVoicePlugin(projectId);
		expect(
			beforeGenerate?.({ prompt: "hi", gender: "male", accent: "american" }),
		).toEqual({
			prompt: "hi",
			gender: "female",
			accent: "british",
		});
	});

	it("does not set fields that are absent in metadata", () => {
		getProjectStore(projectId)
			.getState()
			.updateMetadata({
				narration: { gender: "female" },
			});
		const { beforeGenerate } = createMetadataVoicePlugin(projectId);
		const result = beforeGenerate?.({ prompt: "hi" });
		expect(result).toEqual({ prompt: "hi", gender: "female" });
		expect(result).not.toHaveProperty("age");
		expect(result).not.toHaveProperty("pitch");
		expect(result).not.toHaveProperty("accent");
		expect(result).not.toHaveProperty("texture");
	});
});
