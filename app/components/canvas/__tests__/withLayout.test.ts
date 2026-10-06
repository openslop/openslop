import { describe, expect, it } from "vitest";
import { createEditor, type Descendant } from "slate";
import { withReact } from "slate-react";
import type { ConnectorModels } from "@/lib/connectors/models";
import { flatAttributes } from "@/lib/canvas/elementAttributes";
import { isContentElement } from "@/lib/canvas/guards";
import { createCanvasNode } from "@/lib/canvas/createCanvasNode";
import { createTitle, titleText } from "@/lib/canvas/title";
import { withLayout } from "../plugins/withLayout";
import { content, scene } from "./fixtures";

const HEAD = [
	createTitle("Moon"),
	createCanvasNode("asset_style", { text: "noir" }),
	createCanvasNode("asset_character", {
		attrs: { name: "Mia" },
		text: "a girl",
	}),
];

const SCRIPT = [scene([content("narration", "n1", "hello")])];

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
	it("seeds an empty document with an empty title and one narration", () => {
		const children = normalized([]);

		expect(children.map((node) => "type" in node && node.type)).toEqual([
			"title",
			"narration",
		]);
		expect(titleText(children)).toBe("");
	});

	it("seeds a document that holds only its title and assets with one narration, after the last of them", () => {
		const children = normalized([...HEAD]);

		expect(children.slice(0, -1)).toEqual(HEAD);
		expect(children.at(-1)).toMatchObject({ type: "narration" });
	});

	it("puts a title on top of a document that has none", () => {
		const [title, ...rest] = normalized(SCRIPT);

		expect(title).toMatchObject({ type: "title" });
		expect(rest).toEqual(SCRIPT);
	});

	it("seeds the narration with the model the project speaks in", () => {
		const pinned = { provider: "cartesia", model: "Sonic 3.6" } as const;
		const narration = normalized([], { tts: pinned }).at(-1);

		expect(
			isContentElement(narration) && flatAttributes(narration),
		).toMatchObject(pinned);
	});

	it("leaves a document that holds a title and a script alone", () => {
		const children = [...HEAD, ...SCRIPT];

		expect(normalized(children)).toEqual(children);
	});
});
