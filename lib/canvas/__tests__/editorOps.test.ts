import { describe, expect, it } from "vitest";
import { createEditor, Editor } from "slate";
import type { CanvasContentElement, SceneElement } from "@/lib/canvas/types";
import { ZERO_WIDTH_SPACE } from "../constants";
import {
	clearEditor,
	duplicateNode,
	findElementById,
	findNodeById,
	updateNodeText,
	setGenerationAttrs,
	setNodeAttrs,
} from "../editorOps";
import { flatAttributes, splitAttributes } from "@/lib/video/elementAttributes";

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
		updateNodeText(editor, [0, 0], "hello");
		expect(JSON.stringify(editor.children)).toBe(before);
	});

	it("appends diff when new text is a prefix extension", () => {
		const editor = makeEditor([scene([content("narration", "n1", "hel")])]);
		updateNodeText(editor, [0, 0], "hello world");
		expect(Editor.string(editor, [0, 0])).toBe(
			`${ZERO_WIDTH_SPACE}hello world`,
		);
	});

	it("replaces full text when not a prefix extension", () => {
		const editor = makeEditor([
			scene([content("narration", "n1", "old text")]),
		]);
		updateNodeText(editor, [0, 0], "new text");
		expect(Editor.string(editor, [0, 0])).toBe(`${ZERO_WIDTH_SPACE}new text`);
	});

	it("no-ops when the caller re-sends text that carries the marker", () => {
		const editor = makeEditor([scene([content("narration", "n1", "hello")])]);
		const before = JSON.stringify(editor.children);
		updateNodeText(editor, [0, 0], `${ZERO_WIDTH_SPACE}hello`);
		expect(JSON.stringify(editor.children)).toBe(before);
	});

	it("leaves the marker in place when the text is cleared", () => {
		const editor = makeEditor([scene([content("narration", "n1", "hello")])]);
		updateNodeText(editor, [0, 0], "");
		expect(Editor.string(editor, [0, 0])).toBe(ZERO_WIDTH_SPACE);
	});

	it("restores the marker on an element that lost it", () => {
		const stripped: CanvasContentElement = {
			id: "n1",
			type: "narration",
			children: [{ id: "n1-t", type: "narration", text: "hello" }],
		};
		const editor = makeEditor([scene([stripped])]);
		updateNodeText(editor, [0, 0], "hello there");
		expect(Editor.string(editor, [0, 0])).toBe(
			`${ZERO_WIDTH_SPACE}hello there`,
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

describe("setGenerationAttrs", () => {
	it("drops attributes the new set does not carry", () => {
		const el = content("image", "n1", "", { style: "ink", ratio: "16:9" });
		const editor = makeEditor([scene([el])]);

		setGenerationAttrs(editor, [0, 0], { style: "oil" });

		const node = editor.children[0] as SceneElement;
		expect(node.children[0].generationAttributes).toEqual({ style: "oil" });
	});

	it("leaves the element's layout attributes untouched", () => {
		const el = content("image", "n1", "", { style: "ink", motion: "pan" });
		const editor = makeEditor([scene([el])]);

		setGenerationAttrs(editor, [0, 0], { style: "oil" });

		const node = editor.children[0] as SceneElement;
		expect(node.children[0].layoutAttributes).toEqual({ motion: "pan" });
	});

	it("stringifies numeric values", () => {
		const el = content("image", "n1");
		const editor = makeEditor([scene([el])]);

		setGenerationAttrs(editor, [0, 0], { seed: 7 });

		const node = editor.children[0] as SceneElement;
		expect(node.children[0].generationAttributes).toEqual({ seed: "7" });
	});
});

describe("setNodeAttrs", () => {
	it("merges new attrs into existing", () => {
		const el = content("character", "n1", "", { name: "Lyra" });
		const editor = makeEditor([scene([el])]);

		setNodeAttrs(editor, [0, 0], el, { emotion: "excited" });

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

		setNodeAttrs(editor, [0, 0], el, { emotion: null });

		const node = editor.children[0] as SceneElement;
		expect(flatAttributes(node.children[0])).toEqual({ name: "Lyra" });
	});

	it("handles element with no existing customAttributes", () => {
		const el = content("narration", "n1");
		const editor = makeEditor([scene([el])]);

		setNodeAttrs(editor, [0, 0], el, { emotion: "calm" });

		const node = editor.children[0] as SceneElement;
		expect(flatAttributes(node.children[0])).toEqual({ emotion: "calm" });
	});
});

describe("clearEditor", () => {
	it("empties the document, so a new script does not stack under the old one", () => {
		const editor = createEditor();
		editor.children = [
			content("narration", "n1", "old"),
			content("image", "i1"),
		];

		clearEditor(editor);

		expect(editor.children).toEqual([]);
	});
});
