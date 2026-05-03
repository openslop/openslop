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
				narration: { gender: "feminine", accent: "british", age: "adult" },
			});
		const { beforeGenerate } = createMetadataVoicePlugin(projectId);
		expect(beforeGenerate?.({ prompt: "hello" })).toEqual({
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
		const { beforeGenerate } = createMetadataVoicePlugin(projectId);
		expect(beforeGenerate?.({ prompt: "hi", name: "Red" })).toEqual({
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
		const { beforeGenerate } = createMetadataVoicePlugin(projectId);
		const params = { prompt: "hi", name: "Ghost" };
		expect(beforeGenerate?.(params)).toEqual(params);
	});

	it("metadata wins over voice descriptors already in params", () => {
		getProjectStore(projectId)
			.getState()
			.updateMetadata({
				narration: { gender: "feminine", accent: "british" },
			});
		const { beforeGenerate } = createMetadataVoicePlugin(projectId);
		expect(
			beforeGenerate?.({
				prompt: "hi",
				gender: "masculine",
				accent: "american",
			}),
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
		const { beforeGenerate } = createMetadataVoicePlugin(projectId);
		const result = beforeGenerate?.({ prompt: "hi" });
		expect(result).toEqual({ prompt: "hi", gender: "feminine" });
		expect(result).not.toHaveProperty("age");
		expect(result).not.toHaveProperty("pitch");
		expect(result).not.toHaveProperty("accent");
		expect(result).not.toHaveProperty("description");
	});
});
