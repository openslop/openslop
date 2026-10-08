import { describe, expect, it } from "vitest";
import { references } from "@/lib/canvas/__tests__/_assets";
import { createCanvasElement } from "@/lib/canvas/createCanvasElement";
import { createReferenceImagesPlugin } from "@/lib/connectors/image/plugins/reference-images";
import { pluginCtx, readsOf } from "./_state-ctx";

const plugin = createReferenceImagesPlugin();

const image = (attrs: Record<string, string> = {}) =>
	createCanvasElement("image", { id: "el", attrs });

const OWN = "https://img/own.png, https://img/two.png";

describe("createReferenceImagesPlugin", () => {
	it.each([
		["leaves params alone with none anywhere", {}, [], {}],
		[
			"uses the project's images",
			{},
			["https://img/a.png", "https://img/b.png"],
			{ referenceImages: ["https://img/a.png", "https://img/b.png"] },
		],
		[
			"appends the project's images to the params' own",
			{ referenceImages: ["https://img/existing.png"] },
			["https://img/store.png"],
			{
				referenceImages: ["https://img/existing.png", "https://img/store.png"],
			},
		],
		[
			"keeps the params' own when the project has none",
			{ referenceImages: ["https://img/existing.png"] },
			[],
			{ referenceImages: ["https://img/existing.png"] },
		],
		[
			"uses the element's override in place of the project's images",
			{ referenceImagesOverride: OWN },
			["https://img/store.png"],
			{ referenceImages: ["https://img/own.png", "https://img/two.png"] },
		],
		[
			"generates with no images on an empty override",
			{ referenceImagesOverride: "" },
			["https://img/store.png"],
			{},
		],
	])("%s", (_, own, urls, expected) => {
		const element = image(
			"referenceImagesOverride" in own
				? { referenceImagesOverride: own.referenceImagesOverride }
				: {},
		);
		const canvas = urls.length ? [references(...urls)] : [];
		const ctx = pluginCtx({ reads: readsOf(plugin, element, canvas) });
		if (!plugin.beforeGenerate) throw new Error("no beforeGenerate");

		expect(plugin.beforeGenerate({ prompt: "a cat", ...own }, ctx)).toEqual({
			prompt: "a cat",
			...expected,
		});
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
