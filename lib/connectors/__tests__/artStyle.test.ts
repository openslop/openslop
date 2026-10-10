import { describe, expect, it } from "vitest";
import { asset } from "@/lib/canvas/__tests__/_assets";
import { createCanvasElement } from "@/lib/canvas/createCanvasElement";
import type { CanvasElement } from "@/lib/canvas/types";
import { createArtStylePlugin } from "@/lib/connectors/image/plugins/artStyle";
import { pluginCtx, readsOf } from "./_stateCtx";

const plugin = createArtStylePlugin();
const image = createCanvasElement("image", { id: "i1" });

const readOff = (canvas: CanvasElement[]) =>
	pluginCtx({ reads: readsOf(plugin, image, canvas) });

const transform = (prompt: string, ctx = pluginCtx()) => {
	const { transformPrompt } = plugin;
	if (!transformPrompt) throw new Error("no transformPrompt");
	return transformPrompt(prompt, ctx);
};

describe("createArtStylePlugin", () => {
	it.each([
		[
			"prepends the style's text",
			[asset("asset_style", { text: "cinematic anime" })],
			"cinematic anime. a cat on a roof",
		],
		["leaves the prompt alone without a style", [], "a cat on a roof"],
		[
			"leaves the prompt alone when the style says nothing",
			[asset("asset_style")],
			"a cat on a roof",
		],
	])("%s", (_, styles, expected) => {
		expect(transform("a cat on a roof", readOff([...styles, image]))).toBe(
			expected,
		);
	});

	it("reads the style's text as the art style", () => {
		const style = asset("asset_style", { text: "noir" });
		expect(readsOf(plugin, image, [style, image])).toEqual({
			"the art style": "noir",
		});
	});
});
