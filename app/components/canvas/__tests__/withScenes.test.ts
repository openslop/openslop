import { describe, expect, it } from "vitest";
import { createEditor, Editor, Element, Transforms } from "slate";
import { withReact } from "slate-react";
import { withScenes } from "../plugins/withScenes";
import { withNodeId } from "../plugins/withNodeId";
import { CanvasContentElement, SceneElement, SCENE_TYPE } from "../types";
import { isSceneElement } from "../utils/guards";

function makeEditor() {
  return withNodeId(withScenes(withReact(createEditor())));
}

function content(
  type: CanvasContentElement["type"],
  id: string = type,
): CanvasContentElement {
  return {
    id,
    type,
    children: [{ id: `${id}-t`, type, text: "" }],
  };
}

function scene(
  children: CanvasContentElement[],
  id: string = "s",
): SceneElement {
  return { id, type: SCENE_TYPE, children };
}

function setChildren(editor: Editor, children: Element[]) {
  Editor.withoutNormalizing(editor, () => {
    while (editor.children.length) {
      Transforms.removeNodes(editor, { at: [0] });
    }
    for (let i = 0; i < children.length; i++) {
      Transforms.insertNodes(editor, children[i], { at: [i] });
    }
  });
  Editor.normalize(editor, { force: true });
}

function shape(editor: Editor): string[][] {
  return editor.children.map((s) =>
    isSceneElement(s)
      ? s.children.map((c) => c.type)
      : [`!${(s as Element).type}`],
  );
}

describe("withScenes", () => {
  describe("invariant A: wraps non-scene root elements", () => {
    it("wraps a single foreground at root in a scene", () => {
      const editor = makeEditor();
      setChildren(editor, [content("image", "i1")]);
      expect(shape(editor)).toEqual([["image"]]);
      expect(isSceneElement(editor.children[0])).toBe(true);
    });

    it("wraps a single non-foreground at root in a scene (leading orphan)", () => {
      const editor = makeEditor();
      setChildren(editor, [content("narration", "n1")]);
      expect(shape(editor)).toEqual([["narration"]]);
      expect(isSceneElement(editor.children[0])).toBe(true);
    });

    it("absorbs a loose trailing non-foreground into the previous scene", () => {
      const editor = makeEditor();
      setChildren(editor, [
        scene([content("image", "i1")], "s1"),
        content("narration", "n1"),
      ]);
      expect(shape(editor)).toEqual([["image", "narration"]]);
    });

    it("absorbs multiple trailing loose non-foregrounds into the previous scene", () => {
      const editor = makeEditor();
      setChildren(editor, [
        scene([content("image", "i1")], "s1"),
        content("narration", "n1"),
        content("sound", "snd1"),
        content("music", "m1"),
      ]);
      expect(shape(editor)).toEqual([["image", "narration", "sound", "music"]]);
    });

    it("collapses loose [narration, image] at root into a single scene", () => {
      const editor = makeEditor();
      setChildren(editor, [content("narration", "n1"), content("image", "i1")]);
      expect(shape(editor)).toEqual([["narration", "image"]]);
    });

    it("collapses loose [narration, narration, image] at root into a single scene", () => {
      const editor = makeEditor();
      setChildren(editor, [
        content("narration", "n1"),
        content("narration", "n2"),
        content("image", "i1"),
      ]);
      expect(shape(editor)).toEqual([["narration", "narration", "image"]]);
    });
  });

  describe("invariant E: splits scenes with 2+ foregrounds", () => {
    it("splits at the second foreground", () => {
      const editor = makeEditor();
      setChildren(editor, [
        scene([content("image", "i1"), content("clip", "c1")]),
      ]);
      expect(shape(editor)).toEqual([["image"], ["clip"]]);
    });

    it("keeps overlays before the split with the prior foreground", () => {
      const editor = makeEditor();
      setChildren(editor, [
        scene([
          content("narration", "n1"),
          content("image", "i1"),
          content("character", "ch1"),
          content("clip", "c1"),
        ]),
      ]);
      expect(shape(editor)).toEqual([
        ["narration", "image", "character"],
        ["clip"],
      ]);
    });

    it("moves overlays after the second foreground into the split scene", () => {
      const editor = makeEditor();
      setChildren(editor, [
        scene([
          content("image", "i1"),
          content("clip", "c1"),
          content("sound", "snd1"),
        ]),
      ]);
      expect(shape(editor)).toEqual([["image"], ["clip", "sound"]]);
    });

    it("splits scenes with three foregrounds into three scenes", () => {
      const editor = makeEditor();
      setChildren(editor, [
        scene([
          content("image", "i1"),
          content("clip", "c1"),
          content("image", "i2"),
        ]),
      ]);
      expect(shape(editor)).toEqual([["image"], ["clip"], ["image"]]);
    });

    it("splits a nested overlay cluster correctly", () => {
      const editor = makeEditor();
      setChildren(editor, [
        scene([
          content("narration", "n1"),
          content("image", "i1"),
          content("character", "ch1"),
          content("clip", "c1"),
          content("sound", "snd1"),
          content("music", "m1"),
        ]),
      ]);
      expect(shape(editor)).toEqual([
        ["narration", "image", "character"],
        ["clip", "sound", "music"],
      ]);
    });
  });

  describe("invariant F: orphan scene merges UP into previous scene", () => {
    it("merges a trailing orphan scene up into the previous scene", () => {
      const editor = makeEditor();
      setChildren(editor, [
        scene([content("image", "i1")], "s1"),
        scene([content("sound", "snd1")], "s2"),
      ]);
      expect(shape(editor)).toEqual([["image", "sound"]]);
    });

    it("merges a trailing orphan scene with multiple overlays up", () => {
      const editor = makeEditor();
      setChildren(editor, [
        scene([content("image", "i1")], "s1"),
        scene([content("narration", "n1"), content("sound", "snd1")], "s2"),
      ]);
      expect(shape(editor)).toEqual([["image", "narration", "sound"]]);
    });

    it("leaves a solitary orphan scene when there is no previous scene", () => {
      const editor = makeEditor();
      setChildren(editor, [scene([content("narration", "n1")], "s1")]);
      expect(shape(editor)).toEqual([["narration"]]);
    });

    it("collapses a leading orphan with a foreground scene below", () => {
      const editor = makeEditor();
      setChildren(editor, [
        scene([content("narration", "n1")], "s1"),
        scene([content("image", "i1")], "s2"),
      ]);
      expect(shape(editor)).toEqual([["narration", "image"]]);
    });

    it("chains orphan merges up across multiple trailing orphans", () => {
      const editor = makeEditor();
      setChildren(editor, [
        scene([content("image", "i1")], "s1"),
        scene([content("narration", "n1")], "s2"),
        scene([content("music", "m1")], "s3"),
      ]);
      expect(shape(editor)).toEqual([["image", "narration", "music"]]);
    });
  });

  describe("invariant D: removes empty scenes", () => {
    it("removes a scene whose children array is empty on insert", () => {
      const editor = makeEditor();
      setChildren(editor, [scene([], "empty")]);
      expect(editor.children).toEqual([]);
    });

    it("removes a scene when its only content child is deleted", () => {
      const editor = makeEditor();
      setChildren(editor, [scene([content("narration", "n1")], "s1")]);
      Transforms.removeNodes(editor, { at: [0, 0] });
      expect(editor.children).toEqual([]);
    });
  });

  describe("flows: end-to-end normalization chains", () => {
    it("removing the sole foreground from a scene produces an orphan that merges UP", () => {
      const editor = makeEditor();
      setChildren(editor, [
        scene([content("image", "i1")], "s1"),
        scene([content("character", "ch1"), content("clip", "c1")], "s2"),
      ]);
      expect(shape(editor)).toEqual([["image"], ["character", "clip"]]);
      Transforms.removeNodes(editor, { at: [1, 1] });
      expect(shape(editor)).toEqual([["image", "character"]]);
    });

    it("streaming inserts collect overlays into the correct scenes", () => {
      const editor = makeEditor();
      const sequence: CanvasContentElement[] = [
        content("narration", "n1"),
        content("narration", "n2"),
        content("image", "i1"),
        content("narration", "n3"),
        content("clip", "c1"),
        content("sound", "snd1"),
      ];
      for (const node of sequence) {
        Transforms.insertNodes(editor, node, {
          at: [editor.children.length],
        });
      }
      expect(shape(editor)).toEqual([
        ["narration", "narration", "image", "narration"],
        ["clip", "sound"],
      ]);
    });

    it("split produces two scenes with distinct, non-empty ids", () => {
      const editor = makeEditor();
      setChildren(editor, [
        scene([content("image", "i1"), content("clip", "c1")], "s1"),
      ]);
      const ids = editor.children.map((n) => (n as SceneElement).id);
      expect(ids).toHaveLength(2);
      expect(ids[0]).toBeTruthy();
      expect(ids[1]).toBeTruthy();
      expect(ids[0]).not.toBe(ids[1]);
    });

    it("does not mutate scene ids during a no-op normalization", () => {
      const editor = makeEditor();
      setChildren(editor, [
        scene([content("narration", "n1"), content("image", "i1")], "s1"),
        scene([content("character", "ch1"), content("clip", "c1")], "s2"),
      ]);
      const before = editor.children.map((n) => (n as SceneElement).id);
      Editor.normalize(editor, { force: true });
      const after = editor.children.map((n) => (n as SceneElement).id);
      expect(after).toEqual(before);
    });
  });

  describe("edge cases", () => {
    it("leaves an already-normalized tree untouched", () => {
      const editor = makeEditor();
      setChildren(editor, [
        scene([content("narration", "n1"), content("image", "i1")], "s1"),
        scene([content("character", "ch1"), content("clip", "c1")], "s2"),
      ]);
      const snapshot = JSON.parse(JSON.stringify(editor.children));
      Editor.normalize(editor, { force: true });
      expect(editor.children).toEqual(snapshot);
    });

    it("handles alternating foregrounds and overlays in a single flat scene", () => {
      const editor = makeEditor();
      setChildren(editor, [
        scene([
          content("narration", "n1"),
          content("image", "i1"),
          content("sound", "snd1"),
          content("clip", "c1"),
          content("music", "m1"),
          content("image", "i2"),
        ]),
      ]);
      expect(shape(editor)).toEqual([
        ["narration", "image", "sound"],
        ["clip", "music"],
        ["image"],
      ]);
    });
  });
});
