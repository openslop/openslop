import { describe, expect, it, vi } from "vitest";
import { createEditor, Editor, Element } from "slate";
import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import type {
	CanvasContentElement,
	SceneElement,
} from "@/app/components/canvas/types";

vi.mock("@/app/components/canvas/config/elementConfigs", () => ({
	ELEMENT_CONFIGS: {
		narration: {
			type: "narration",
			connector: "tts",
			outputKind: "audio",
			label: "Narration",
			defaultAttributes: { emotion: "neutral" },
			visibleAttributes: {},
		},
		sound: {
			type: "sound",
			connector: "sfx",
			outputKind: "audio",
			label: "Sound",
			defaultAttributes: { type: "ambient" },
			visibleAttributes: {},
		},
		image: {
			type: "image",
			connector: "image",
			outputKind: "image",
			label: "Image",
			defaultAttributes: undefined,
			visibleAttributes: {},
		},
		character: {
			type: "character",
			connector: "tts",
			outputKind: "audio",
			label: "Character",
			defaultAttributes: { emotion: "neutral" },
			visibleAttributes: {},
		},
		music: {
			type: "music",
			connector: "music",
			outputKind: "audio",
			label: "Music",
			defaultAttributes: undefined,
			visibleAttributes: {},
		},
		clip: {
			type: "clip",
			connector: "video",
			outputKind: "video",
			label: "Clip",
			defaultAttributes: undefined,
			visibleAttributes: {},
		},
	},
}));

vi.mock("@/app/components/canvas/utils/hydrateConnectorConfig", () => ({
	hydrateConnectorConfig: () => (node: Record<string, unknown>) => node,
}));

import { applyRefineOp } from "../applyOps";

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

function content(
	type: CanvasContentElement["type"],
	id: string,
	text = "",
	customAttributes?: Record<string, string>,
): CanvasContentElement {
	return {
		id,
		type,
		...(customAttributes && { customAttributes }),
		children: [{ id: `${id}-t`, type, text }],
	};
}

function scene(children: CanvasContentElement[], id = "s1"): SceneElement {
	return { id, type: "scene", children };
}

function makeEditor(scenes: SceneElement[]) {
	const editor = createEditor();
	editor.children = scenes;
	return editor;
}

function getContentIds(editor: Editor): string[] {
	const ids: string[] = [];
	for (const [node] of Editor.nodes(editor, {
		at: [],
		match: (n) => Element.isElement(n) && n.type !== "scene",
	})) {
		ids.push((node as CanvasContentElement).id);
	}
	return ids;
}

const ZWSP = "\u200B";

function getContentTexts(editor: Editor): string[] {
	const texts: string[] = [];
	for (const [node] of Editor.nodes(editor, {
		at: [],
		match: (n) => Element.isElement(n) && n.type !== "scene",
	})) {
		const el = node as CanvasContentElement;
		texts.push(
			el.children
				.map((c) => c.text)
				.join("")
				.replaceAll(ZWSP, ""),
		);
	}
	return texts;
}

describe("applyRefineOp — insert", () => {
	it("appends to end when no anchor_id", () => {
		const editor = makeEditor([scene([content("narration", "n1", "hello")])]);
		const anchorMap: Record<string, string> = {};

		applyRefineOp(
			editor,
			{ op: "insert", type: "sound", text: "rain" },
			anchorMap,
			connectors,
		);

		const ids = getContentIds(editor);
		expect(ids[0]).toBe("n1");
		expect(ids).toHaveLength(2);
		expect(getContentTexts(editor)[1]).toBe("rain");
	});

	it("prepends to top when position is before with no anchor_id", () => {
		const editor = makeEditor([scene([content("narration", "n1", "hello")])]);
		const anchorMap: Record<string, string> = {};

		applyRefineOp(
			editor,
			{ op: "insert", position: "before", type: "sound", text: "rain" },
			anchorMap,
			connectors,
		);

		expect(getContentTexts(editor)[0]).toBe("rain");
		expect(getContentTexts(editor)[1]).toBe("hello");
	});

	it("inserts after an anchored element", () => {
		const editor = makeEditor([
			scene([
				content("narration", "n1", "first"),
				content("narration", "n2", "second"),
			]),
		]);
		const anchorMap: Record<string, string> = {};

		applyRefineOp(
			editor,
			{ op: "insert", anchor_id: "n1", type: "sound", text: "rain" },
			anchorMap,
			connectors,
		);

		const texts = getContentTexts(editor);
		expect(texts).toEqual(["first", "rain", "second"]);
	});

	it("inserts before an anchored element", () => {
		const editor = makeEditor([scene([content("narration", "n1", "first")])]);
		const anchorMap: Record<string, string> = {};

		applyRefineOp(
			editor,
			{
				op: "insert",
				anchor_id: "n1",
				position: "before",
				type: "sound",
				text: "rain",
			},
			anchorMap,
			connectors,
		);

		const texts = getContentTexts(editor);
		expect(texts).toEqual(["rain", "first"]);
	});

	it("stacks consecutive inserts at the same anchor in order", () => {
		const editor = makeEditor([scene([content("narration", "n1", "first")])]);
		const anchorMap: Record<string, string> = {};

		applyRefineOp(
			editor,
			{ op: "insert", anchor_id: "n1", type: "sound", text: "A" },
			anchorMap,
			connectors,
		);
		applyRefineOp(
			editor,
			{ op: "insert", anchor_id: "n1", type: "sound", text: "B" },
			anchorMap,
			connectors,
		);
		applyRefineOp(
			editor,
			{ op: "insert", anchor_id: "n1", type: "sound", text: "C" },
			anchorMap,
			connectors,
		);

		const texts = getContentTexts(editor);
		expect(texts).toEqual(["first", "A", "B", "C"]);
	});

	it("falls back to append when anchor_id not found", () => {
		const editor = makeEditor([scene([content("narration", "n1", "hello")])]);
		const anchorMap: Record<string, string> = {};

		applyRefineOp(
			editor,
			{ op: "insert", anchor_id: "nonexistent", type: "sound", text: "rain" },
			anchorMap,
			connectors,
		);

		const texts = getContentTexts(editor);
		expect(texts).toEqual(["hello", "rain"]);
	});

	it("uses custom attrs from the op", () => {
		const editor = makeEditor([scene([content("narration", "n1")])]);
		const anchorMap: Record<string, string> = {};

		applyRefineOp(
			editor,
			{
				op: "insert",
				type: "sound",
				text: "rain",
				attrs: { type: "transient" },
			},
			anchorMap,
			connectors,
		);

		const nodes: CanvasContentElement[] = [];
		for (const [node] of Editor.nodes(editor, {
			at: [],
			match: (n) => Element.isElement(n) && n.type === "sound",
		})) {
			nodes.push(node as CanvasContentElement);
		}
		expect(nodes[0].customAttributes).toEqual({ type: "transient" });
	});
});

describe("applyRefineOp — remove", () => {
	it("removes a node by id", () => {
		const editor = makeEditor([
			scene([
				content("narration", "n1", "first"),
				content("narration", "n2", "second"),
			]),
		]);

		applyRefineOp(editor, { op: "remove", id: "n1" }, {}, connectors);

		expect(getContentIds(editor)).toEqual(["n2"]);
	});

	it("silently skips when id not found", () => {
		const editor = makeEditor([scene([content("narration", "n1", "hello")])]);

		applyRefineOp(editor, { op: "remove", id: "nonexistent" }, {}, connectors);

		expect(getContentIds(editor)).toEqual(["n1"]);
	});
});

describe("applyRefineOp — set", () => {
	it("updates text content", () => {
		const editor = makeEditor([scene([content("narration", "n1", "old")])]);

		applyRefineOp(
			editor,
			{ op: "set", id: "n1", text: "new text" },
			{},
			connectors,
		);

		expect(getContentTexts(editor)).toEqual(["new text"]);
	});

	it("merges attrs into existing customAttributes", () => {
		const editor = makeEditor([
			scene([
				content("character", "n1", "hello", {
					name: "Lyra",
					emotion: "neutral",
				}),
			]),
		]);

		applyRefineOp(
			editor,
			{ op: "set", id: "n1", attrs: { emotion: "excited" } },
			{},
			connectors,
		);

		const [node] = Editor.nodes(editor, {
			at: [],
			match: (n) => Element.isElement(n) && n.id === "n1",
		});
		const el = node[0] as CanvasContentElement;
		expect(el.customAttributes).toEqual({
			name: "Lyra",
			emotion: "excited",
		});
	});

	it("removes attrs set to null", () => {
		const editor = makeEditor([
			scene([
				content("character", "n1", "hello", {
					name: "Lyra",
					emotion: "neutral",
				}),
			]),
		]);

		applyRefineOp(
			editor,
			{ op: "set", id: "n1", attrs: { emotion: null } },
			{},
			connectors,
		);

		const [node] = Editor.nodes(editor, {
			at: [],
			match: (n) => Element.isElement(n) && n.id === "n1",
		});
		const el = node[0] as CanvasContentElement;
		expect(el.customAttributes).toEqual({ name: "Lyra" });
	});

	it("applies attrs and text together", () => {
		const editor = makeEditor([
			scene([content("character", "n1", "old", { name: "Lyra" })]),
		]);

		applyRefineOp(
			editor,
			{
				op: "set",
				id: "n1",
				attrs: { name: "Alice", emotion: "happy" },
				text: "Hello!",
			},
			{},
			connectors,
		);

		const [node] = Editor.nodes(editor, {
			at: [],
			match: (n) => Element.isElement(n) && n.id === "n1",
		});
		const el = node[0] as CanvasContentElement;
		expect(el.customAttributes).toEqual({ name: "Alice", emotion: "happy" });
		expect(el.children.map((c) => c.text).join("")).toBe("Hello!");
	});

	it("silently skips when id not found", () => {
		const editor = makeEditor([scene([content("narration", "n1", "hello")])]);

		applyRefineOp(
			editor,
			{ op: "set", id: "nonexistent", text: "new" },
			{},
			connectors,
		);

		expect(getContentTexts(editor)).toEqual(["hello"]);
	});
});

describe("applyRefineOp — insert positioning edge cases", () => {
	it("inserts at different anchors independently", () => {
		const editor = makeEditor([
			scene([
				content("narration", "n1", "first"),
				content("narration", "n2", "second"),
				content("narration", "n3", "third"),
			]),
		]);
		const anchorMap: Record<string, string> = {};

		applyRefineOp(
			editor,
			{ op: "insert", anchor_id: "n1", type: "sound", text: "A" },
			anchorMap,
			connectors,
		);
		applyRefineOp(
			editor,
			{ op: "insert", anchor_id: "n3", type: "sound", text: "B" },
			anchorMap,
			connectors,
		);

		const texts = getContentTexts(editor);
		expect(texts).toEqual(["first", "A", "second", "third", "B"]);
	});

	it("stacking works across interleaved anchors", () => {
		const editor = makeEditor([
			scene([
				content("narration", "n1", "first"),
				content("narration", "n2", "second"),
			]),
		]);
		const anchorMap: Record<string, string> = {};

		applyRefineOp(
			editor,
			{ op: "insert", anchor_id: "n1", type: "sound", text: "A1" },
			anchorMap,
			connectors,
		);
		applyRefineOp(
			editor,
			{ op: "insert", anchor_id: "n2", type: "sound", text: "B1" },
			anchorMap,
			connectors,
		);
		applyRefineOp(
			editor,
			{ op: "insert", anchor_id: "n1", type: "sound", text: "A2" },
			anchorMap,
			connectors,
		);

		const texts = getContentTexts(editor);
		expect(texts).toEqual(["first", "A1", "A2", "second", "B1"]);
	});

	it("multiple appends to end stack in order", () => {
		const editor = makeEditor([scene([content("narration", "n1", "first")])]);
		const anchorMap: Record<string, string> = {};

		applyRefineOp(
			editor,
			{ op: "insert", type: "sound", text: "A" },
			anchorMap,
			connectors,
		);
		applyRefineOp(
			editor,
			{ op: "insert", type: "sound", text: "B" },
			anchorMap,
			connectors,
		);
		applyRefineOp(
			editor,
			{ op: "insert", type: "sound", text: "C" },
			anchorMap,
			connectors,
		);

		const texts = getContentTexts(editor);
		expect(texts).toEqual(["first", "A", "B", "C"]);
	});
});

describe("applyRefineOp — mixed operations", () => {
	it("handles insert then remove sequence", () => {
		const editor = makeEditor([scene([content("narration", "n1", "hello")])]);
		const anchorMap: Record<string, string> = {};

		applyRefineOp(
			editor,
			{ op: "insert", anchor_id: "n1", type: "sound", text: "rain" },
			anchorMap,
			connectors,
		);
		applyRefineOp(editor, { op: "remove", id: "n1" }, anchorMap, connectors);

		expect(getContentTexts(editor)).toEqual(["rain"]);
	});

	it("handles set then insert at same anchor", () => {
		const editor = makeEditor([
			scene([content("narration", "n1", "old text")]),
		]);
		const anchorMap: Record<string, string> = {};

		applyRefineOp(
			editor,
			{ op: "set", id: "n1", text: "new text" },
			anchorMap,
			connectors,
		);
		applyRefineOp(
			editor,
			{ op: "insert", anchor_id: "n1", type: "sound", text: "rain" },
			anchorMap,
			connectors,
		);

		expect(getContentTexts(editor)).toEqual(["new text", "rain"]);
	});

	it("falls back to original anchor when mapped node is removed", () => {
		const editor = makeEditor([
			scene([
				content("narration", "n1", "first"),
				content("narration", "n2", "second"),
			]),
		]);
		const anchorMap: Record<string, string> = {};

		// Insert after n1 — anchorMap now maps n1 → inserted node
		applyRefineOp(
			editor,
			{ op: "insert", anchor_id: "n1", type: "sound", text: "A" },
			anchorMap,
			connectors,
		);
		// Remove the inserted node — anchorMap["n1"] is now stale
		const insertedId = anchorMap["n1"];
		applyRefineOp(
			editor,
			{ op: "remove", id: insertedId },
			anchorMap,
			connectors,
		);
		// Insert after n1 again — should fall back to original n1, not append to end
		applyRefineOp(
			editor,
			{ op: "insert", anchor_id: "n1", type: "sound", text: "B" },
			anchorMap,
			connectors,
		);

		const texts = getContentTexts(editor);
		expect(texts).toEqual(["first", "B", "second"]);
	});

	it("clears stale anchor mapping after fallback", () => {
		const editor = makeEditor([scene([content("narration", "n1", "first")])]);
		const anchorMap: Record<string, string> = {};

		applyRefineOp(
			editor,
			{ op: "insert", anchor_id: "n1", type: "sound", text: "A" },
			anchorMap,
			connectors,
		);
		const staleId = anchorMap["n1"];
		applyRefineOp(editor, { op: "remove", id: staleId }, anchorMap, connectors);
		// After fallback, the stale mapping should be cleared
		applyRefineOp(
			editor,
			{ op: "insert", anchor_id: "n1", type: "sound", text: "B" },
			anchorMap,
			connectors,
		);
		// Second insert at n1 should stack after B (new mapping)
		applyRefineOp(
			editor,
			{ op: "insert", anchor_id: "n1", type: "sound", text: "C" },
			anchorMap,
			connectors,
		);

		const texts = getContentTexts(editor);
		expect(texts).toEqual(["first", "B", "C"]);
	});
});
