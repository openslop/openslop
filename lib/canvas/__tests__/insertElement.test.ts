import { describe, expect, it, vi } from "vitest";
import { createEditor, Editor } from "slate";

vi.mock("@/lib/config/connectorUtils", () => ({
	getDefaultConnector: () => ({
		provider: "openslop",
		config: {
			defaultModel: "test-model",
			models: ["test-model"],
			isDefault: true,
		},
	}),
}));

vi.mock("@/lib/connectors/factory", () => ({
	resolveAttributeSchema: (type: string) => ({
		defaultAttributes: type === "tts" ? { emotion: "neutral" } : {},
		visibleAttributes: {},
		keys: [],
	}),
}));

import { insertElement } from "../insertElement";
import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";

const connectors: ConnectorRegistry = {
	llm: {
		openslop: { defaultModel: "m", models: ["m"], isDefault: true, apiKey: "" },
	},
	tts: {
		openslop: { defaultModel: "m", models: ["m"], isDefault: true, apiKey: "" },
	},
	image: {
		openslop: { defaultModel: "m", models: ["m"], isDefault: true, apiKey: "" },
	},
	animated_image: {
		openslop: { defaultModel: "m", models: ["m"], isDefault: true, apiKey: "" },
	},
	video: {
		openslop: { defaultModel: "m", models: ["m"], isDefault: true, apiKey: "" },
	},
	sfx: {
		openslop: { defaultModel: "m", models: ["m"], isDefault: true, apiKey: "" },
	},
	music: {
		openslop: { defaultModel: "m", models: ["m"], isDefault: true, apiKey: "" },
	},
};

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
			insertElement(editor, "narration", [0, 1], connectors);
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
			insertElement(editor, "narration", [0, 1], connectors);
		});

		const scene = editor.children[0] as {
			children: Array<Record<string, unknown>>;
		};
		const inserted = scene.children[1];
		const attrs = inserted.customAttributes as Record<string, string>;
		expect(attrs.emotion).toBe("neutral");
	});

	it("hydrates connector config (model and provider)", () => {
		const editor = makeEditor();
		Editor.withoutNormalizing(editor, () => {
			insertElement(editor, "image", [0, 1], connectors);
		});

		const scene = editor.children[0] as {
			children: Array<Record<string, unknown>>;
		};
		const inserted = scene.children[1];
		const attrs = inserted.customAttributes as Record<string, string>;
		expect(attrs.model).toBe("test-model");
		expect(attrs.provider).toBe("openslop");
	});

	it("element without defaultAttributes gets undefined customAttributes base", () => {
		const editor = makeEditor();
		Editor.withoutNormalizing(editor, () => {
			insertElement(editor, "image", [0, 1], connectors);
		});

		const scene = editor.children[0] as {
			children: Array<Record<string, unknown>>;
		};
		const inserted = scene.children[1];
		const attrs = inserted.customAttributes as Record<string, string>;
		expect(attrs.model).toBe("test-model");
		expect(attrs.provider).toBe("openslop");
		expect(attrs.emotion).toBeUndefined();
	});
});
