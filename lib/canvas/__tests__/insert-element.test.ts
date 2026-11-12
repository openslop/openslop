import { describe, expect, it } from "vitest";
import { Editor } from "slate";

import { insertElement } from "../insert-element";
import { DEFAULT_MODELS, type ConnectorModels } from "@/lib/connectors/models";
import { flatAttributes } from "@/lib/canvas/element-attributes";
import { ZERO_WIDTH_SPACE } from "../constants";
import { getContentElements } from "../scenes";
import { element, makeEditor } from "./_assets";

const seededEditor = (defaultModels: ConnectorModels = {}) =>
	makeEditor(
		[
			{
				id: "scene-1",
				type: "scene",
				children: [element("nar-1", "narration", "hello")],
			},
		],
		defaultModels,
	);

const inserted = (editor: Editor) => getContentElements(editor.children)[1]!;

describe("insertElement", () => {
	it("inserts a node with correct type", () => {
		const editor = seededEditor();
		Editor.withoutNormalizing(editor, () => {
			insertElement(editor, "narration", [0, 1]);
		});

		const node = inserted(editor);
		expect(node.type).toBe("narration");
		expect(node.id).toBeDefined();
		expect(node.children).toBeDefined();
	});

	it("applies default attributes from element config", () => {
		const editor = seededEditor();
		Editor.withoutNormalizing(editor, () => {
			insertElement(editor, "narration", [0, 1]);
		});

		expect(flatAttributes(inserted(editor)).emotion).toBe("neutral");
	});

	it("hydrates the model a new element generates with", () => {
		const editor = seededEditor();
		Editor.withoutNormalizing(editor, () => {
			insertElement(editor, "image", [0, 1]);
		});

		expect(flatAttributes(inserted(editor))).toMatchObject(
			DEFAULT_MODELS.image,
		);
	});

	it("gives the new element the editor's default model", () => {
		const pinned = { provider: "runware", model: "Seedream 5 Lite" } as const;
		const editor = seededEditor({ image: pinned });
		Editor.withoutNormalizing(editor, () => {
			insertElement(editor, "image", [0, 1]);
		});

		expect(flatAttributes(inserted(editor))).toMatchObject(pinned);
	});

	it("trims the text it is given", () => {
		const editor = seededEditor();
		Editor.withoutNormalizing(editor, () => {
			insertElement(editor, "narration", [0, 1], { text: "  hello  " });
		});

		expect(Editor.string(editor, [0, 1])).toBe(`${ZERO_WIDTH_SPACE}hello`);
	});
});
