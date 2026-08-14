import { describe, expect, it } from "vitest";
import {
	SCENE_TYPE,
	type CanvasContentElement,
	type SceneElement,
} from "@/lib/canvas/types";
import { getLayoutKey } from "../layoutKey";

function el(
	id: string,
	customAttributes?: Record<string, string>,
): CanvasContentElement {
	return {
		id,
		type: "sound",
		...(customAttributes && { customAttributes }),
		children: [{ id: `${id}-t`, type: "sound", text: "" }],
	};
}

/** One scene holding the elements, which is how the document always nests them. */
const scene = (
	children: CanvasContentElement[],
	id = "scene-1",
): SceneElement[] => [{ id, type: SCENE_TYPE, children }];

describe("getLayoutKey", () => {
	it("returns the same key for identical element lists", () => {
		const a = [el("s1", { loops: "2" }), el("s2")];
		const b = [el("s1", { loops: "2" }), el("s2")];
		expect(getLayoutKey(scene(a), "none")).toBe(getLayoutKey(scene(b), "none"));
	});

	it("changes when elements are reordered", () => {
		const a = [el("s1"), el("s2")];
		const b = [el("s2"), el("s1")];
		expect(getLayoutKey(scene(a), "none")).not.toBe(
			getLayoutKey(scene(b), "none"),
		);
	});

	it("changes when an element is added", () => {
		const a = [el("s1")];
		const b = [el("s1"), el("s2")];
		expect(getLayoutKey(scene(a), "none")).not.toBe(
			getLayoutKey(scene(b), "none"),
		);
	});

	it("changes when an element is removed", () => {
		const a = [el("s1"), el("s2")];
		const b = [el("s1")];
		expect(getLayoutKey(scene(a), "none")).not.toBe(
			getLayoutKey(scene(b), "none"),
		);
	});

	it("changes when loops changes on any element", () => {
		const a = [el("s1", { loops: "1" })];
		const b = [el("s1", { loops: "4" })];
		expect(getLayoutKey(scene(a), "none")).not.toBe(
			getLayoutKey(scene(b), "none"),
		);
	});

	it("changes when volume changes on any element", () => {
		const a = [el("s1", { volume: "10" })];
		const b = [el("s1", { volume: "3" })];
		expect(getLayoutKey(scene(a), "none")).not.toBe(
			getLayoutKey(scene(b), "none"),
		);
	});

	it("changes when an element moves to another scene", () => {
		const before: SceneElement[] = [
			{ id: "scene-1", type: SCENE_TYPE, children: [el("s1")] },
			{ id: "scene-2", type: SCENE_TYPE, children: [el("s2")] },
		];
		const after: SceneElement[] = [
			{ id: "scene-1", type: SCENE_TYPE, children: [el("s1"), el("s2")] },
			{ id: "scene-2", type: SCENE_TYPE, children: [] },
		];
		// The flattened order is identical; only the scene each one sits in moved.
		expect(getLayoutKey(before, "none")).not.toBe(getLayoutKey(after, "none"));
	});

	it("is stable across unrelated attribute changes", () => {
		const a = [el("s1", { emotion: "happy" })];
		const b = [el("s1", { emotion: "sad" })];
		expect(getLayoutKey(scene(a), "none")).toBe(getLayoutKey(scene(b), "none"));
	});

	it("is stable across text edits (text is not in the element body)", () => {
		// text lives on children — layout key doesn't reach into it
		const a = [el("s1")];
		const b: CanvasContentElement[] = [
			{
				id: "s1",
				type: "sound",
				children: [{ id: "s1-t", type: "sound", text: "rain" }],
			},
		];
		expect(getLayoutKey(scene(a), "none")).toBe(getLayoutKey(scene(b), "none"));
	});

	it("changes when transition type changes", () => {
		const els = [el("s1")];
		expect(getLayoutKey(els, "none")).not.toBe(getLayoutKey(els, "fade"));
	});
});
