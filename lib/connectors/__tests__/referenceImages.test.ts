import { describe, expect, it } from "vitest";
import { references } from "@/lib/canvas/__tests__/_assets";
import { createCanvasElement } from "@/lib/canvas/createCanvasElement";
import { createReferenceImagesPlugin } from "@/lib/connectors/image/plugins/referenceImages";
import { pluginCtx, readsOf } from "./_stateCtx";

const plugin = createReferenceImagesPlugin();

const image = (attrs: Record<string, string> = {}) =>
	createCanvasElement("image", { id: "el", attrs });

const OWN = "https://img/own.png, https://img/two.png";

describe("createReferenceImagesPlugin", () => {
	const STORE = "https://img/store.png";
	const EXISTING = "https://img/existing.png";

	it.each([
		["adds no images with none anywhere", {}, {}, [], { referenceImages: [] }],
		[
			"uses the project's images",
			{},
			{},
			[references("https://img/a.png", "https://img/b.png")],
			{ referenceImages: ["https://img/a.png", "https://img/b.png"] },
		],
		[
			"appends the project's images to the params' own",
			{ referenceImages: [EXISTING] },
			{},
			[references(STORE)],
			{ referenceImages: [EXISTING, STORE] },
		],
		[
			"keeps the params' own when the project has none",
			{ referenceImages: [EXISTING] },
			{},
			[],
			{ referenceImages: [EXISTING] },
		],
		[
			"uses the element's override in place of the project's images",
			{},
			{ referenceImagesOverride: OWN },
			[references(STORE)],
			{ referenceImages: ["https://img/own.png", "https://img/two.png"] },
		],
		[
			"generates with no images on an empty override",
			{},
			{ referenceImagesOverride: "" },
			[references(STORE)],
			{ referenceImages: [] },
		],
	])("%s", (_, own, attrs, canvas, expected) => {
		const ctx = pluginCtx({ reads: readsOf(plugin, image(attrs), canvas) });
		if (!plugin.beforeGenerate) throw new Error("no beforeGenerate");

		expect(
			plugin.beforeGenerate({ prompt: "a cat", ...own, ...attrs }, ctx),
		).toEqual({ prompt: "a cat", ...expected });
	});

	it("reads the project's references only while inheriting them", () => {
		const held = references("https://img/a.png");

		expect(readsOf(plugin, image(), [held])).toEqual({
			"the reference images": "https://img/a.png",
		});
		expect(
			readsOf(plugin, image({ referenceImagesOverride: OWN }), [held]),
		).toEqual({});
	});
});
