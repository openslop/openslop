import { afterEach, describe, expect, it } from "vitest";
import { createReferenceImagesPlugin } from "../plugins/reference-images";
import { clearProjectStore, getProjectStore } from "@/lib/project/store";

const projectId = "reference-images-test-project";

afterEach(() => {
	clearProjectStore(projectId);
});

describe("createReferenceImagesPlugin", () => {
	it("has the expected name", () => {
		expect(createReferenceImagesPlugin(projectId).name).toBe(
			"reference-images",
		);
	});

	it("returns params unchanged when store and params are empty", () => {
		const { beforeGenerate } = createReferenceImagesPlugin(projectId);
		const params = { prompt: "a cat" };
		expect(beforeGenerate?.(params)).toBe(params);
	});

	it("uses store images when params has none", () => {
		getProjectStore(projectId)
			.getState()
			.setReferenceImages(["https://img/a.png", "https://img/b.png"]);
		const { beforeGenerate } = createReferenceImagesPlugin(projectId);
		expect(beforeGenerate?.({ prompt: "a cat" })).toEqual({
			prompt: "a cat",
			referenceImages: ["https://img/a.png", "https://img/b.png"],
		});
	});

	it("appends store images to existing referenceImages", () => {
		getProjectStore(projectId)
			.getState()
			.setReferenceImages(["https://img/store.png"]);
		const { beforeGenerate } = createReferenceImagesPlugin(projectId);
		expect(
			beforeGenerate?.({
				prompt: "a cat",
				referenceImages: ["https://img/existing.png"],
			}),
		).toEqual({
			prompt: "a cat",
			referenceImages: ["https://img/existing.png", "https://img/store.png"],
		});
	});

	it("preserves existing referenceImages when store is empty", () => {
		const { beforeGenerate } = createReferenceImagesPlugin(projectId);
		expect(
			beforeGenerate?.({
				prompt: "a cat",
				referenceImages: ["https://img/existing.png"],
			}),
		).toEqual({
			prompt: "a cat",
			referenceImages: ["https://img/existing.png"],
		});
	});
});
