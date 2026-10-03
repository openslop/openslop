import { describe, expect, it } from "vitest";
import { asset } from "@/lib/canvas/__tests__/_assets";
import { createCanvasNode } from "@/lib/canvas/createCanvasNode";
import type { ScriptElement } from "@/lib/canvas/types";
import { createArtStylePlugin } from "@/lib/connectors/image/plugins/art-style";
import { pluginCtx, readsOf } from "./_state-ctx";

const plugin = createArtStylePlugin();
const image = createCanvasNode("image", { id: "i1" });

const readOff = (canvas: ScriptElement[]) =>
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
			[asset("style", { text: "cinematic anime" })],
			"cinematic anime. a cat on a roof",
		],
		["leaves the prompt alone without a style", [], "a cat on a roof"],
		[
			"leaves the prompt alone when the style says nothing",
			[asset("style")],
			"a cat on a roof",
		],
	])("%s", (_, styles, expected) => {
		expect(transform("a cat on a roof", readOff([...styles, image]))).toBe(
			expected,
		);
	});

	it("reads the style's text as the art style", () => {
		const style = asset("style", { text: "noir" });
		expect(readsOf(plugin, image, [style, image])).toEqual({
			"the art style": "noir",
		});
	});
});
