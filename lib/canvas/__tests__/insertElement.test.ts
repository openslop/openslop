import { describe, expect, it, vi } from "vitest";
import { createEditor, Editor } from "slate";

vi.mock("@/lib/connectors/factory", () => ({
	resolveAttributeSchema: (type: string) => ({
		defaultAttributes: type === "tts" ? { emotion: "neutral" } : {},
		keys: [],
	}),
}));

import { insertElement } from "../insertElement";
import { MODEL_CATALOGS } from "@/lib/connectors/models";
import { flatAttributes } from "@/lib/video/elementAttributes";

function makeEditor() {
	const editor = createEditor();
	editor.children = [
		{
			id: "scene-1",
			type: "scene",
			children: [
				{
					id: "nar-1",
					type: "narration",
					children: [{ id: "t1", type: "narration", text: "hello" }],
				},
			],
		},
	];
	return editor;
}

describe("insertElement", () => {
	it("inserts a node with correct type", () => {
		const editor = makeEditor();
		Editor.withoutNormalizing(editor, () => {
			insertElement(editor, "narration", [0, 1]);
		});

		const scene = editor.children[0] as {
			children: Array<Record<string, unknown>>;
		};
		const inserted = scene.children[1];
		expect(inserted.type).toBe("narration");
		expect(inserted.id).toBeDefined();
		expect(inserted.children).toBeDefined();
	});

	it("applies default attributes from element config", () => {
		const editor = makeEditor();
		Editor.withoutNormalizing(editor, () => {
			insertElement(editor, "narration", [0, 1]);
		});

		const scene = editor.children[0] as {
			children: Array<Record<string, unknown>>;
		};
		const inserted = scene.children[1];
		const attrs = flatAttributes(inserted) as Record<string, string>;
		expect(attrs.emotion).toBe("neutral");
	});

	it("hydrates the model a new element generates with", () => {
		const editor = makeEditor();
		Editor.withoutNormalizing(editor, () => {
			insertElement(editor, "image", [0, 1]);
		});

		const scene = editor.children[0] as {
			children: Array<Record<string, unknown>>;
		};
		const inserted = scene.children[1];
		const attrs = flatAttributes(inserted) as Record<string, string>;
		expect(attrs.model).toBe(MODEL_CATALOGS.image.defaultModel);
	});

	it("passes the project's configured model to the new element", () => {
		const editor = makeEditor();
		Editor.withoutNormalizing(editor, () => {
			insertElement(editor, "image", [0, 1], {
				projectModels: { image: "Slop Image v1" },
			});
		});

		const scene = editor.children[0] as {
			children: Array<Record<string, unknown>>;
		};
		const attrs = flatAttributes(scene.children[1]) as Record<string, string>;
		expect(attrs.model).toBe("Slop Image v1");
	});

	it("element without defaultAttributes gets undefined customAttributes base", () => {
		const editor = makeEditor();
		Editor.withoutNormalizing(editor, () => {
			insertElement(editor, "image", [0, 1]);
		});

		const scene = editor.children[0] as {
			children: Array<Record<string, unknown>>;
		};
		const inserted = scene.children[1];
		const attrs = flatAttributes(inserted) as Record<string, string>;
		expect(attrs.model).toBe(MODEL_CATALOGS.image.defaultModel);
		expect(attrs.emotion).toBeUndefined();
	});
});
