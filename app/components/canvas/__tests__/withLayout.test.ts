import { describe, expect, it } from "vitest";
import { createEditor, type Descendant } from "slate";
import { withReact } from "slate-react";
import type { ConnectorModels } from "@/lib/connectors/models";
import { flatAttributes } from "@/lib/canvas/elementAttributes";
import { isContentElement } from "@/lib/canvas/guards";
import { createCanvasNode } from "@/lib/canvas/createCanvasNode";
import { withLayout } from "../plugins/withLayout";
import { content, scene } from "./fixtures";

const ASSETS = [
	createCanvasNode("style", { text: "noir" }),
	createCanvasNode("cast", { attrs: { name: "Mia" }, text: "a girl" }),
];

const normalized = (
	children: Descendant[],
	defaultModels: ConnectorModels = {},
) => {
	const editor = withLayout(withReact(createEditor()));
	editor.defaultModels = () => defaultModels;
	editor.children = children;
	editor.normalize({ force: true });
	return editor.children;
};

describe("withLayout", () => {
	it.each([
		["an empty document", []],
		["a document that holds only assets, after the last of them", ASSETS],
	])("seeds %s with one narration", (_, assets) => {
		const children = normalized([...assets]);

		expect(children.slice(0, -1)).toEqual(assets);
		expect(children.at(-1)).toMatchObject({ type: "narration" });
	});

	it("seeds it with the model the project speaks in", () => {
		const pinned = { provider: "cartesia", model: "Sonic 3.6" } as const;
		const [narration] = normalized([], { tts: pinned });

		expect(
			isContentElement(narration) && flatAttributes(narration),
		).toMatchObject(pinned);
	});

	it("leaves a document that holds a script alone", () => {
		const children = [...ASSETS, scene([content("narration", "n1", "hello")])];

		expect(normalized(children)).toEqual(children);
	});
});
