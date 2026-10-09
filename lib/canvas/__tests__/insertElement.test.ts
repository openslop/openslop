import { describe, expect, it, vi } from "vitest";
import { Editor } from "slate";

vi.mock("@/lib/connectors/factory", () => ({
	resolveAttributeSchema: (type: string) => {
		const defaultAttributes = type === "tts" ? { emotion: "neutral" } : {};
		return {
			defaultAttributes,
			resolve: (attrs: Record<string, string>) => ({
				...defaultAttributes,
				...attrs,
			}),
		};
	},
}));

import { insertElement } from "../insertElement";
import { DEFAULT_MODELS, type ConnectorModels } from "@/lib/connectors/models";
import { flatAttributes } from "@/lib/canvas/elementAttributes";
import { makeEditor } from "./_assets";

const seededEditor = (defaultModels: ConnectorModels = {}) =>
	makeEditor(
		[
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
		],
		defaultModels,
	);

describe("insertElement", () => {
	it("inserts a node with correct type", () => {
		const editor = seededEditor();
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
		const editor = seededEditor();
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
		const editor = seededEditor();
		Editor.withoutNormalizing(editor, () => {
			insertElement(editor, "image", [0, 1]);
		});

		const scene = editor.children[0] as {
			children: Array<Record<string, unknown>>;
		};
		const inserted = scene.children[1];
		expect(flatAttributes(inserted)).toMatchObject(DEFAULT_MODELS.image);
	});

	it("gives the new element the editor's default model", () => {
		const pinned = { provider: "runware", model: "Seedream 5 Lite" } as const;
		const editor = seededEditor({ image: pinned });
		Editor.withoutNormalizing(editor, () => {
			insertElement(editor, "image", [0, 1]);
		});

		const scene = editor.children[0] as {
			children: Array<Record<string, unknown>>;
		};
		expect(flatAttributes(scene.children[1])).toMatchObject(pinned);
	});

	it("element without defaultAttributes gets undefined customAttributes base", () => {
		const editor = seededEditor();
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
