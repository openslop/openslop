import { describe, expect, it } from "vitest";
import { createEditor, Editor, Element } from "slate";
import type { CanvasContentElement, SceneElement } from "@/lib/canvas/types";
import { cloneNode, revertPreview } from "../revertPreview";

function content(
	type: CanvasContentElement["type"],
	id: string,
	text = "",
): CanvasContentElement {
	return { id, type, children: [{ id: `${id}-t`, type, text }] };
}

function scene(children: CanvasContentElement[], id = "s1"): SceneElement {
	return { id, type: "scene", children };
}

function makeEditor(children: CanvasContentElement[]) {
	const editor = createEditor();
	editor.children = [scene(children)];
	return editor;
}

function texts(editor: Editor): Record<string, string> {
	const out: Record<string, string> = {};
	for (const [node] of Editor.nodes<CanvasContentElement>(editor, {
		at: [],
		match: (n) => Element.isElement(n) && n.type !== "scene",
	})) {
		out[node.id] = node.children.map((c) => c.text).join("");
	}
	return out;
}

describe("revertPreview", () => {
	it("removes added nodes and restores modified nodes from snapshot", () => {
		// Snapshot taken before the preview ran.
		const snapshot = [
			{ id: "n2", node: cloneNode(content("narration", "n2", "world")) },
		];
		// Post-preview state: n2 modified, a1 added.
		const editor = makeEditor([
			content("narration", "n1", "hello"),
			content("narration", "n2", "WORLD (edited)"),
			content("sound", "a1", "rain"),
		]);

		revertPreview(editor, ["a1"], snapshot);

		const result = texts(editor);
		expect(result["a1"]).toBeUndefined(); // added node removed
		expect(result["n2"]).toBe("world"); // modified node restored from snapshot
		expect(result["n1"]).toBe("hello"); // untouched
	});

	it("preserves a manual edit made to another node during the preview", () => {
		const snapshot = [
			{ id: "n2", node: cloneNode(content("narration", "n2", "world")) },
		];
		// Post-preview: the agent edited n2, and the user manually edited n3.
		const editor = makeEditor([
			content("narration", "n1", "hello"),
			content("narration", "n2", "WORLD (agent)"),
			content("narration", "n3", "foo (my manual edit)"),
		]);

		revertPreview(editor, [], snapshot);

		const result = texts(editor);
		expect(result["n2"]).toBe("world"); // agent edit reverted
		expect(result["n3"]).toBe("foo (my manual edit)"); // manual edit survives
	});

	it("is a no-op for ids that no longer exist", () => {
		const editor = makeEditor([content("narration", "n1", "hello")]);
		expect(() =>
			revertPreview(
				editor,
				["gone"],
				[{ id: "missing", node: content("sound", "missing") }],
			),
		).not.toThrow();
		expect(texts(editor)).toEqual({ n1: "hello" });
	});
});
