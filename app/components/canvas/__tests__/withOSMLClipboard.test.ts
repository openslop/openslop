import { describe, expect, it, vi } from "vitest";
import { createEditor, Editor, Transforms } from "slate";
import { withReact } from "slate-react";
import { withScenes } from "../plugins/withScenes";
import { withFlatPaste } from "../plugins/withFlatPaste";
import { withNodeId } from "../plugins/withNodeId";
import { withOSMLClipboard } from "../plugins/withOSMLClipboard";
import { DEFAULT_CONNECTOR_REGISTRY } from "@/lib/connectors/registry";
import { getContentElements, isSceneElement } from "@/lib/canvas/scenes";
import { getElementBodyText } from "@/lib/canvas/osmlSerializer";
import {
	SCENE_TYPE,
	type CanvasContentElement,
	type CanvasEditor,
	type SceneElement,
} from "@/lib/canvas/types";

function content(
	type: CanvasContentElement["type"],
	id: string,
	text = "",
): CanvasContentElement {
	return { id, type, children: [{ id: `${id}-t`, type, text }] };
}

const scene = (children: CanvasContentElement[], id = "s"): SceneElement => ({
	id,
	type: SCENE_TYPE,
	children,
});

type FakeTransfer = DataTransfer & { store: Record<string, string> };

function fakeDataTransfer(initial: Record<string, string> = {}): FakeTransfer {
	const store = { ...initial };
	return {
		store,
		getData: (format: string) => store[format] ?? "",
		setData: (format: string, value: string) => {
			store[format] = value;
		},
	} as unknown as FakeTransfer;
}

/**
 * The real base handlers need a mounted DOM, so they are stubbed: the assertions
 * here are about what the plugin does versus what it hands back to the default.
 */
function makeEditor(...scenes: SceneElement[]) {
	const base = withNodeId(withFlatPaste(withScenes(withReact(createEditor()))));
	const setFragmentData = vi.fn();
	const insertTextData = vi.fn(() => true);
	base.setFragmentData = setFragmentData;
	base.insertTextData = insertTextData;

	const editor: CanvasEditor = withOSMLClipboard(DEFAULT_CONNECTOR_REGISTRY)(
		base,
	);
	Editor.withoutNormalizing(editor, () => {
		Transforms.insertNodes(editor, scenes);
	});
	Editor.normalize(editor, { force: true });
	Transforms.select(editor, Editor.end(editor, []));

	return { editor, setFragmentData, insertTextData };
}

const elementOfType = (editor: CanvasEditor, type: string) =>
	getContentElements(editor.children).find((el) => el.type === type);

describe("withOSMLClipboard copy", () => {
	it("writes the selection as OSML on text/plain", () => {
		const { editor, setFragmentData } = makeEditor(
			scene([content("narration", "n1", "Hello world")]),
		);
		Transforms.select(editor, []);

		const data = fakeDataTransfer();
		editor.setFragmentData(data, "copy");

		expect(setFragmentData).toHaveBeenCalled();
		expect(data.store["text/plain"]).toContain("--- Scene 1 ---");
		expect(data.store["text/plain"]).toContain(
			'<narration id="n1">Hello world</narration>',
		);
	});

	it("keeps custom attributes on a copied element", () => {
		const { editor } = makeEditor(
			scene([
				{
					...content("character", "c1", "Hi there"),
					generationAttributes: { name: "Lyra" },
				},
			]),
		);
		Transforms.select(editor, []);

		const data = fakeDataTransfer();
		editor.setFragmentData(data, "copy");

		expect(data.store["text/plain"]).toContain('name="Lyra"');
	});

	it("leaves a partial selection inside one element as plain text", () => {
		const { editor } = makeEditor(
			scene([content("narration", "n1", "Hello world")]),
		);
		const [, path] = Editor.node(editor, [0, 0, 0]);
		Transforms.select(editor, {
			anchor: { path, offset: 1 },
			focus: { path, offset: 4 },
		});

		const data = fakeDataTransfer();
		editor.setFragmentData(data, "copy");

		expect(data.store["text/plain"]).toBeUndefined();
	});

	it("writes OSML once the selection swallows a whole element", () => {
		const { editor } = makeEditor(
			scene([
				content("narration", "n1", "Hello world"),
				content("image", "i1", "a sunset"),
			]),
		);
		Transforms.select(editor, {
			anchor: Editor.start(editor, [0, 0]),
			focus: { path: Editor.path(editor, [0, 1, 0]), offset: 3 },
		});

		const data = fakeDataTransfer();
		editor.setFragmentData(data, "copy");

		expect(data.store["text/plain"]).toContain(
			'<narration id="n1">Hello world</narration>',
		);
	});

	it("leaves a collapsed selection to the default handler", () => {
		const { editor } = makeEditor(
			scene([content("narration", "n1", "Hello world")]),
		);

		const data = fakeDataTransfer();
		editor.setFragmentData(data, "copy");

		expect(data.store["text/plain"]).toBeUndefined();
	});
});

describe("withOSMLClipboard paste", () => {
	it("parses pasted OSML into elements with their attributes", () => {
		const { editor } = makeEditor(scene([content("narration", "n0", "start")]));

		const handled = editor.insertTextData(
			fakeDataTransfer({
				"text/plain":
					'--- Scene 1 ---\n<image id="i1">a sunset</image>\n<character id="c1" name="Lyra">Hi there</character>',
			}),
		);

		expect(handled).toBe(true);
		const image = elementOfType(editor, "image");
		expect(image && getElementBodyText(image)).toBe("a sunset");
		expect(elementOfType(editor, "character")?.generationAttributes?.name).toBe(
			"Lyra",
		);
	});

	it("mints fresh ids so pasted elements do not share generation state", () => {
		const { editor } = makeEditor(scene([content("narration", "n0", "start")]));

		editor.insertTextData(
			fakeDataTransfer({ "text/plain": '<image id="i1">a sunset</image>' }),
		);

		expect(elementOfType(editor, "image")?.id).not.toBe("i1");
	});

	it("splits pasted scene markers into separate scenes", () => {
		const { editor } = makeEditor(scene([content("image", "i0", "start")]));

		editor.insertTextData(
			fakeDataTransfer({
				"text/plain":
					'--- Scene 1 ---\n<image id="a">one</image>\n--- Scene 2 ---\n<image id="b">two</image>',
			}),
		);

		expect(editor.children.filter(isSceneElement).length).toBeGreaterThan(1);
	});

	it("defers ordinary text to the default handler", () => {
		const { editor, insertTextData } = makeEditor(
			scene([content("narration", "n0", "start")]),
		);

		editor.insertTextData(
			fakeDataTransfer({ "text/plain": "just some prose, no tags here" }),
		);

		expect(insertTextData).toHaveBeenCalled();
		expect(getContentElements(editor.children).length).toBe(1);
	});

	it("defers text whose only tags are not canvas elements", () => {
		const { editor, insertTextData } = makeEditor(
			scene([content("narration", "n0", "start")]),
		);

		editor.insertTextData(
			fakeDataTransfer({ "text/plain": "<div>hello</div>" }),
		);

		expect(insertTextData).toHaveBeenCalled();
	});
});
