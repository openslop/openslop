import { describe, expect, it } from "vitest";
import { createEditor, Editor, Element, Transforms } from "slate";
import { withReact } from "slate-react";
import { withScenes } from "../plugins/with-scenes";
import { withNodeId } from "../plugins/with-node-id";
import type { ContentElement, Scene } from "@/lib/canvas/types";
import { isScene } from "@/lib/canvas/scenes";
import { content, scene, shape } from "./fixtures";

function makeEditor() {
	return withNodeId(withScenes(withReact(createEditor())));
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

describe("withScenes", () => {
	describe("invariant A: wraps non-scene root elements", () => {
		it("wraps a single foreground at root in a scene", () => {
			const editor = makeEditor();
			setChildren(editor, [content("image", "i1")]);
			expect(shape(editor)).toEqual([["image"]]);
			expect(isScene(editor.children[0])).toBe(true);
		});

		it("wraps a single non-foreground at root in a scene (leading orphan)", () => {
			const editor = makeEditor();
			setChildren(editor, [content("speech", "n1")]);
			expect(shape(editor)).toEqual([["speech"]]);
			expect(isScene(editor.children[0])).toBe(true);
		});

		it("absorbs a loose trailing non-foreground into the previous scene", () => {
			const editor = makeEditor();
			setChildren(editor, [
				scene([content("image", "i1")], "s1"),
				content("speech", "n1"),
			]);
			expect(shape(editor)).toEqual([["image", "speech"]]);
		});

		it("absorbs multiple trailing loose non-foregrounds into the previous scene", () => {
			const editor = makeEditor();
			setChildren(editor, [
				scene([content("image", "i1")], "s1"),
				content("speech", "n1"),
				content("sound", "snd1"),
				content("music", "m1"),
			]);
			expect(shape(editor)).toEqual([["image", "speech", "sound", "music"]]);
		});

		it("collapses loose [speech, image] at root into a single scene", () => {
			const editor = makeEditor();
			setChildren(editor, [content("speech", "n1"), content("image", "i1")]);
			expect(shape(editor)).toEqual([["speech", "image"]]);
		});

		it("collapses loose [speech, speech, image] at root into a single scene", () => {
			const editor = makeEditor();
			setChildren(editor, [
				content("speech", "n1"),
				content("speech", "n2"),
				content("image", "i1"),
			]);
			expect(shape(editor)).toEqual([["speech", "speech", "image"]]);
		});
	});

	describe("invariant E: splits scenes with 2+ foregrounds", () => {
		it("splits at the second foreground", () => {
			const editor = makeEditor();
			setChildren(editor, [
				scene([content("image", "i1"), content("video", "v1")]),
			]);
			expect(shape(editor)).toEqual([["image"], ["video"]]);
		});

		it("keeps overlays before the split with the prior foreground", () => {
			const editor = makeEditor();
			setChildren(editor, [
				scene([
					content("speech", "n1"),
					content("image", "i1"),
					content("speech", "ch1"),
					content("video", "v1"),
				]),
			]);
			expect(shape(editor)).toEqual([["speech", "image", "speech"], ["video"]]);
		});

		it("moves overlays after the second foreground into the split scene", () => {
			const editor = makeEditor();
			setChildren(editor, [
				scene([
					content("image", "i1"),
					content("video", "v1"),
					content("sound", "snd1"),
				]),
			]);
			expect(shape(editor)).toEqual([["image"], ["video", "sound"]]);
		});

		it("splits scenes with three foregrounds into three scenes", () => {
			const editor = makeEditor();
			setChildren(editor, [
				scene([
					content("image", "i1"),
					content("video", "v1"),
					content("image", "i2"),
				]),
			]);
			expect(shape(editor)).toEqual([["image"], ["video"], ["image"]]);
		});

		it("splits a nested overlay cluster correctly", () => {
			const editor = makeEditor();
			setChildren(editor, [
				scene([
					content("speech", "n1"),
					content("image", "i1"),
					content("speech", "ch1"),
					content("video", "v1"),
					content("sound", "snd1"),
					content("music", "m1"),
				]),
			]);
			expect(shape(editor)).toEqual([
				["speech", "image", "speech"],
				["video", "sound", "music"],
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
				scene([content("speech", "n1"), content("sound", "snd1")], "s2"),
			]);
			expect(shape(editor)).toEqual([["image", "speech", "sound"]]);
		});

		it("leaves a solitary orphan scene when there is no previous scene", () => {
			const editor = makeEditor();
			setChildren(editor, [scene([content("speech", "n1")], "s1")]);
			expect(shape(editor)).toEqual([["speech"]]);
		});

		it("collapses a leading orphan with a foreground scene below", () => {
			const editor = makeEditor();
			setChildren(editor, [
				scene([content("speech", "n1")], "s1"),
				scene([content("image", "i1")], "s2"),
			]);
			expect(shape(editor)).toEqual([["speech", "image"]]);
		});

		it("chains orphan merges up across multiple trailing orphans", () => {
			const editor = makeEditor();
			setChildren(editor, [
				scene([content("image", "i1")], "s1"),
				scene([content("speech", "n1")], "s2"),
				scene([content("music", "m1")], "s3"),
			]);
			expect(shape(editor)).toEqual([["image", "speech", "music"]]);
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
			setChildren(editor, [scene([content("speech", "n1")], "s1")]);
			Transforms.removeNodes(editor, { at: [0, 0] });
			expect(editor.children).toEqual([]);
		});
	});

	describe("flows: end-to-end normalization chains", () => {
		it("removing the sole foreground from a scene produces an orphan that merges UP", () => {
			const editor = makeEditor();
			setChildren(editor, [
				scene([content("image", "i1")], "s1"),
				scene([content("speech", "ch1"), content("video", "v1")], "s2"),
			]);
			expect(shape(editor)).toEqual([["image"], ["speech", "video"]]);
			Transforms.removeNodes(editor, { at: [1, 1] });
			expect(shape(editor)).toEqual([["image", "speech"]]);
		});

		it("replacing a foreground before removing it keeps the scene's overlays with the replacement", () => {
			const editor = makeEditor();
			setChildren(editor, [
				scene([content("image", "i1")], "s1"),
				scene([content("speech", "n1"), content("image", "i2")], "s2"),
			]);
			Transforms.insertNodes(editor, content("video", "v1"), { at: [1, 1] });
			Transforms.removeNodes(editor, { at: [2, 0] });
			expect(shape(editor)).toEqual([["image"], ["speech", "video"]]);
		});

		it("streaming inserts collect overlays into the correct scenes", () => {
			const editor = makeEditor();
			const sequence: ContentElement[] = [
				content("speech", "n1"),
				content("speech", "n2"),
				content("image", "i1"),
				content("speech", "n3"),
				content("video", "v1"),
				content("sound", "snd1"),
			];
			for (const node of sequence) {
				Transforms.insertNodes(editor, node, {
					at: [editor.children.length],
				});
			}
			expect(shape(editor)).toEqual([
				["speech", "speech", "image", "speech"],
				["video", "sound"],
			]);
		});

		it("split produces two scenes with distinct, non-empty ids", () => {
			const editor = makeEditor();
			setChildren(editor, [
				scene([content("image", "i1"), content("video", "v1")], "s1"),
			]);
			const ids = editor.children.map((n) => (n as Scene).id);
			expect(ids).toHaveLength(2);
			expect(ids[0]).toBeTruthy();
			expect(ids[1]).toBeTruthy();
			expect(ids[0]).not.toBe(ids[1]);
		});

		it("does not mutate scene ids during a no-op normalization", () => {
			const editor = makeEditor();
			setChildren(editor, [
				scene([content("speech", "n1"), content("image", "i1")], "s1"),
				scene([content("speech", "ch1"), content("video", "v1")], "s2"),
			]);
			const before = editor.children.map((n) => (n as Scene).id);
			Editor.normalize(editor, { force: true });
			const after = editor.children.map((n) => (n as Scene).id);
			expect(after).toEqual(before);
		});
	});

	describe("edge cases", () => {
		it("leaves an already-normalized tree untouched", () => {
			const editor = makeEditor();
			setChildren(editor, [
				scene([content("speech", "n1"), content("image", "i1")], "s1"),
				scene([content("speech", "ch1"), content("video", "v1")], "s2"),
			]);
			const snapshot = JSON.parse(JSON.stringify(editor.children));
			Editor.normalize(editor, { force: true });
			expect(editor.children).toEqual(snapshot);
		});

		it("handles alternating foregrounds and overlays in a single flat scene", () => {
			const editor = makeEditor();
			setChildren(editor, [
				scene([
					content("speech", "n1"),
					content("image", "i1"),
					content("sound", "snd1"),
					content("video", "v1"),
					content("music", "m1"),
					content("image", "i2"),
				]),
			]);
			expect(shape(editor)).toEqual([
				["speech", "image", "sound"],
				["video", "music"],
				["image"],
			]);
		});
	});
});
