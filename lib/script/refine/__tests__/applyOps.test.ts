import { describe, expect, it, vi } from "vitest";
import { createEditor, Editor, Element } from "slate";
import type {
	AssetElement,
	AssetType,
	CanvasContentElement,
	SceneElement,
} from "@/lib/canvas/types";

// No connector model stamped here — these tests exercise refine-op mechanics
// (insert/remove/set/anchor tracking), not attribute-schema resolution, which
// has its own tests under lib/connectors/attributes/.
const SCHEMA_DEFAULTS: Record<string, Record<string, string>> = {
	sfx: { loops: "1" },
	tts: { emotion: "neutral" },
	video: { duration: "5" },
};

vi.mock("@/lib/connectors/factory", () => ({
	resolveAttributeSchema: (type: string) => {
		const defaultAttributes = SCHEMA_DEFAULTS[type] ?? {};
		return {
			defaultAttributes,
			keys: [
				...(type === "tts" ? [] : ["model"]),
				...Object.keys(defaultAttributes),
			],
			modelPicks:
				type === "tts"
					? []
					: [
							{
								kind: "model",
								key: "model",
								providerAttr: "provider",
								type,
							},
						],
			resolve: (attrs: Record<string, string>) => ({
				...defaultAttributes,
				...attrs,
			}),
			offers: () => true,
		};
	},
}));

import { applyRefineOp, applyRefineOps } from "../applyOps";
import type { RefineOp } from "../types";
import { assetId } from "@/lib/canvas/types";
import {
	getAssets,
	NARRATOR,
	NO_AVATAR,
	voiceAttrs,
} from "@/lib/canvas/assets";
import { createCanvasNode } from "@/lib/canvas/createCanvasNode";
import { getPromptText } from "@/lib/generation/inputs";
import { DEFAULT_MODELS, type ConnectorModels } from "@/lib/connectors/models";
import {
	flatAttributes,
	splitAttributes,
} from "@/lib/canvas/elementAttributes";

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

function makeEditor(
	scenes: SceneElement[],
	defaultModels: ConnectorModels = {},
) {
	const editor = createEditor();
	editor.defaultModels = () => defaultModels;
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
			...DEFAULT_MODELS.sfx,
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
					referenceImagesOverride: "https://img/red.png",
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
				type: "video",
				attrs: { startFrame: "n0", motion: "kenBurnsIn" },
			},
			{},
		);

		const el = getNode(editor, "n1");
		expect(el.type).toBe("video");
		expect(flatAttributes(el)).toEqual({
			...DEFAULT_MODELS.video,
			referenceImagesOverride: "https://img/red.png",
			duration: "5",
			startFrame: "n0",
			motion: "kenBurnsIn",
		});
	});

	it("puts a retyped element on the editor's default model for its new type", () => {
		const pinned = { provider: "runware", model: "Seedance 2 Fast" } as const;
		const editor = makeEditor([scene([content("image", "n1", "a wolf")])], {
			video: pinned,
		});

		applyRefineOp(editor, { op: "set", id: "n1", type: "video" }, {});

		expect(flatAttributes(getNode(editor, "n1"))).toMatchObject(pinned);
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

describe("applyRefineOp — assets", () => {
	const CAST = { ...DEFAULT_MODELS.image, ...voiceAttrs(DEFAULT_MODELS.tts) };

	const describeAssets = (editor: Editor) =>
		getAssets(editor.children).map((asset) => [
			asset.id,
			asset.generationAttributes ?? {},
			getPromptText(asset),
		]);

	const asset = <T extends AssetType>(
		type: T,
		text = "",
		attrs: Record<string, string> = {},
	) => createCanvasNode(type, { id: assetId(type, attrs.name), attrs, text });

	const makeCanvas = (
		assets: AssetElement[],
		children: CanvasContentElement[] = [content("narration", "n1", "hello")],
	) => {
		const editor = makeEditor([scene(children)]);
		editor.children = [...assets, ...editor.children];
		return editor;
	};

	const topLevelTypes = (editor: Editor) =>
		editor.children.map((node) => "type" in node && node.type);

	const apply = (editor: Editor, ...ops: RefineOp[]) =>
		applyRefineOps(editor, ops);

	it("inserts a new asset after the others and ahead of the scenes", () => {
		const editor = makeCanvas([asset("asset_style", "noir")]);

		const result = apply(editor, {
			op: "insert",
			type: "asset_character",
			attrs: { name: "Mia" },
			text: "a girl in a yellow cardigan",
		});

		expect(result).toEqual({ applied: 1, failures: [] });
		expect(topLevelTypes(editor)).toEqual([
			"asset_style",
			"asset_character",
			"scene",
		]);
		expect(describeAssets(editor)[1]).toEqual([
			"asset_character:Mia",
			expect.objectContaining({ name: "Mia" }),
			"a girl in a yellow cardigan",
		]);
	});

	it("rewrites the character already under that name, voice and all", () => {
		const editor = makeCanvas([
			asset("asset_character", "a girl", { name: "Mia", age: "child" }),
			asset("asset_character", "a boy", { name: "Kai" }),
		]);

		apply(
			editor,
			{
				op: "insert",
				type: "asset_character",
				attrs: { name: "Mia", pitch: "high" },
				text: "a girl in a yellow cardigan",
			},
			{
				op: "insert",
				type: "asset_character",
				attrs: { name: "Lumi", pitch: "low" },
				text: "a grey rabbit",
			},
		);

		expect(describeAssets(editor)).toEqual([
			[
				"asset_character:Mia",
				{ ...CAST, name: "Mia", age: "child", pitch: "high" },
				"a girl in a yellow cardigan",
			],
			["asset_character:Kai", { ...CAST, name: "Kai" }, "a boy"],
			[
				"asset_character:Lumi",
				{ ...CAST, name: "Lumi", pitch: "low" },
				"a grey rabbit",
			],
		]);
	});

	it("keeps one style, one narrator and one references element", () => {
		const editor = makeCanvas([
			asset("asset_style", "noir"),
			asset("asset_references", "", { images: "a.png" }),
		]);

		apply(
			editor,
			{ op: "insert", type: "asset_style", text: "muted watercolor" },
			{
				op: "insert",
				type: "asset_references",
				attrs: { images: "a.png,b.png" },
				text: "",
			},
			{
				op: "insert",
				type: "asset_character",
				attrs: { name: NARRATOR, age: "adult" },
				text: "",
			},
			{
				op: "insert",
				type: "asset_character",
				attrs: { name: NARRATOR, pitch: "low" },
				text: "",
			},
		);

		expect(describeAssets(editor)).toEqual([
			["asset_style", {}, "muted watercolor"],
			[
				"asset_character:Narrator",
				{ ...CAST, ...NO_AVATAR, name: NARRATOR, age: "adult", pitch: "low" },
				"",
			],
			["asset_references", { images: "a.png,b.png" }, ""],
		]);
	});

	it("sets an asset's text and attributes by its id", () => {
		const editor = makeCanvas([
			asset("asset_character", "a girl", {
				name: "Mia",
				age: "child",
				pitch: "high",
			}),
		]);

		const result = apply(
			editor,
			{ op: "set", id: "asset_character:Mia", text: "a girl with a red scarf" },
			{
				op: "set",
				id: "asset_character:Mia",
				attrs: { age: "adult", pitch: null },
			},
		);

		expect(result).toEqual({ applied: 2, failures: [] });
		expect(describeAssets(editor)).toEqual([
			[
				"asset_character:Mia",
				{ ...CAST, name: "Mia", age: "adult" },
				"a girl with a red scarf",
			],
		]);
	});

	it("refuses to retype an asset, and says why", () => {
		const editor = makeCanvas([asset("asset_style", "noir")]);

		expect(
			apply(editor, {
				op: "set",
				id: "asset_style",
				type: "narration",
				text: "x",
			}),
		).toEqual({
			applied: 0,
			failures: ['set: asset "asset_style" keeps its type'],
		});
		expect(describeAssets(editor)).toEqual([["asset_style", {}, "noir"]]);
	});

	it("removes only the character, leaving every list that names them", () => {
		const editor = makeCanvas(
			[
				asset("asset_character", "a girl", { name: "Mia" }),
				asset("asset_character", "a boy", { name: "Kai" }),
			],
			[
				content("image", "both", "a park", { characters: "Mia,Kai" }),
				content("image", "alone", "a swing", { characters: "Mia" }),
			],
		);

		expect(apply(editor, { op: "remove", id: "asset_character:Mia" })).toEqual({
			applied: 1,
			failures: [],
		});
		expect(describeAssets(editor).map(([id]) => id)).toEqual([
			"asset_character:Kai",
		]);
		expect(flatAttributes(getNode(editor, "both")).characters).toBe("Mia,Kai");
		expect(flatAttributes(getNode(editor, "alone")).characters).toBe("Mia");
	});

	it("prepends an unanchored element to the first scene, past the assets", () => {
		const editor = makeCanvas([
			asset("asset_style", "noir"),
			asset("asset_character", "a girl", { name: "Mia" }),
		]);

		apply(editor, {
			op: "insert",
			position: "before",
			type: "sound",
			text: "rain",
		});

		expect(topLevelTypes(editor)).toEqual([
			"asset_style",
			"asset_character",
			"scene",
		]);
		const [, , first] = editor.children;
		expect(
			Element.isElement(first) &&
				first.children.map((child) => "type" in child && child.type),
		).toEqual(["sound", "narration"]);
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
