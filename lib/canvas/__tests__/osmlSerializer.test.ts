import { describe, expect, it } from "vitest";
import { Node } from "slate";
import { DEFAULT_CONNECTOR_REGISTRY } from "@/lib/connectors/registry";
import {
	getElementBodyText,
	getElementText,
	serializeOSML,
	serializeOSMLWithScenes,
} from "../osmlSerializer";
import { ZERO_WIDTH_SPACE } from "../constants";
import { createCanvasNode } from "../createCanvasNode";
import { parseOSML } from "../osmlStreamParser";
import {
	SCENE_TYPE,
	type CanvasContentElement,
	type SceneElement,
} from "@/lib/canvas/types";
import { splitAttributes } from "@/lib/video/elementAttributes";

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

describe("serializeOSML", () => {
	it("serializes narration with id", () => {
		const result = serializeOSML([wrap(el("narration", "Hello world"))]);
		expect(result).toBe('<narration id="e1">Hello world</narration>');
	});

	it("serializes tagged elements with id", () => {
		const result = serializeOSML([wrap(el("image", "a sunset"))]);
		expect(result).toBe('<image id="e1">a sunset</image>');
	});

	it("includes attributes after id in the tag", () => {
		const result = serializeOSML([
			wrap(el("character", "Hi there", { name: "Lyra", emotion: "excited" })),
		]);
		expect(result).toBe(
			'<character id="e1" name="Lyra" emotion="excited">Hi there</character>',
		);
	});

	it("flattens scene hierarchy when serializing", () => {
		const result = serializeOSML([
			wrap(el("narration", "Once upon a time")),
			wrap(el("character", "Hello!", { name: "Bob" }), el("image", "forest")),
		]);
		expect(result).toBe(
			'<narration id="e1">Once upon a time</narration>\n<character id="e1" name="Bob">Hello!</character>\n<image id="e1">forest</image>',
		);
	});

	it("handles empty attributes", () => {
		const result = serializeOSML([wrap(el("music", "epic orchestral"))]);
		expect(result).toBe('<music id="e1">epic orchestral</music>');
	});
});

function elWithId(
	type: CanvasContentElement["type"],
	id: string,
	text: string,
	customAttributes?: Record<string, string>,
): CanvasContentElement {
	return {
		id,
		type,
		...splitAttributes(customAttributes ?? {}),
		children: [{ id: `${id}-t`, type, text }],
	};
}

describe("serializeOSMLWithScenes", () => {
	it("includes scene headers with numbers", () => {
		const result = serializeOSMLWithScenes([
			wrap(elWithId("narration", "n1", "Hello")),
			wrap(elWithId("image", "img1", "sunset")),
		]);
		expect(result).toContain("--- Scene 1 ---");
		expect(result).toContain("--- Scene 2 ---");
	});

	it("serializes elements with ids inside scenes", () => {
		const result = serializeOSMLWithScenes([
			wrap(elWithId("narration", "n1", "Hello")),
		]);
		expect(result).toContain('<narration id="n1">Hello</narration>');
	});

	it("groups elements under their scene", () => {
		const result = serializeOSMLWithScenes([
			wrap(
				elWithId("narration", "n1", "first"),
				elWithId("sound", "s1", "rain", { loops: "3" }),
			),
		]);
		const lines = result.split("\n").filter(Boolean);
		expect(lines[0]).toBe("--- Scene 1 ---");
		expect(lines[1]).toContain("n1");
		expect(lines[2]).toContain("s1");
	});

	it("serializes a bare content element without a scene marker", () => {
		const result = serializeOSMLWithScenes([elWithId("narration", "n1", "hi")]);
		expect(result).toBe('<narration id="n1">hi</narration>');
	});

	it("keeps scene numbering across a mixed fragment", () => {
		const result = serializeOSMLWithScenes([
			elWithId("narration", "n1", "loose"),
			wrap(elWithId("image", "img1", "sunset")),
		]);
		expect(result.split("\n").filter(Boolean)).toEqual([
			'<narration id="n1">loose</narration>',
			"--- Scene 1 ---",
			'<image id="img1">sunset</image>',
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

describe("serialize round trip", () => {
	const reload = (scene: SceneElement): SceneElement =>
		wrap(
			...(parseOSML(
				serializeOSML([scene]),
				DEFAULT_CONNECTOR_REGISTRY,
			) as CanvasContentElement[]),
		);

	it("does not grow the script each time it is saved and reloaded", () => {
		let scene = wrap(
			createCanvasNode("narration", DEFAULT_CONNECTOR_REGISTRY, {
				id: "e1",
				text: "hello",
			}),
		);
		const first = serializeOSML([scene]);

		for (let i = 0; i < 3; i++) scene = reload(scene);

		expect(serializeOSML([scene])).toBe(first);
	});

	it("keeps a reloaded empty element recognisably empty", () => {
		const scene = reload(
			wrap(
				createCanvasNode("narration", DEFAULT_CONNECTOR_REGISTRY, { id: "e1" }),
			),
		);
		expect(Node.string(scene.children[0])).toBe(ZERO_WIDTH_SPACE);
	});
});
