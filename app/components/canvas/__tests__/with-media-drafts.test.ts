import { describe, expect, it } from "vitest";
import type { Descendant } from "slate";
import { HistoryEditor, withHistory } from "slate-history";
import { withReact } from "slate-react";
import { asset, makeEditor } from "@/lib/canvas/__tests__/_assets";
import { removeAssets } from "@/lib/canvas/asset-ops";
import { findAsset, getAssets } from "@/lib/canvas/assets";
import { MEDIA_DRAFT_TYPES, type CanvasEditor } from "@/lib/canvas/types";
import { applyScriptToEditor } from "@/lib/project/apply-script";
import { withMediaDrafts } from "../plugins/with-media-drafts";
import { content, scene } from "./fixtures";

const SCRIPT = [scene([content("narration", "n1", "hello")])];

const editorWith = (children: Descendant[]): CanvasEditor => {
	const editor = withMediaDrafts(withHistory(withReact(makeEditor(children))));
	HistoryEditor.withoutSaving(editor, () => editor.normalize({ force: true }));
	return editor;
};

const draftTypes = (editor: CanvasEditor) =>
	getAssets(editor.children)
		.map((node) => node.type)
		.sort();

describe("withMediaDrafts", () => {
	it("gives a document every media draft", () => {
		expect(draftTypes(editorWith(SCRIPT))).toEqual(
			MEDIA_DRAFT_TYPES.toSorted(),
		);
	});

	it("keeps the drafts a document already has", () => {
		const draft = asset("asset_media_image", { text: "A wizard" });

		const editor = editorWith([draft, ...SCRIPT]);

		expect(findAsset(editor.children, "asset_media_image")).toEqual(draft);
	});

	it("seeds a newly loaded project's drafts out of undo's reach", () => {
		const editor = withMediaDrafts(withHistory(withReact(makeEditor())));
		applyScriptToEditor(editor, "");
		const loaded = editor.children;

		HistoryEditor.undo(editor);

		expect(editor.children).toBe(loaded);
		expect(draftTypes(editor)).toEqual(MEDIA_DRAFT_TYPES.toSorted());
	});

	it("puts a removed draft back in the same undo step", () => {
		const editor = editorWith(SCRIPT);
		const before = editor.children;

		removeAssets(editor);
		expect(draftTypes(editor)).toEqual(MEDIA_DRAFT_TYPES.toSorted());

		HistoryEditor.undo(editor);
		expect(editor.children).toEqual(before);
	});
});
