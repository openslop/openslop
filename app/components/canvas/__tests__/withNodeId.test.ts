import { describe, expect, it } from "vitest";
import { createEditor, Transforms, Element, Editor, Node } from "slate";
import { withReact } from "slate-react";
import { withHistory } from "slate-history";
import { withNodeId } from "../plugins/withNodeId";

function makeEditor(
	children: Element[] = [
		{
			id: "root",
			type: "narration",
			children: [{ id: "t0", type: "narration", text: "Hello" }],
		},
	],
) {
	const editor = withHistory(createEditor());
	withNodeId(withReact(editor));
	editor.children = children;
	return editor;
}

describe("withNodeId", () => {
	describe("insert_node", () => {
		it("assigns an ID to an inserted element", () => {
			const editor = makeEditor();
			const node = {
				type: "image" as const,
				children: [{ type: "image" as const, text: "test" }],
			} as Element;

			Transforms.insertNodes(editor, node, { at: [1] });

			const inserted = editor.children[1] as Element;
			expect(inserted.id).toBeDefined();
			expect(inserted.id).toHaveLength(16);
		});

		it("preserves an existing ID", () => {
			const editor = makeEditor();
			const node = {
				id: "keep-me",
				type: "character" as const,
				children: [{ id: "ct", type: "character" as const, text: "line" }],
			} as Element;

			Transforms.insertNodes(editor, node, { at: [1] });

			const inserted = editor.children[1] as Element;
			expect(inserted.id).toBe("keep-me");
		});
	});

	describe("split_node", () => {
		it("produces a new, different ID for the split node", () => {
			const editor = makeEditor();
			// Place cursor in middle of "Hello"
			Transforms.select(editor, { path: [0, 0], offset: 2 });
			Editor.normalize(editor, { force: true });
			Transforms.splitNodes(editor);

			const first = editor.children[0] as Element;
			const second = editor.children[1] as Element;
			expect(first.id).toBeDefined();
			expect(second.id).toBeDefined();
			expect(first.id).not.toBe(second.id);
		});
	});

	describe("insertFragment (paste)", () => {
		it("assigns fresh IDs to pasted fragment nodes", () => {
			const editor = makeEditor();
			Transforms.select(editor, Editor.end(editor, []));

			const originalId = "original-id";
			const fragment = [
				{
					id: originalId,
					type: "music" as const,
					children: [
						{ id: "orig-child", type: "music" as const, text: "pasted" },
					],
				},
			];

			editor.insertFragment(fragment);

			const hasOriginalId = editor.children.some(
				(n) => (n as Element).id === originalId,
			);
			expect(hasOriginalId).toBe(false);
		});
	});
});

describe("history replay", () => {
	it("keeps the split-off ids across undo + redo", () => {
		const editor = makeEditor();
		Transforms.select(editor, { path: [0, 0], offset: 2 });
		Transforms.splitNodes(editor);
		const secondId = Node.get(editor, [1]).id;
		const secondTextId = Node.get(editor, [1, 0]).id;

		editor.undo();
		editor.redo();

		expect(Node.get(editor, [1]).id).toBe(secondId);
		expect(Node.get(editor, [1, 0]).id).toBe(secondTextId);
	});

	it("restores the merged-away id on undo", () => {
		const editor = makeEditor([
			{
				id: "a",
				type: "narration",
				children: [{ id: "a-t", type: "narration", text: "Foo" }],
			},
			{
				id: "b",
				type: "narration",
				children: [{ id: "b-t", type: "narration", text: "Bar" }],
			},
		]);
		Transforms.mergeNodes(editor, { at: [1] });

		editor.undo();

		expect(Node.get(editor, [1]).id).toBe("b");
	});
});
