import { describe, expect, it, vi } from "vitest";
import { createEditor, Transforms } from "slate";
import type { CanvasEditor } from "@/lib/canvas/types";
import { withDocumentSignal } from "../plugins/withDocumentSignal";

const SCENE = {
	id: "scene-1",
	type: "scene" as const,
	children: [
		{
			id: "el-1",
			type: "image" as const,
			children: [{ id: "text-1", type: "image" as const, text: "a" }],
		},
	],
};

function editorWithScene() {
	const editor = withDocumentSignal(createEditor() as CanvasEditor);
	Transforms.insertNodes(editor, SCENE, { at: [0] });
	editor.onChange();
	return editor;
}

describe("withDocumentSignal", () => {
	it("notifies subscribers when the document changes", () => {
		const editor = editorWithScene();
		const listener = vi.fn();
		editor.subscribeToDocument(listener);

		Transforms.insertText(editor, "b", { at: { path: [0, 0, 0], offset: 1 } });
		editor.onChange();

		expect(listener).toHaveBeenCalledTimes(1);
	});

	it("stays quiet when only the selection moves", () => {
		const editor = editorWithScene();
		const listener = vi.fn();
		editor.subscribeToDocument(listener);

		Transforms.select(editor, { path: [0, 0, 0], offset: 0 });
		editor.onChange();

		expect(listener).not.toHaveBeenCalled();
	});

	it("stops notifying once unsubscribed", () => {
		const editor = editorWithScene();
		const listener = vi.fn();
		const unsubscribe = editor.subscribeToDocument(listener);
		unsubscribe();

		Transforms.insertText(editor, "b", { at: { path: [0, 0, 0], offset: 1 } });
		editor.onChange();

		expect(listener).not.toHaveBeenCalled();
	});

	it("keeps the wrapped onChange running", () => {
		const editor = createEditor() as CanvasEditor;
		const onChange = vi.fn();
		editor.onChange = onChange;

		withDocumentSignal(editor).onChange();

		expect(onChange).toHaveBeenCalledTimes(1);
	});
});
