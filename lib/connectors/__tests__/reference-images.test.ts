import { beforeEach, describe, expect, it } from "vitest";
import { createReferenceImagesPlugin } from "@/lib/connectors/image/plugins/reference-images";
import { createProjectStore, type ProjectStore } from "@/lib/project/store";
import { stateCtx } from "./_state-ctx";

let store: ProjectStore;

beforeEach(() => {
	store = createProjectStore();
});

describe("createReferenceImagesPlugin", () => {
	it("has the expected name", () => {
		expect(createReferenceImagesPlugin().name).toBe("reference-images");
	});

	it("returns params unchanged when store and params are empty", () => {
		const { beforeGenerate } = createReferenceImagesPlugin();
		const params = { prompt: "a cat" };
		expect(beforeGenerate?.(params, stateCtx(store))).toBe(params);
	});

	it("uses store images when params has none", () => {
		store
			.getState()
			.setReferenceImages(["https://img/a.png", "https://img/b.png"]);
		const { beforeGenerate } = createReferenceImagesPlugin();
		expect(beforeGenerate?.({ prompt: "a cat" }, stateCtx(store))).toEqual({
			prompt: "a cat",
			referenceImages: ["https://img/a.png", "https://img/b.png"],
		});
	});

	it("appends store images to existing referenceImages", () => {
		store.getState().setReferenceImages(["https://img/store.png"]);
		const { beforeGenerate } = createReferenceImagesPlugin();
		expect(
			beforeGenerate?.(
				{
					prompt: "a cat",
					referenceImages: ["https://img/existing.png"],
				},
				stateCtx(store),
			),
		).toEqual({
			prompt: "a cat",
			referenceImages: ["https://img/existing.png", "https://img/store.png"],
		});
	});

	it("preserves existing referenceImages when store is empty", () => {
		const { beforeGenerate } = createReferenceImagesPlugin();
		expect(
			beforeGenerate?.(
				{
					prompt: "a cat",
					referenceImages: ["https://img/existing.png"],
				},
				stateCtx(store),
			),
		).toEqual({
			prompt: "a cat",
			referenceImages: ["https://img/existing.png"],
		});
	});
});
