import { describe, expect, it } from "vitest";
import { createEditor, Editor } from "slate";
import type { CanvasContentElement, SceneElement } from "@/lib/canvas/types";
import { ZERO_WIDTH_SPACE } from "../constants";
import {
	applyNodeVersion,
	clearEditor,
	duplicateNode,
	findElementById,
	findNodeById,
	updateNodeText,
	replaceGenerationAttrs,
	mergeAttrs,
} from "../editorOps";
import {
	flatAttributes,
	splitAttributes,
} from "@/lib/canvas/elementAttributes";
import { isAssetElement } from "../guards";
import { asset } from "./_assets";

/** Mirrors `createCanvasNode`: a caret marker leaf, then the body. */
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
			{ id: `${id}-m`, type, text: ZERO_WIDTH_SPACE },
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

describe("findNodeById", () => {
	it("finds a content element by id", () => {
		const editor = makeEditor([
			scene([content("narration", "n1"), content("image", "img1")]),
		]);

		const entry = findNodeById(editor, "img1");
		expect(entry).not.toBeNull();
		expect((entry?.[0] as CanvasContentElement).id).toBe("img1");
		expect(entry?.[1]).toEqual([0, 1]);
	});

	it("returns null for nonexistent id", () => {
		const editor = makeEditor([scene([content("narration", "n1")])]);
		expect(findNodeById(editor, "nope")).toBeNull();
	});

	it("does not match scene elements", () => {
		const editor = makeEditor([scene([content("narration", "n1")], "s1")]);
		expect(findNodeById(editor, "s1")).toBeNull();
	});
});

describe("writes by id", () => {
	it("land on the element wherever it is, asset or scene", () => {
		const editor = createEditor();
		editor.children = [
			asset("style"),
			asset("cast", { name: "Mia" }),
			scene([content("narration", "n1"), content("image", "img1")]),
		];

		mergeAttrs(editor, "img1", { style: "ink" });
		mergeAttrs(editor, "cast:Mia", { age: "child" });

		expect(findNodeById(editor, "img1")?.[0].generationAttributes).toEqual({
			style: "ink",
		});
		expect(findNodeById(editor, "cast:Mia")).toMatchObject([
			{ generationAttributes: { name: "Mia", age: "child" } },
			[1],
		]);
	});

	it("throw for an element that is not on the canvas, and change nothing", () => {
		const editor = makeEditor([scene([content("narration", "n1")])]);
		const before = JSON.stringify(editor.children);

		expect(() => mergeAttrs(editor, "gone", { style: "ink" })).toThrow(
			/"gone" is not on the canvas/,
		);
		expect(() => updateNodeText(editor, "style", "ink")).toThrow(
			/"style" is not on the canvas/,
		);
		expect(JSON.stringify(editor.children)).toBe(before);
	});
});

describe("findElementById", () => {
	it("finds a content element by id", () => {
		const editor = makeEditor([
			scene([content("narration", "n1"), content("image", "img1")]),
		]);
		expect(findElementById(editor, "img1")?.[1]).toEqual([0, 1]);
	});

	it("finds a scene by id", () => {
		const editor = makeEditor([
			scene([content("narration", "n1")], "s1"),
			scene([content("image", "img1")], "s2"),
		]);
		expect(findElementById(editor, "s2")?.[1]).toEqual([1]);
	});

	it("does not match text leaves", () => {
		const editor = makeEditor([scene([content("narration", "n1")])]);
		expect(findElementById(editor, "n1-t")).toBeNull();
	});

	it("returns null for nonexistent id", () => {
		const editor = makeEditor([scene([content("narration", "n1")])]);
		expect(findElementById(editor, "nope")).toBeNull();
	});
});

describe("updateNodeText", () => {
	it("no-ops when text is identical", () => {
		const editor = makeEditor([scene([content("narration", "n1", "hello")])]);
		const before = JSON.stringify(editor.children);
		updateNodeText(editor, "n1", "hello");
		expect(JSON.stringify(editor.children)).toBe(before);
	});

	it("appends diff when new text is a prefix extension", () => {
		const editor = makeEditor([scene([content("narration", "n1", "hel")])]);
		updateNodeText(editor, "n1", "hello world");
		expect(Editor.string(editor, [0, 0])).toBe(
			`${ZERO_WIDTH_SPACE}hello world`,
		);
	});

	it("replaces full text when not a prefix extension", () => {
		const editor = makeEditor([
			scene([content("narration", "n1", "old text")]),
		]);
		updateNodeText(editor, "n1", "new text");
		expect(Editor.string(editor, [0, 0])).toBe(`${ZERO_WIDTH_SPACE}new text`);
	});

	it("no-ops when the caller re-sends text that carries the marker", () => {
		const editor = makeEditor([scene([content("narration", "n1", "hello")])]);
		const before = JSON.stringify(editor.children);
		updateNodeText(editor, "n1", `${ZERO_WIDTH_SPACE}hello`);
		expect(JSON.stringify(editor.children)).toBe(before);
	});

	it("leaves the marker in place when the text is cleared", () => {
		const editor = makeEditor([scene([content("narration", "n1", "hello")])]);
		updateNodeText(editor, "n1", "");
		expect(Editor.string(editor, [0, 0])).toBe(ZERO_WIDTH_SPACE);
	});

	it("restores the marker on an element that lost it", () => {
		const stripped: CanvasContentElement = {
			id: "n1",
			type: "narration",
			children: [{ id: "n1-t", type: "narration", text: "hello" }],
		};
		const editor = makeEditor([scene([stripped])]);
		updateNodeText(editor, "n1", "hello there");
		expect(Editor.string(editor, [0, 0])).toBe(
			`${ZERO_WIDTH_SPACE}hello there`,
		);
	});
});

describe("updateNodeText on an asset", () => {
	// Assets are void on the canvas, which a plain text edit would skip.
	it("rewrites a void asset's text", () => {
		const editor = createEditor();
		editor.isVoid = (element) => isAssetElement(element);
		editor.children = [
			asset("style", { text: "ink wash" }),
			scene([content("narration", "n1")]),
		];

		updateNodeText(editor, "style", "oil paint");
		expect(Editor.string(editor, [0], { voids: true })).toBe(
			`${ZERO_WIDTH_SPACE}oil paint`,
		);

		updateNodeText(editor, "style", "oil paint, thick");
		expect(Editor.string(editor, [0], { voids: true })).toBe(
			`${ZERO_WIDTH_SPACE}oil paint, thick`,
		);
	});
});

describe("duplicateNode", () => {
	it("inserts the copy directly after the original", () => {
		const editor = makeEditor([
			scene([
				content("narration", "n1", "hello"),
				content("image", "img1", "a cat"),
			]),
		]);

		const copyId = duplicateNode(
			editor,
			content("narration", "n1", "hello"),
			[0, 0],
		);

		const children = (editor.children[0] as SceneElement).children;
		expect(children.map((c) => c.id)).toEqual(["n1", copyId, "img1"]);
		expect(Editor.string(editor, [0, 1])).toBe(Editor.string(editor, [0, 0]));
	});

	it("gives the copy and its leaves fresh ids, keeping the attributes", () => {
		const el = content("character", "c1", "line", { name: "Lyra" });
		const editor = makeEditor([scene([el])]);

		const copyId = duplicateNode(editor, el, [0, 0]);

		const copy = (editor.children[0] as SceneElement).children[1];
		expect(copyId).not.toBe("c1");
		expect(flatAttributes(copy)).toEqual({ name: "Lyra" });
		expect(copy.children.map((leaf) => leaf.id)).not.toContain("c1-t");
		expect(new Set(copy.children.map((leaf) => leaf.id)).size).toBe(2);
	});
});

describe("replaceGenerationAttrs", () => {
	it("drops attributes the new set does not carry", () => {
		const el = content("image", "n1", "", { style: "ink", ratio: "16:9" });
		const editor = makeEditor([scene([el])]);

		replaceGenerationAttrs(editor, [0, 0], { style: "oil" });

		const node = editor.children[0] as SceneElement;
		expect(node.children[0].generationAttributes).toEqual({ style: "oil" });
	});

	it("leaves the element's layout attributes untouched", () => {
		const el = content("image", "n1", "", { style: "ink", motion: "pan" });
		const editor = makeEditor([scene([el])]);

		replaceGenerationAttrs(editor, [0, 0], { style: "oil" });

		const node = editor.children[0] as SceneElement;
		expect(node.children[0].layoutAttributes).toEqual({ motion: "pan" });
	});

	it("stringifies numeric values", () => {
		const el = content("image", "n1");
		const editor = makeEditor([scene([el])]);

		replaceGenerationAttrs(editor, [0, 0], { seed: 7 });

		const node = editor.children[0] as SceneElement;
		expect(node.children[0].generationAttributes).toEqual({ seed: "7" });
	});
});

describe("mergeAttrs", () => {
	it("merges new attrs into existing", () => {
		const el = content("character", "n1", "", { name: "Lyra" });
		const editor = makeEditor([scene([el])]);

		mergeAttrs(editor, "n1", { emotion: "excited" });

		const node = editor.children[0] as SceneElement;
		expect(flatAttributes(node.children[0])).toEqual({
			name: "Lyra",
			emotion: "excited",
		});
	});

	it("removes attrs set to null", () => {
		const el = content("character", "n1", "", {
			name: "Lyra",
			emotion: "excited",
		});
		const editor = makeEditor([scene([el])]);

		mergeAttrs(editor, "n1", { emotion: null });

		const node = editor.children[0] as SceneElement;
		expect(flatAttributes(node.children[0])).toEqual({ name: "Lyra" });
	});

	it("handles element with no existing customAttributes", () => {
		const el = content("narration", "n1");
		const editor = makeEditor([scene([el])]);

		mergeAttrs(editor, "n1", { emotion: "calm" });

		const node = editor.children[0] as SceneElement;
		expect(flatAttributes(node.children[0])).toEqual({ emotion: "calm" });
	});
});

describe("clearEditor", () => {
	it("empties the script so a new one does not stack under it, keeping the assets", () => {
		const style = asset("style", { text: "ink wash" });
		const cast = asset("cast", { name: "Mia" });
		const editor = createEditor();
		editor.children = [
			style,
			cast,
			scene([content("narration", "n1", "old")], "s1"),
			scene([content("image", "i1")], "s2"),
		];

		clearEditor(editor);

		expect(editor.children).toEqual([style, cast]);
	});
});

describe("applyNodeVersion", () => {
	const version = (
		elementType: CanvasContentElement["type"] | undefined,
		attributes: Record<string, string>,
		prompt: string,
	) => ({
		elementType,
		inputs: { prompt, attributes, dependencies: {}, reads: {} },
	});

	// A video restored to an image version it once was goes back to being an
	// image, without the start frame the video alone had.
	it("restores the type the version was generated as", () => {
		const el = content("video", "n1", "a fox", {
			style: "ink",
			startFrame: "img0",
		});
		const editor = makeEditor([scene([el])]);

		applyNodeVersion(editor, "n1", version("image", { style: "ink" }, "a fox"));

		const node = (editor.children[0] as SceneElement).children[0];
		expect(node.type).toBe("image");
		expect(node.generationAttributes).toEqual({ style: "ink" });
	});

	it("restores the prompt the version was generated from", () => {
		const el = content("image", "n1", "a fox");
		const editor = makeEditor([scene([el])]);

		applyNodeVersion(editor, "n1", version("image", {}, "a wolf"));

		expect(Editor.string(editor, [0, 0])).toBe(`${ZERO_WIDTH_SPACE}a wolf`);
	});

	it("leaves the type alone for a version stored without one", () => {
		const el = content("video", "n1", "a fox", { style: "ink" });
		const editor = makeEditor([scene([el])]);

		applyNodeVersion(
			editor,
			"n1",
			version(undefined, { style: "oil" }, "a fox"),
		);

		const node = (editor.children[0] as SceneElement).children[0];
		expect(node.type).toBe("video");
		expect(node.generationAttributes).toEqual({ style: "oil" });
	});
});
