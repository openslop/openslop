import { describe, expect, it } from "vitest";
import type { CanvasContentElement, SceneElement } from "@/lib/canvas/types";
import { SCENE_TYPE } from "@/lib/canvas/types";
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

function scene(id: string, children: CanvasContentElement[]): SceneElement {
	return { id, type: SCENE_TYPE, children };
}

/** A single scene holding every element — the common case for these assertions. */
const one = (children: CanvasContentElement[]) => [scene("sc1", children)];

describe("getLayoutKey", () => {
	it("returns the same key for identical element lists", () => {
		const a = one([el("s1", { loops: "2" }), el("s2")]);
		const b = one([el("s1", { loops: "2" }), el("s2")]);
		expect(getLayoutKey(a, "none")).toBe(getLayoutKey(b, "none"));
	});

	it("changes when elements are reordered", () => {
		const a = one([el("s1"), el("s2")]);
		const b = one([el("s2"), el("s1")]);
		expect(getLayoutKey(a, "none")).not.toBe(getLayoutKey(b, "none"));
	});

	it("changes when an element is added", () => {
		const a = one([el("s1")]);
		const b = one([el("s1"), el("s2")]);
		expect(getLayoutKey(a, "none")).not.toBe(getLayoutKey(b, "none"));
	});

	it("changes when an element is removed", () => {
		const a = one([el("s1"), el("s2")]);
		const b = one([el("s1")]);
		expect(getLayoutKey(a, "none")).not.toBe(getLayoutKey(b, "none"));
	});

	it("changes when loops changes on any element", () => {
		const a = one([el("s1", { loops: "1" })]);
		const b = one([el("s1", { loops: "4" })]);
		expect(getLayoutKey(a, "none")).not.toBe(getLayoutKey(b, "none"));
	});

	it("changes when volume changes on any element", () => {
		const a = one([el("s1", { volume: "10" })]);
		const b = one([el("s1", { volume: "3" })]);
		expect(getLayoutKey(a, "none")).not.toBe(getLayoutKey(b, "none"));
	});

	it("is stable across unrelated attribute changes", () => {
		const a = one([el("s1", { emotion: "happy" })]);
		const b = one([el("s1", { emotion: "sad" })]);
		expect(getLayoutKey(a, "none")).toBe(getLayoutKey(b, "none"));
	});

	it("is stable across text edits (text is not in the element body)", () => {
		const a = one([el("s1")]);
		const b = one([
			{
				id: "s1",
				type: "sound",
				children: [{ id: "s1-t", type: "sound", text: "rain" }],
			},
		]);
		expect(getLayoutKey(a, "none")).toBe(getLayoutKey(b, "none"));
	});

	it("changes when transition type changes", () => {
		const nodes = one([el("s1")]);
		expect(getLayoutKey(nodes, "none")).not.toBe(getLayoutKey(nodes, "fade"));
	});

	it("changes when an element moves to another scene, even though flat order is unchanged", () => {
		const before = [scene("sc1", [el("s1")]), scene("sc2", [el("s2")])];
		const after = [scene("sc1", []), scene("sc2", [el("s1"), el("s2")])];
		expect(getLayoutKey(before, "none")).not.toBe(getLayoutKey(after, "none"));
	});

	it("changes when scenes split, even though flat order is unchanged", () => {
		const merged = one([el("s1"), el("s2")]);
		const split = [scene("sc1", [el("s1")]), scene("sc2", [el("s2")])];
		expect(getLayoutKey(merged, "none")).not.toBe(getLayoutKey(split, "none"));
	});

	it("ignores content elements that sit outside a scene, as the resolver does", () => {
		const withOrphan = [scene("sc1", [el("s1")]), el("orphan")];
		expect(getLayoutKey(withOrphan, "none")).toBe(
			getLayoutKey(one([el("s1")]), "none"),
		);
	});
});
