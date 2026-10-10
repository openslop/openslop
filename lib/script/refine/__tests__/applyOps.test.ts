import { describe, expect, it, vi } from "vitest";
import { Editor, Element } from "slate";
import type { AssetElement, ContentElement, Scene } from "@/lib/canvas/types";

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
import { getAssets, NARRATOR } from "@/lib/canvas/assets";
import { asset, label, makeEditor } from "@/lib/canvas/__tests__/_assets";
import { getPromptText } from "@/lib/generation/inputs";
import { DEFAULT_MODELS } from "@/lib/connectors/models";
import {
	flatAttributes,
	splitAttributes,
} from "@/lib/canvas/elementAttributes";

const ZWSP = "\u200B";

function content(
	type: ContentElement["type"],
	id: string,
	text = "",
	customAttributes?: Record<string, string>,
): ContentElement {
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

function scene(children: ContentElement[], id = "s1"): Scene {
	return { id, type: "scene", children };
}

function getContentIds(editor: Editor): string[] {
	const ids: string[] = [];
	for (const [node] of Editor.nodes(editor, {
		at: [],
		match: (n) => Element.isElement(n) && n.type !== "scene",
	})) {
		ids.push((node as ContentElement).id);
	}
	return ids;
}

function getNode(editor: Editor, id: string): ContentElement {
	const [node] = Editor.nodes(editor, {
		at: [],
		match: (n) => Element.isElement(n) && n.id === id,
	});
	return node[0] as ContentElement;
}

function getContentTexts(editor: Editor): string[] {
	const texts: string[] = [];
	for (const [node] of Editor.nodes(editor, {
		at: [],
		match: (n) => Element.isElement(n) && n.type !== "scene",
	})) {
		const el = node as ContentElement;
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
			reason: 'insert: no element "nonexistent" to anchor on',
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

		const nodes: ContentElement[] = [];
		for (const [node] of Editor.nodes(editor, {
			at: [],
			match: (n) => Element.isElement(n) && n.type === "sound",
		})) {
			nodes.push(node as ContentElement);
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
	const LOOK = DEFAULT_MODELS.image;
	const VOICE = DEFAULT_MODELS.tts;

	const describeAssets = (editor: Editor) =>
		getAssets(editor.children).map((asset) => [
			label(asset),
			asset.generationAttributes ?? {},
			getPromptText(asset),
		]);

	const makeCanvas = (
		assets: AssetElement[],
		children: ContentElement[] = [content("narration", "n1", "hello")],
	) => {
		const editor = makeEditor([scene(children)]);
		editor.children = [...assets, ...editor.children];
		return editor;
	};

	const topLevelTypes = (editor: Editor) =>
		editor.children.map((node) => "type" in node && node.type);

	const apply = (editor: Editor, ...ops: RefineOp[]) =>
		applyRefineOps(editor, ops);

	it("inserts a new asset at the top, ahead of the scenes", () => {
		const editor = makeCanvas([asset("asset_style", { text: "noir" })]);

		const result = apply(editor, {
			op: "insert",
			type: "asset_avatar",
			attrs: { name: "Mia" },
			text: "a girl in a yellow cardigan",
		});

		expect(result).toEqual({ applied: 1, failures: [] });
		expect(topLevelTypes(editor)).toEqual([
			"asset_avatar",
			"asset_style",
			"scene",
		]);
		expect(describeAssets(editor)[0]).toEqual([
			"asset_avatar:Mia",
			expect.objectContaining({ name: "Mia" }),
			"a girl in a yellow cardigan",
		]);
	});

	it("rewrites the asset already under that type and name, keeping one of each", () => {
		const editor = makeCanvas([
			asset("asset_style", { text: "noir" }),
			asset("asset_references", { attrs: { images: "a.png" } }),
			asset("asset_avatar", { name: "Mia", text: "a girl" }),
			asset("asset_voice", { name: "Mia", attrs: { age: "child" } }),
			asset("asset_avatar", { name: "Kai", text: "a boy" }),
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
				type: "asset_avatar",
				attrs: { name: "Mia" },
				text: "a girl in a yellow cardigan",
			},
			{
				op: "insert",
				type: "asset_voice",
				attrs: { name: "Mia", pitch: "high" },
				text: "",
			},
			{
				op: "insert",
				type: "asset_voice",
				attrs: { name: NARRATOR, age: "adult" },
				text: "",
			},
			{
				op: "insert",
				type: "asset_voice",
				attrs: { name: NARRATOR, pitch: "low" },
				text: "",
			},
		);

		expect(describeAssets(editor)).toEqual([
			[
				"asset_voice:Narrator",
				{ ...VOICE, name: NARRATOR, age: "adult", pitch: "low" },
				"",
			],
			["asset_style", {}, "muted watercolor"],
			["asset_references", { images: "a.png,b.png" }, ""],
			[
				"asset_avatar:Mia",
				{ ...LOOK, name: "Mia" },
				"a girl in a yellow cardigan",
			],
			[
				"asset_voice:Mia",
				{ ...VOICE, name: "Mia", age: "child", pitch: "high" },
				"",
			],
			["asset_avatar:Kai", { ...LOOK, name: "Kai" }, "a boy"],
		]);
	});

	it("sets an asset's text and attributes by its id", () => {
		const avatar = asset("asset_avatar", { name: "Mia", text: "a girl" });
		const voice = asset("asset_voice", {
			name: "Mia",
			attrs: { age: "child", pitch: "high" },
		});
		const editor = makeCanvas([avatar, voice]);

		const result = apply(
			editor,
			{ op: "set", id: avatar.id, text: "a girl with a red scarf" },
			{
				op: "set",
				id: voice.id,
				attrs: { age: "adult", pitch: null },
			},
		);

		expect(result).toEqual({ applied: 2, failures: [] });
		expect(describeAssets(editor)).toEqual([
			["asset_avatar:Mia", { ...LOOK, name: "Mia" }, "a girl with a red scarf"],
			["asset_voice:Mia", { ...VOICE, name: "Mia", age: "adult" }, ""],
		]);
	});

	it("keeps an asset's description when an insert rewrites it with no text", () => {
		const editor = makeCanvas([
			asset("asset_avatar", { name: "Mia", text: "a girl" }),
		]);

		apply(editor, {
			op: "insert",
			type: "asset_avatar",
			attrs: { name: "Mia" },
			text: "",
		});

		expect(describeAssets(editor)[0]?.[2]).toBe("a girl");
	});

	it("refuses to rename an asset, and says to remove and insert it instead", () => {
		const voice = asset("asset_voice", {
			name: "Mia",
			attrs: { age: "child" },
		});
		const editor = makeCanvas([voice]);

		expect(
			apply(editor, {
				op: "set",
				id: voice.id,
				attrs: { name: "Lumi" },
			}).failures,
		).toEqual([
			`set: an asset's name never changes; remove "${voice.id}" and insert it again`,
		]);
	});

	it("refuses to anchor a script element on an asset", () => {
		const style = asset("asset_style", { text: "noir" });
		const editor = makeCanvas([style]);

		expect(
			apply(editor, {
				op: "insert",
				anchor_id: style.id,
				type: "sound",
				text: "rain",
			}).failures,
		).toEqual([`insert: no element "${style.id}" to anchor on`]);
		expect(topLevelTypes(editor)).toEqual(["asset_style", "scene"]);
	});

	it("refuses to retype an asset, and says why", () => {
		const style = asset("asset_style", { text: "noir" });
		const editor = makeCanvas([style]);

		expect(
			apply(editor, {
				op: "set",
				id: style.id,
				type: "narration",
				text: "x",
			}),
		).toEqual({
			applied: 0,
			failures: [`set: asset "${style.id}" keeps its type`],
		});
		expect(describeAssets(editor)).toEqual([["asset_style", {}, "noir"]]);
	});

	it("removes only the avatar, leaving their voice and every list that names them", () => {
		const mia = asset("asset_avatar", { name: "Mia", text: "a girl" });
		const editor = makeCanvas(
			[
				mia,
				asset("asset_voice", { name: "Mia" }),
				asset("asset_avatar", { name: "Kai", text: "a boy" }),
			],
			[
				content("image", "both", "a park", { characters: "Mia,Kai" }),
				content("image", "alone", "a swing", { characters: "Mia" }),
			],
		);

		expect(apply(editor, { op: "remove", id: mia.id })).toEqual({
			applied: 1,
			failures: [],
		});
		expect(describeAssets(editor).map(([id]) => id)).toEqual([
			"asset_voice:Mia",
			"asset_avatar:Kai",
		]);
		expect(flatAttributes(getNode(editor, "both")).characters).toBe("Mia,Kai");
		expect(flatAttributes(getNode(editor, "alone")).characters).toBe("Mia");
	});

	it("prepends an unanchored element to the first scene, past the assets", () => {
		const editor = makeCanvas([
			asset("asset_style", { text: "noir" }),
			asset("asset_avatar", { name: "Mia", text: "a girl" }),
		]);

		apply(editor, {
			op: "insert",
			position: "before",
			type: "sound",
			text: "rain",
		});

		expect(topLevelTypes(editor)).toEqual([
			"asset_style",
			"asset_avatar",
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
