import { describe, expect, it } from "vitest";
import { createEditor, Transforms, Element, Editor } from "slate";
import { withReact } from "slate-react";
import { withNodeId } from "../plugins/withNodeId";

function makeEditor() {
  const editor = withNodeId(withReact(createEditor()));
  editor.children = [
    {
      id: "root",
      type: "narration",
      children: [{ id: "t0", type: "narration", text: "Hello" }],
    },
  ];
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
