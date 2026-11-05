import { describe, expect, it } from "vitest";
import { Editor } from "slate";
import type {
	AssetElement,
	CanvasElement,
	ContentElement,
	Scene,
} from "@/lib/canvas/types";

import { applyRefineOp, applyRefineOps } from "../apply-ops";
import type { RefineOp } from "../types";
import { getAssets, NARRATOR } from "@/lib/canvas/assets";
import { findElementById } from "@/lib/canvas/editor-ops";
import { isContentElement } from "@/lib/canvas/guards";
import { asset, label, makeEditor } from "@/lib/canvas/__tests__/_assets";
import { getPromptText } from "@/lib/generation/inputs";
import { DEFAULT_MODELS } from "@/lib/connectors/models";
import { videoAttributesFor } from "@/lib/connectors/video/attributes";
import {
	flatAttributes,
	splitAttributes,
} from "@/lib/canvas/element-attributes";

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

const contentElements = (editor: Editor): ContentElement[] =>
	Array.from(
		Editor.nodes(editor, { at: [], match: isContentElement }),
		([node]) => node,
	);

const getContentIds = (editor: Editor) =>
	contentElements(editor).map(({ id }) => id);

const getContentTexts = (editor: Editor) =>
	contentElements(editor).map(getPromptText);

function getNode(editor: Editor, id: string): CanvasElement {
	const entry = findElementById(editor, id);
	if (!entry) throw new Error(`no element "${id}"`);
	return entry[0];
}

describe("applyRefineOp — insert", () => {
	it("appends to end when no anchor_id", () => {
		const editor = makeEditor([scene([content("narration", "n1", "hello")])]);

		applyRefineOp(editor, {
			op: "insert",
			elements: [{ type: "sound", text: "rain" }],
		});

		expect(getContentTexts(editor)).toEqual(["hello", "rain"]);
	});

	it("inserts after an anchored element", () => {
		const editor = makeEditor([
			scene([
				content("narration", "n1", "first"),
				content("narration", "n2", "second"),
			]),
		]);

		applyRefineOp(editor, {
			op: "insert",
			anchor_id: "n1",
			elements: [{ type: "sound", text: "rain" }],
		});

		const texts = getContentTexts(editor);
		expect(texts).toEqual(["first", "rain", "second"]);
	});

	it("inserts before an anchored element", () => {
		const editor = makeEditor([scene([content("narration", "n1", "first")])]);

		applyRefineOp(editor, {
			op: "insert",
			anchor_id: "n1",
			position: "before",
			elements: [{ type: "sound", text: "rain" }],
		});

		const texts = getContentTexts(editor);
		expect(texts).toEqual(["rain", "first"]);
	});

	it.each([
		["after", ["first", "A", "B", "C", "last"]],
		["before", ["A", "B", "C", "first", "last"]],
	] as const)(
		"places an insert's elements %s the anchor in the order listed",
		(position, expected) => {
			const editor = makeEditor([
				scene([
					content("narration", "n1", "first"),
					content("narration", "n2", "last"),
				]),
			]);

			applyRefineOp(editor, {
				op: "insert",
				anchor_id: "n1",
				position,
				elements: ["A", "B", "C"].map((text) => ({ type: "sound", text })),
			});

			expect(getContentTexts(editor)).toEqual(expected);
		},
	);

	it("inserts none of the elements when one is invalid", () => {
		const editor = makeEditor([scene([content("narration", "n1", "hello")])]);

		const result = applyRefineOp(editor, {
			op: "insert",
			anchor_id: "n1",
			elements: [
				{ type: "sound", text: "rain" },
				{ type: "narration", text: " " },
			],
		});

		expect(result).toEqual({
			ok: false,
			reason: "insert: narration needs text",
		});
		expect(getContentTexts(editor)).toEqual(["hello"]);
	});

	it("refuses an attribute value the type does not offer", () => {
		const editor = makeEditor([scene([content("narration", "n1", "hello")])]);

		const result = applyRefineOp(editor, {
			op: "insert",
			elements: [
				{ type: "sound", text: "rain", attrs: { loops: "unoffered" } },
			],
		});

		expect(result).toEqual({
			ok: false,
			reason: 'insert: sound offers no loops "unoffered"',
		});
		expect(getContentTexts(editor)).toEqual(["hello"]);
	});

	it("reports every problem across an insert's elements at once", () => {
		const editor = makeEditor([scene([content("narration", "n1", "hello")])]);

		const result = applyRefineOp(editor, {
			op: "insert",
			elements: [
				{
					type: "sound",
					text: "rain",
					attrs: { loops: "unoffered", trimStart: "unoffered" },
				},
				{ type: "narration", text: "", attrs: { emotion: "unoffered" } },
			],
		});

		expect(result).toEqual({
			ok: false,
			reason:
				'insert: sound offers no loops "unoffered", trimStart "unoffered"; narration offers no emotion "unoffered"; narration needs text',
		});
		expect(getContentTexts(editor)).toEqual(["hello"]);
	});

	it("reports a missing anchor instead of appending somewhere else", () => {
		const editor = makeEditor([scene([content("narration", "n1", "hello")])]);

		const result = applyRefineOp(editor, {
			op: "insert",
			anchor_id: "nonexistent",
			elements: [{ type: "sound", text: "rain" }],
		});

		expect(result).toEqual({
			ok: false,
			reason: 'insert: no element "nonexistent" to anchor on',
		});
		expect(getContentTexts(editor)).toEqual(["hello"]);
	});

	it.each([undefined, "", "   "])(
		"refuses a script element with no text: %j",
		(text) => {
			const editor = makeEditor([scene([content("narration", "n1", "hello")])]);

			const result = applyRefineOp(editor, {
				op: "insert",
				anchor_id: "n1",
				elements: [{ type: "narration", text }],
			});

			expect(result).toEqual({
				ok: false,
				reason: "insert: narration needs text",
			});
			expect(getContentTexts(editor)).toEqual(["hello"]);
		},
	);

	it("uses custom attrs from the op", () => {
		const editor = makeEditor([scene([content("narration", "n1")])]);

		applyRefineOp(editor, {
			op: "insert",
			elements: [{ type: "sound", text: "rain", attrs: { loops: "3" } }],
		});

		const [, sound] = contentElements(editor);
		expect(flatAttributes(sound)).toEqual({
			loops: "3",
			volume: "2",
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

		applyRefineOp(editor, { op: "remove", id: "n1" });

		expect(getContentIds(editor)).toEqual(["n2"]);
	});

	it("leaves the canvas alone when no element has the id", () => {
		const editor = makeEditor([scene([content("narration", "n1", "hello")])]);

		applyRefineOp(editor, { op: "remove", id: "nonexistent" });

		expect(getContentIds(editor)).toEqual(["n1"]);
	});
});

describe("applyRefineOp — set", () => {
	it("updates text content", () => {
		const editor = makeEditor([scene([content("narration", "n1", "old")])]);

		applyRefineOp(editor, { op: "set", id: "n1", text: "new text" });

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

		applyRefineOp(editor, {
			op: "set",
			id: "n1",
			attrs: { emotion: "excited" },
		});

		expect(flatAttributes(getNode(editor, "n1"))).toEqual({
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

		applyRefineOp(editor, { op: "set", id: "n1", attrs: { emotion: null } });

		expect(flatAttributes(getNode(editor, "n1"))).toEqual({ name: "Lyra" });
	});

	it("applies attrs and text together", () => {
		const editor = makeEditor([
			scene([content("character", "n1", "old", { name: "Lyra" })]),
		]);

		applyRefineOp(editor, {
			op: "set",
			id: "n1",
			attrs: { name: "Alice", emotion: "happy" },
			text: "Hello!",
		});

		const line = getNode(editor, "n1");
		expect(flatAttributes(line)).toEqual({ name: "Alice", emotion: "happy" });
		expect(getPromptText(line)).toBe("Hello!");
	});

	it("refuses an attribute value the type does not offer, changing nothing", () => {
		const editor = makeEditor([scene([content("narration", "n1", "hello")])]);

		const result = applyRefineOp(editor, {
			op: "set",
			id: "n1",
			attrs: { emotion: "unoffered" },
			text: "changed",
		});

		expect(result).toEqual({
			ok: false,
			reason: 'set: narration offers no emotion "unoffered"',
		});
		expect(getContentTexts(editor)).toEqual(["hello"]);
	});

	it("keeps the caret marker when text is replaced or cleared", () => {
		const editor = makeEditor([scene([content("narration", "n1", "old")])]);

		applyRefineOp(editor, { op: "set", id: "n1", text: "new" });
		expect(Editor.string(editor, [0, 0])).toBe(`${ZWSP}new`);

		applyRefineOp(editor, { op: "set", id: "n1", text: "" });
		expect(Editor.string(editor, [0, 0])).toBe(ZWSP);
	});

	it("leaves the canvas alone when no element has the id", () => {
		const editor = makeEditor([scene([content("narration", "n1", "hello")])]);

		applyRefineOp(editor, { op: "set", id: "nonexistent", text: "new" });

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

		applyRefineOp(editor, {
			op: "set",
			id: "n1",
			type: "video",
			attrs: { startFrame: "previous", motion: "kenBurnsIn" },
		});

		const video = getNode(editor, "n1");
		expect(video.type).toBe("video");
		expect(flatAttributes(video)).toEqual({
			...videoAttributesFor(DEFAULT_MODELS.video).defaultAttributes,
			...DEFAULT_MODELS.video,
			referenceImagesOverride: "https://img/red.png",
			startFrame: "previous",
			motion: "kenBurnsIn",
		});
	});

	it("puts a retyped element on the editor's default model for its new type", () => {
		const pinned = { provider: "runware", model: "Seedance 2 Fast" } as const;
		const editor = makeEditor([scene([content("image", "n1", "a wolf")])], {
			video: pinned,
		});

		applyRefineOp(editor, { op: "set", id: "n1", type: "video" });

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

		applyRefineOp(editor, {
			op: "insert",
			anchor_id: "n1",
			elements: [{ type: "sound", text: "A" }],
		});
		applyRefineOp(editor, {
			op: "insert",
			anchor_id: "n3",
			elements: [{ type: "sound", text: "B" }],
		});

		const texts = getContentTexts(editor);
		expect(texts).toEqual(["first", "A", "second", "third", "B"]);
	});

	it("multiple appends to end stack in order", () => {
		const editor = makeEditor([scene([content("narration", "n1", "first")])]);

		applyRefineOp(editor, {
			op: "insert",
			elements: [{ type: "sound", text: "A" }],
		});
		applyRefineOp(editor, {
			op: "insert",
			elements: [{ type: "sound", text: "B" }],
		});
		applyRefineOp(editor, {
			op: "insert",
			elements: [{ type: "sound", text: "C" }],
		});

		const texts = getContentTexts(editor);
		expect(texts).toEqual(["first", "A", "B", "C"]);
	});
});

describe("applyRefineOp — mixed operations", () => {
	it("handles insert then remove sequence", () => {
		const editor = makeEditor([scene([content("narration", "n1", "hello")])]);

		applyRefineOp(editor, {
			op: "insert",
			anchor_id: "n1",
			elements: [{ type: "sound", text: "rain" }],
		});
		applyRefineOp(editor, { op: "remove", id: "n1" });

		expect(getContentTexts(editor)).toEqual(["rain"]);
	});

	it("handles set then insert at same anchor", () => {
		const editor = makeEditor([
			scene([content("narration", "n1", "old text")]),
		]);

		applyRefineOp(editor, { op: "set", id: "n1", text: "new text" });
		applyRefineOp(editor, {
			op: "insert",
			anchor_id: "n1",
			elements: [{ type: "sound", text: "rain" }],
		});

		expect(getContentTexts(editor)).toEqual(["new text", "rain"]);
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
		editor.children.map((node) => node.type);

	const apply = (editor: Editor, ...ops: RefineOp[]) =>
		applyRefineOps(editor, ops);

	it("refuses a character's asset that names nobody", () => {
		const editor = makeCanvas([]);

		const result = apply(editor, {
			op: "asset",
			type: "asset_avatar",
			text: "a girl in a yellow cardigan",
		});

		expect(result).toEqual({
			applied: 0,
			failures: ["asset: asset_avatar needs a name"],
		});
		expect(topLevelTypes(editor)).toEqual(["scene"]);
	});

	it("inserts a new asset at the top, ahead of the scenes", () => {
		const editor = makeCanvas([asset("asset_style", { text: "noir" })]);

		const result = apply(editor, {
			op: "asset",
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
			{ op: "asset", type: "asset_style", text: "muted watercolor" },
			{
				op: "asset",
				type: "asset_references",
				attrs: { images: "a.png,b.png" },
				text: "",
			},
			{
				op: "asset",
				type: "asset_avatar",
				attrs: { name: "Mia" },
				text: "a girl in a yellow cardigan",
			},
			{
				op: "asset",
				type: "asset_voice",
				attrs: { name: "Mia", pitch: "high" },
				text: "",
			},
			{
				op: "asset",
				type: "asset_voice",
				attrs: { name: NARRATOR, age: "adult" },
				text: "",
			},
			{
				op: "asset",
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

	it("inserts a voice from its traits alone, with no text", () => {
		const editor = makeCanvas([]);

		const result = apply(editor, {
			op: "asset",
			type: "asset_voice",
			attrs: { name: "Mia", age: "child" },
		});

		expect(result).toEqual({ applied: 1, failures: [] });
		expect(describeAssets(editor)).toEqual([
			["asset_voice:Mia", { name: "Mia", age: "child", ...VOICE }, ""],
		]);
	});

	it("refuses a voice trait the voice schema does not offer", () => {
		const editor = makeCanvas([]);

		const result = apply(editor, {
			op: "asset",
			type: "asset_voice",
			attrs: { name: "Mia", age: "ageless" },
		});

		expect(result).toEqual({
			applied: 0,
			failures: ['asset: asset_voice offers no age "ageless"'],
		});
		expect(describeAssets(editor)).toEqual([]);
	});

	it("keeps an asset's description when an insert rewrites it with no text", () => {
		const editor = makeCanvas([
			asset("asset_avatar", { name: "Mia", text: "a girl" }),
		]);

		apply(editor, {
			op: "asset",
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
		expect(
			apply(editor, { op: "set", id: voice.id, attrs: { name: null } })
				.failures,
		).toEqual([
			`set: an asset's name never changes; remove "${voice.id}" and insert it again`,
		]);
	});

	it("lets a set repeat an asset's unchanged name", () => {
		const voice = asset("asset_voice", {
			name: "Mia",
			attrs: { age: "child" },
		});
		const editor = makeCanvas([voice]);

		const result = apply(editor, {
			op: "set",
			id: voice.id,
			attrs: { name: "Mia", age: "adult" },
		});

		expect(result).toEqual({ applied: 1, failures: [] });
		expect(describeAssets(editor)[0]?.[1]).toMatchObject({
			name: "Mia",
			age: "adult",
		});
	});

	it("refuses to anchor a script element on an asset", () => {
		const style = asset("asset_style", { text: "noir" });
		const editor = makeCanvas([style]);

		expect(
			apply(editor, {
				op: "insert",
				anchor_id: style.id,
				elements: [{ type: "sound", text: "rain" }],
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
			elements: [{ type: "sound", text: "rain" }],
		});

		expect(topLevelTypes(editor)).toEqual([
			"asset_style",
			"asset_avatar",
			"scene",
		]);
		expect(contentElements(editor).map(({ type }) => type)).toEqual([
			"sound",
			"narration",
		]);
	});
});

describe("applyRefineOps", () => {
	it("applies a turn's ops in order and counts them", () => {
		const editor = makeEditor([scene([content("narration", "n1", "hello")])]);

		const result = applyRefineOps(editor, [
			{ op: "set", id: "n1", text: "goodbye" },
			{
				op: "insert",
				anchor_id: "n1",
				elements: [{ type: "sound", text: "rain" }],
			},
		]);

		expect(result).toEqual({ applied: 2, failures: [] });
		expect(getContentTexts(editor)).toEqual(["goodbye", "rain"]);
	});

	it("keeps going past a failed op and reports why it failed", () => {
		const editor = makeEditor([scene([content("narration", "n1", "hello")])]);

		const result = applyRefineOps(editor, [
			{ op: "set", id: "gone", text: "nope" },
			{
				op: "insert",
				anchor_id: "n1",
				elements: [{ type: "sound", text: "rain" }],
			},
		]);

		expect(result.applied).toBe(1);
		expect(result.failures).toEqual(['set: no element "gone"']);
		expect(getContentTexts(editor)).toEqual(["hello", "rain"]);
	});
});
