import { describe, expect, it } from "vitest";
import { Node, type Descendant } from "slate";
import {
	getElementBodyText,
	getElementText,
	serializeOSMLWithScenes,
} from "../osmlSerializer";
import { ZERO_WIDTH_SPACE } from "../constants";
import { NARRATOR } from "../assets";
import { createCanvasNode } from "../createCanvasNode";
import { parseOSML } from "../osmlStreamParser";
import {
	SCENE_TYPE,
	type CanvasContentElement,
	type SceneElement,
} from "@/lib/canvas/types";
import { splitAttributes } from "@/lib/canvas/elementAttributes";
import { deserializeWithScenes } from "@/lib/project/serialize";
import { asset, references } from "./_assets";

function el(
	type: CanvasContentElement["type"],
	text: string,
	customAttributes?: Record<string, string>,
): CanvasContentElement {
	return {
		id: "e1",
		type,
		...splitAttributes(customAttributes ?? {}),
		children: [{ id: "t1", type, text }],
	};
}

const wrap = (...children: CanvasContentElement[]): SceneElement => ({
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
		const result = serializeOSMLWithScenes([
			asset("asset_style", { text: "ink wash" }),
			wrap(el("narration", "Hello")),
			asset("asset_voice", {
				name: "Mia & Co",
				attrs: {
					gender: "feminine",
					provider: "cartesia",
					model: "Sonic 3.6",
				},
			}),
		]);

		expect(result.split("\n")).toEqual([
			'<asset_style id="asset_style">ink wash</asset_style>',
			'<asset_voice id="asset_voice:Mia &amp; Co" provider="cartesia" model="Sonic 3.6" name="Mia &amp; Co" gender="feminine"></asset_voice>',
			"",
			"--- Scene 1 ---",
			'<narration id="e1">Hello</narration>',
		]);
	});
});

describe("getElementText", () => {
	it("extracts joined text from children", () => {
		const element: CanvasContentElement = {
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
	const marked = (...texts: string[]): CanvasContentElement => ({
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

/** Leaves are given fresh ids on every parse. */
const withoutLeafIds = (element: Descendant) =>
	"children" in element
		? {
				...element,
				children: element.children.map((child) => ({
					...child,
					id: expect.any(String),
				})),
			}
		: element;

describe("serialize round trip", () => {
	const reload = (scene: SceneElement): SceneElement =>
		wrap(
			...(parseOSML(
				serializeOSMLWithScenes([scene]),
			) as CanvasContentElement[]),
		);

	it("does not grow the script each time it is saved and reloaded", () => {
		let scene = wrap(
			createCanvasNode("narration", {
				id: "e1",
				text: "hello",
			}),
		);
		const first = serializeOSMLWithScenes([scene]);

		for (let i = 0; i < 3; i++) scene = reload(scene);

		expect(serializeOSMLWithScenes([scene])).toBe(first);
	});

	it("keeps the assets, ahead of the scenes, through a save and reload", () => {
		const saved = serializeOSMLWithScenes([
			asset("asset_style", { text: "ink wash" }),
			asset("asset_avatar", { name: "Mia", text: "Brown hair" }),
			asset("asset_voice", {
				name: NARRATOR,
				attrs: { gender: "feminine", voiceId: "v1" },
			}),
			references("https://img/a.png?x=1&y=2", "https://img/b.png"),
			wrap(createCanvasNode("narration", { id: "n1", text: "first" })),
			wrap(createCanvasNode("narration", { id: "n2", text: "second" })),
		]);

		const reloaded = deserializeWithScenes(saved);

		expect(reloaded.map((node) => node.type)).toEqual([
			"asset_style",
			"asset_avatar",
			"asset_voice",
			"asset_references",
			SCENE_TYPE,
			SCENE_TYPE,
		]);
		expect(reloaded.slice(0, 4)).toEqual(
			[
				asset("asset_style", { text: "ink wash" }),
				asset("asset_avatar", { name: "Mia", text: "Brown hair" }),
				asset("asset_voice", {
					name: NARRATOR,
					attrs: { gender: "feminine", voiceId: "v1" },
				}),
				references("https://img/a.png?x=1&y=2", "https://img/b.png"),
			].map(withoutLeafIds),
		);
		expect(serializeOSMLWithScenes(reloaded)).toBe(saved);
	});

	it("keeps a reloaded empty element recognisably empty", () => {
		const scene = reload(wrap(createCanvasNode("narration", { id: "e1" })));
		expect(Node.string(scene.children[0])).toBe(ZERO_WIDTH_SPACE);
	});
});
