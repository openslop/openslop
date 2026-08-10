import { beforeEach, describe, expect, it } from "vitest";
import type { CanvasContentElement } from "@/lib/canvas/types";
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
		expect(beforeGenerate?.(params, stateCtx(store))).toEqual(params);
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

	it("uses the element's override in place of the store's images", () => {
		store.getState().setReferenceImages(["https://img/store.png"]);
		const { beforeGenerate } = createReferenceImagesPlugin();
		expect(
			beforeGenerate?.(
				{
					prompt: "a cat",
					referenceImagesOverride: "https://img/own.png, https://img/two.png",
				},
				stateCtx(store),
			),
		).toEqual({
			prompt: "a cat",
			referenceImages: ["https://img/own.png", "https://img/two.png"],
		});
	});

	it("an empty override generates with no reference images", () => {
		store.getState().setReferenceImages(["https://img/store.png"]);
		const { beforeGenerate } = createReferenceImagesPlugin();
		expect(
			beforeGenerate?.(
				{ prompt: "a cat", referenceImagesOverride: "" },
				stateCtx(store),
			),
		).toEqual({ prompt: "a cat" });
	});

	it("depends on the project's references only while inheriting them", () => {
		const { dependencies } = createReferenceImagesPlugin();
		const element = {
			id: "el",
			type: "image",
			children: [],
		} as unknown as CanvasContentElement;
		expect(dependencies?.(element)).toHaveLength(1);
		expect(
			dependencies?.({
				...element,
				customAttributes: { referenceImagesOverride: "https://img/own.png" },
			}),
		).toEqual([]);
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
