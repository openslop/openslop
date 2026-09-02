import { describe, expect, it, vi } from "vitest";
import { createEditor, Editor } from "slate";

vi.mock("@/lib/connectors/factory", () => ({
	resolveAttributeSchema: (type: string) => {
		const defaultAttributes = type === "tts" ? { emotion: "neutral" } : {};
		return {
			defaultAttributes,
			keys: type === "tts" ? [] : ["model"],
			resolve: (attrs: Record<string, string>) => ({
				...defaultAttributes,
				...attrs,
			}),
		};
	},
}));

import { insertElement } from "../insertElement";
import { DEFAULT_MODELS } from "@/lib/connectors/models";
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
		expect(flatAttributes(inserted)).toMatchObject(DEFAULT_MODELS.image);
	});

	it("passes the project's configured model to the new element", () => {
		const pinned = { provider: "runware", model: "Seedream 5 Lite" } as const;
		const editor = makeEditor();
		Editor.withoutNormalizing(editor, () => {
			insertElement(editor, "image", [0, 1], {
				defaultModels: { image: pinned },
			});
		});

		const scene = editor.children[0] as {
			children: Array<Record<string, unknown>>;
		};
		expect(flatAttributes(scene.children[1])).toMatchObject(pinned);
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
		expect(attrs).toMatchObject(DEFAULT_MODELS.image);
		expect(attrs.emotion).toBeUndefined();
	});
});
