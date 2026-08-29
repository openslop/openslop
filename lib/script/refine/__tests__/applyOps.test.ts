import { describe, expect, it, vi } from "vitest";
import { createEditor, Editor, Element } from "slate";
import type { CanvasContentElement, SceneElement } from "@/lib/canvas/types";

// No connector model stamped here — these tests exercise refine-op mechanics
// (insert/remove/set/anchor tracking), not attribute-schema resolution, which
// has its own tests under lib/connectors/attributes/.
const SCHEMA_DEFAULTS: Record<string, Record<string, string>> = {
	sfx: { loops: "1" },
	tts: { emotion: "neutral" },
	animated_image: { duration: "5" },
};

vi.mock("@/lib/connectors/factory", () => ({
	resolveAttributeSchema: (type: string) => {
		const defaultAttributes = SCHEMA_DEFAULTS[type] ?? {};
		return { defaultAttributes, keys: Object.keys(defaultAttributes) };
	},
}));

import { applyRefineOp, applyRefineOps } from "../applyOps";
import { MODEL_CATALOGS } from "@/lib/connectors/models";
import { flatAttributes, splitAttributes } from "@/lib/video/elementAttributes";

const ZWSP = "\u200B";

function content(
	type: CanvasContentElement["type"],
	id: string,
	text = "",
	customAttributes?: Record<string, string>,
): CanvasContentElement {
	return {
		id,
		type,
		...splitAttributes(customAttributes ?? {}),
		children: [
			{ id: `${id}-m`, type, text: ZWSP },
			{ id: `${id}-t`, type, text },
		],
	};
}

function scene(children: CanvasContentElement[], id = "s1"): SceneElement {
	return { id, type: "scene", children };
}

function makeEditor(scenes: SceneElement[]) {
	const editor = createEditor();
	editor.children = scenes;
	return editor;
}

function getContentIds(editor: Editor): string[] {
	const ids: string[] = [];
	for (const [node] of Editor.nodes(editor, {
		at: [],
		match: (n) => Element.isElement(n) && n.type !== "scene",
	})) {
		ids.push((node as CanvasContentElement).id);
	}
	return ids;
}

function getNode(editor: Editor, id: string): CanvasContentElement {
	const [node] = Editor.nodes(editor, {
		at: [],
		match: (n) => Element.isElement(n) && n.id === id,
	});
	return node[0] as CanvasContentElement;
}

function getContentTexts(editor: Editor): string[] {
	const texts: string[] = [];
	for (const [node] of Editor.nodes(editor, {
		at: [],
		match: (n) => Element.isElement(n) && n.type !== "scene",
	})) {
		const el = node as CanvasContentElement;
		texts.push(
			el.children
				.map((c) => c.text)
				.join("")
				.replaceAll(ZWSP, ""),
		);
	}
	return texts;
}

describe("applyRefineOp — insert", () => {
	it("appends to end when no anchor_id", () => {
		const editor = makeEditor([scene([content("narration", "n1", "hello")])]);
		const anchorMap: Record<string, string> = {};

		applyRefineOp(
			editor,
			{ op: "insert", type: "sound", text: "rain" },
			anchorMap,
		);

		const ids = getContentIds(editor);
		expect(ids[0]).toBe("n1");
		expect(ids).toHaveLength(2);
		expect(getContentTexts(editor)[1]).toBe("rain");
	});

	it("prepends to top when position is before with no anchor_id", () => {
		const editor = makeEditor([scene([content("narration", "n1", "hello")])]);
		const anchorMap: Record<string, string> = {};

		applyRefineOp(
			editor,
			{ op: "insert", position: "before", type: "sound", text: "rain" },
			anchorMap,
		);

		expect(getContentTexts(editor)[0]).toBe("rain");
		expect(getContentTexts(editor)[1]).toBe("hello");
	});

	it("inserts after an anchored element", () => {
		const editor = makeEditor([
			scene([
				content("narration", "n1", "first"),
				content("narration", "n2", "second"),
			]),
		]);
		const anchorMap: Record<string, string> = {};

		applyRefineOp(
			editor,
			{ op: "insert", anchor_id: "n1", type: "sound", text: "rain" },
			anchorMap,
		);

		const texts = getContentTexts(editor);
		expect(texts).toEqual(["first", "rain", "second"]);
	});

	it("inserts before an anchored element", () => {
		const editor = makeEditor([scene([content("narration", "n1", "first")])]);
		const anchorMap: Record<string, string> = {};

		applyRefineOp(
			editor,
			{
				op: "insert",
				anchor_id: "n1",
				position: "before",
				type: "sound",
				text: "rain",
			},
			anchorMap,
		);

		const texts = getContentTexts(editor);
		expect(texts).toEqual(["rain", "first"]);
	});

	it("stacks consecutive inserts at the same anchor in order", () => {
		const editor = makeEditor([scene([content("narration", "n1", "first")])]);
		const anchorMap: Record<string, string> = {};

		applyRefineOp(
			editor,
			{ op: "insert", anchor_id: "n1", type: "sound", text: "A" },
			anchorMap,
		);
		applyRefineOp(
			editor,
			{ op: "insert", anchor_id: "n1", type: "sound", text: "B" },
			anchorMap,
		);
		applyRefineOp(
			editor,
			{ op: "insert", anchor_id: "n1", type: "sound", text: "C" },
			anchorMap,
		);

		const texts = getContentTexts(editor);
		expect(texts).toEqual(["first", "A", "B", "C"]);
	});

	it("reports a missing anchor instead of appending somewhere else", () => {
		const editor = makeEditor([scene([content("narration", "n1", "hello")])]);
		const anchorMap: Record<string, string> = {};

		const result = applyRefineOp(
			editor,
			{ op: "insert", anchor_id: "nonexistent", type: "sound", text: "rain" },
			anchorMap,
		);

		expect(result).toEqual({
			ok: false,
			reason: 'insert: anchor "nonexistent" no longer exists',
		});
		expect(getContentTexts(editor)).toEqual(["hello"]);
	});

	it("uses custom attrs from the op", () => {
		const editor = makeEditor([scene([content("narration", "n1")])]);
		const anchorMap: Record<string, string> = {};

		applyRefineOp(
			editor,
			{
				op: "insert",
				type: "sound",
				text: "rain",
				attrs: { loops: "3" },
			},
			anchorMap,
		);

		const nodes: CanvasContentElement[] = [];
		for (const [node] of Editor.nodes(editor, {
			at: [],
			match: (n) => Element.isElement(n) && n.type === "sound",
		})) {
			nodes.push(node as CanvasContentElement);
		}
		expect(flatAttributes(nodes[0])).toEqual({
			loops: "3",
			model: MODEL_CATALOGS.sfx.defaultModel,
		});
	});
});

describe("applyRefineOp — remove", () => {
	it("removes a node by id", () => {
		const editor = makeEditor([
			scene([
				content("narration", "n1", "first"),
				content("narration", "n2", "second"),
			]),
		]);

		applyRefineOp(editor, { op: "remove", id: "n1" }, {});

		expect(getContentIds(editor)).toEqual(["n2"]);
	});

	it("silently skips when id not found", () => {
		const editor = makeEditor([scene([content("narration", "n1", "hello")])]);

		applyRefineOp(editor, { op: "remove", id: "nonexistent" }, {});

		expect(getContentIds(editor)).toEqual(["n1"]);
	});
});

describe("applyRefineOp — set", () => {
	it("updates text content", () => {
		const editor = makeEditor([scene([content("narration", "n1", "old")])]);

		applyRefineOp(editor, { op: "set", id: "n1", text: "new text" }, {});

		expect(getContentTexts(editor)).toEqual(["new text"]);
	});

	it("merges attrs into existing customAttributes", () => {
		const editor = makeEditor([
			scene([
				content("character", "n1", "hello", {
					name: "Lyra",
					emotion: "neutral",
				}),
			]),
		]);

		applyRefineOp(
			editor,
			{ op: "set", id: "n1", attrs: { emotion: "excited" } },
			{},
		);

		const el = getNode(editor, "n1");
		expect(flatAttributes(el)).toEqual({
			name: "Lyra",
			emotion: "excited",
		});
	});

	it("removes attrs set to null", () => {
		const editor = makeEditor([
			scene([
				content("character", "n1", "hello", {
					name: "Lyra",
					emotion: "neutral",
				}),
			]),
		]);

		applyRefineOp(
			editor,
			{ op: "set", id: "n1", attrs: { emotion: null } },
			{},
		);

		const el = getNode(editor, "n1");
		expect(flatAttributes(el)).toEqual({ name: "Lyra" });
	});

	it("applies attrs and text together", () => {
		const editor = makeEditor([
			scene([content("character", "n1", "old", { name: "Lyra" })]),
		]);

		applyRefineOp(
			editor,
			{
				op: "set",
				id: "n1",
				attrs: { name: "Alice", emotion: "happy" },
				text: "Hello!",
			},
			{},
		);

		const el = getNode(editor, "n1");
		expect(flatAttributes(el)).toEqual({ name: "Alice", emotion: "happy" });
		expect(el.children.map((c) => c.text).join("")).toBe(`${ZWSP}Hello!`);
	});

	it("keeps the caret marker when text is replaced or cleared", () => {
		const editor = makeEditor([scene([content("narration", "n1", "old")])]);

		applyRefineOp(editor, { op: "set", id: "n1", text: "new" }, {});
		expect(Editor.string(editor, [0, 0])).toBe(`${ZWSP}new`);

		applyRefineOp(editor, { op: "set", id: "n1", text: "" }, {});
		expect(Editor.string(editor, [0, 0])).toBe(ZWSP);
	});

	it("silently skips when id not found", () => {
		const editor = makeEditor([scene([content("narration", "n1", "hello")])]);

		applyRefineOp(editor, { op: "set", id: "nonexistent", text: "new" }, {});

		expect(getContentTexts(editor)).toEqual(["hello"]);
	});

	it("preserves shared attributes across a type change, dropping stale ones", () => {
		const editor = makeEditor([
			scene([
				content("image", "n1", "a red riding hood", {
					characters: "Red,Granny",
					url: "https://example.com/old.png",
					motion: "none",
				}),
			]),
		]);

		applyRefineOp(
			editor,
			{
				op: "set",
				id: "n1",
				type: "animated_image",
				attrs: { videoPrompt: "slow push-in", motion: "kenBurnsIn" },
			},
			{},
		);

		const el = getNode(editor, "n1");
		expect(el.type).toBe("animated_image");
		expect(flatAttributes(el)).toEqual({
			model: MODEL_CATALOGS.animated_image.defaultModel,
			characters: "Red,Granny",
			duration: "5",
			videoPrompt: "slow push-in",
			motion: "kenBurnsIn",
		});
	});
});

describe("applyRefineOp — insert positioning edge cases", () => {
	it("inserts at different anchors independently", () => {
		const editor = makeEditor([
			scene([
				content("narration", "n1", "first"),
				content("narration", "n2", "second"),
				content("narration", "n3", "third"),
			]),
		]);
		const anchorMap: Record<string, string> = {};

		applyRefineOp(
			editor,
			{ op: "insert", anchor_id: "n1", type: "sound", text: "A" },
			anchorMap,
		);
		applyRefineOp(
			editor,
			{ op: "insert", anchor_id: "n3", type: "sound", text: "B" },
			anchorMap,
		);

		const texts = getContentTexts(editor);
		expect(texts).toEqual(["first", "A", "second", "third", "B"]);
	});

	it("stacking works across interleaved anchors", () => {
		const editor = makeEditor([
			scene([
				content("narration", "n1", "first"),
				content("narration", "n2", "second"),
			]),
		]);
		const anchorMap: Record<string, string> = {};

		applyRefineOp(
			editor,
			{ op: "insert", anchor_id: "n1", type: "sound", text: "A1" },
			anchorMap,
		);
		applyRefineOp(
			editor,
			{ op: "insert", anchor_id: "n2", type: "sound", text: "B1" },
			anchorMap,
		);
		applyRefineOp(
			editor,
			{ op: "insert", anchor_id: "n1", type: "sound", text: "A2" },
			anchorMap,
		);

		const texts = getContentTexts(editor);
		expect(texts).toEqual(["first", "A1", "A2", "second", "B1"]);
	});

	it("multiple appends to end stack in order", () => {
		const editor = makeEditor([scene([content("narration", "n1", "first")])]);
		const anchorMap: Record<string, string> = {};

		applyRefineOp(
			editor,
			{ op: "insert", type: "sound", text: "A" },
			anchorMap,
		);
		applyRefineOp(
			editor,
			{ op: "insert", type: "sound", text: "B" },
			anchorMap,
		);
		applyRefineOp(
			editor,
			{ op: "insert", type: "sound", text: "C" },
			anchorMap,
		);

		const texts = getContentTexts(editor);
		expect(texts).toEqual(["first", "A", "B", "C"]);
	});
});

describe("applyRefineOp — mixed operations", () => {
	it("handles insert then remove sequence", () => {
		const editor = makeEditor([scene([content("narration", "n1", "hello")])]);
		const anchorMap: Record<string, string> = {};

		applyRefineOp(
			editor,
			{ op: "insert", anchor_id: "n1", type: "sound", text: "rain" },
			anchorMap,
		);
		applyRefineOp(editor, { op: "remove", id: "n1" }, anchorMap);

		expect(getContentTexts(editor)).toEqual(["rain"]);
	});

	it("handles set then insert at same anchor", () => {
		const editor = makeEditor([
			scene([content("narration", "n1", "old text")]),
		]);
		const anchorMap: Record<string, string> = {};

		applyRefineOp(editor, { op: "set", id: "n1", text: "new text" }, anchorMap);
		applyRefineOp(
			editor,
			{ op: "insert", anchor_id: "n1", type: "sound", text: "rain" },
			anchorMap,
		);

		expect(getContentTexts(editor)).toEqual(["new text", "rain"]);
	});

	it("falls back to original anchor when mapped node is removed", () => {
		const editor = makeEditor([
			scene([
				content("narration", "n1", "first"),
				content("narration", "n2", "second"),
			]),
		]);
		const anchorMap: Record<string, string> = {};

		// Insert after n1 — anchorMap now maps n1 → inserted node
		applyRefineOp(
			editor,
			{ op: "insert", anchor_id: "n1", type: "sound", text: "A" },
			anchorMap,
		);
		// Remove the inserted node — anchorMap["n1"] is now stale
		const insertedId = anchorMap["n1"];
		applyRefineOp(editor, { op: "remove", id: insertedId }, anchorMap);
		// Insert after n1 again — should fall back to original n1, not append to end
		applyRefineOp(
			editor,
			{ op: "insert", anchor_id: "n1", type: "sound", text: "B" },
			anchorMap,
		);

		const texts = getContentTexts(editor);
		expect(texts).toEqual(["first", "B", "second"]);
	});

	it("clears stale anchor mapping after fallback", () => {
		const editor = makeEditor([scene([content("narration", "n1", "first")])]);
		const anchorMap: Record<string, string> = {};

		applyRefineOp(
			editor,
			{ op: "insert", anchor_id: "n1", type: "sound", text: "A" },
			anchorMap,
		);
		const staleId = anchorMap["n1"];
		applyRefineOp(editor, { op: "remove", id: staleId }, anchorMap);
		// After fallback, the stale mapping should be cleared
		applyRefineOp(
			editor,
			{ op: "insert", anchor_id: "n1", type: "sound", text: "B" },
			anchorMap,
		);
		// Second insert at n1 should stack after B (new mapping)
		applyRefineOp(
			editor,
			{ op: "insert", anchor_id: "n1", type: "sound", text: "C" },
			anchorMap,
		);

		const texts = getContentTexts(editor);
		expect(texts).toEqual(["first", "B", "C"]);
	});
});

describe("applyRefineOps", () => {
	it("applies a turn's ops in order and counts them", () => {
		const editor = makeEditor([scene([content("narration", "n1", "hello")])]);

		const result = applyRefineOps(editor, [
			{ op: "set", id: "n1", text: "goodbye" },
			{ op: "insert", anchor_id: "n1", type: "sound", text: "rain" },
		]);

		expect(result).toEqual({ applied: 2, failures: [] });
		expect(getContentTexts(editor)).toEqual(["goodbye", "rain"]);
	});

	it("keeps going past a failed op and reports why it failed", () => {
		const editor = makeEditor([scene([content("narration", "n1", "hello")])]);

		const result = applyRefineOps(editor, [
			{ op: "set", id: "gone", text: "nope" },
			{ op: "insert", anchor_id: "n1", type: "sound", text: "rain" },
		]);

		expect(result.applied).toBe(1);
		expect(result.failures).toEqual(['set: no element "gone"']);
		expect(getContentTexts(editor)).toEqual(["hello", "rain"]);
	});
});
