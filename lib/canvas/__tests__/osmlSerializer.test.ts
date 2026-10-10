import { describe, expect, it } from "vitest";
import { Node } from "slate";
import {
	getElementBodyText,
	getElementText,
	serializeOSMLWithScenes,
} from "../osmlSerializer";
import { ZERO_WIDTH_SPACE } from "../constants";
import { createCanvasElement } from "../createCanvasElement";
import { parseOSML } from "../osmlStreamParser";
import {
	SCENE_TYPE,
	type ContentElement,
	type Scene,
} from "@/lib/canvas/types";
import { splitAttributes } from "@/lib/canvas/elementAttributes";
import { asset } from "./_assets";

function el(
	type: ContentElement["type"],
	text: string,
	customAttributes?: Record<string, string>,
): ContentElement {
	return {
		id: "e1",
		type,
		...splitAttributes(customAttributes ?? {}),
		children: [{ id: "t1", type, text }],
	};
}

const wrap = (...children: ContentElement[]): Scene => ({
	id: "scene-1",
	type: SCENE_TYPE,
	children,
});

describe("serializeOSMLWithScenes", () => {
	it("writes each scene under its marker, attributes after the id", () => {
		const result = serializeOSMLWithScenes([
			wrap(el("narration", "Once upon a time")),
			wrap(
				el("character", "Hello!", { name: "Bob", emotion: "excited" }),
				el("image", "forest"),
			),
		]);
		expect(result).toBe(
			'--- Scene 1 ---\n<narration id="e1">Once upon a time</narration>\n\n--- Scene 2 ---\n<character id="e1" name="Bob" emotion="excited">Hello!</character>\n<image id="e1">forest</image>',
		);
	});

	it("writes the assets ahead of the first scene, wherever they sit", () => {
		const style = asset("asset_style", { text: "ink wash" });
		const voice = asset("asset_voice", {
			name: "Mia & Co",
			attrs: {
				gender: "feminine",
				provider: "cartesia",
				model: "Sonic 3.6",
			},
		});
		const result = serializeOSMLWithScenes([
			style,
			wrap(el("narration", "Hello")),
			voice,
		]);

		expect(result.split("\n")).toEqual([
			`<asset_style id="${style.id}">ink wash</asset_style>`,
			`<asset_voice id="${voice.id}" name="Mia &amp; Co" gender="feminine" provider="cartesia" model="Sonic 3.6"></asset_voice>`,
			"",
			"--- Scene 1 ---",
			'<narration id="e1">Hello</narration>',
		]);
	});
});

describe("getElementText", () => {
	it("extracts joined text from children", () => {
		const element: ContentElement = {
			id: "e1",
			type: "narration",
			children: [
				{ id: "t1", type: "narration", text: "Hello " },
				{ id: "t2", type: "narration", text: "world" },
			],
		};
		expect(getElementText(element)).toBe("Hello world");
	});
});

describe("getElementBodyText", () => {
	const marked = (...texts: string[]): ContentElement => ({
		id: "e1",
		type: "narration",
		children: texts.map((text, i) => ({
			id: `t${i}`,
			type: "narration",
			text,
		})),
	});

	it("drops the caret marker leaf", () => {
		expect(getElementBodyText(marked(ZERO_WIDTH_SPACE, "Hello world"))).toBe(
			"Hello world",
		);
	});

	it("repairs text that already accumulated markers", () => {
		expect(
			getElementBodyText(
				marked(ZERO_WIDTH_SPACE, `${ZERO_WIDTH_SPACE}${ZERO_WIDTH_SPACE}Hello`),
			),
		).toBe("Hello");
	});

	it("keeps a marker-only element empty rather than blank-looking", () => {
		expect(getElementBodyText(marked(ZERO_WIDTH_SPACE))).toBe("");
	});
});

describe("serialize round trip", () => {
	const reload = (scene: Scene): Scene =>
		wrap(...(parseOSML(serializeOSMLWithScenes([scene])) as ContentElement[]));

	it("does not grow the script each time it is saved and reloaded", () => {
		let scene = wrap(
			createCanvasElement("narration", {
				id: "e1",
				text: "hello",
			}),
		);
		const first = serializeOSMLWithScenes([scene]);

		for (let i = 0; i < 3; i++) scene = reload(scene);

		expect(serializeOSMLWithScenes([scene])).toBe(first);
	});

	it("keeps a reloaded empty element recognisably empty", () => {
		const scene = reload(wrap(createCanvasElement("narration", { id: "e1" })));
		expect(Node.string(scene.children[0])).toBe(ZERO_WIDTH_SPACE);
	});
});
