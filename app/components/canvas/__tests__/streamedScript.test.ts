import { describe, expect, it } from "vitest";
import { createEditor } from "slate";
import { withReact } from "slate-react";
import { getAssets } from "@/lib/canvas/assets";
import { asset } from "@/lib/canvas/__tests__/_assets";
import { getElementBodyText } from "@/lib/canvas/osmlSerializer";
import { getContentElements } from "@/lib/canvas/scenes";
import { createTitle } from "@/lib/canvas/title";
import type { AssetElement, CanvasEditor } from "@/lib/canvas/types";
import { BLANK_SCRIPT } from "@/lib/project/serialize";
import { createScriptWriter } from "@/lib/script/scriptWriter";
import { withHead } from "../plugins/withHead";
import { withLayout } from "../plugins/withLayout";
import { withNodeId } from "../plugins/withNodeId";
import { withScenes } from "../plugins/withScenes";
import { shape } from "./fixtures";

const SCRIPT = `<image>A lighthouse at dusk, waves crashing</image>
<narration>The light had burned for a hundred years.</narration>
<sound>waves crashing on rocks</sound>
<video>Ayla climbs the spiral stairs</video>
<character name="Ayla">Someone has to keep it lit.</character>
<music>slow melancholic piano</music>
<image>A boy at the door, rain behind him</image>
<narration>And so the keeping passed on.</narration>
`;

const SCENES = [
	["image", "narration", "sound"],
	["video", "character", "music"],
	["image", "narration"],
];

function written(chunks: string[], assets: AssetElement[] = []): CanvasEditor {
	const editor = withNodeId(
		withScenes(withHead(withLayout(withReact(createEditor())))),
	);
	editor.defaultModels = () => ({});
	editor.children = assets;
	chunks.forEach(createScriptWriter(editor));
	return editor;
}

const scenes = (editor: CanvasEditor) =>
	shape(editor).filter(([first]) => !first?.startsWith("!"));

describe("a script streamed onto the canvas", () => {
	it("opens a scene at each visual as the text trickles in, adding no asset", () => {
		const editor = written(SCRIPT.match(/[^]{1,7}/g) ?? []);

		expect(getAssets(editor.children)).toEqual([]);
		expect(scenes(editor)).toEqual(SCENES);
	});

	it("forms the same scenes when it arrives in one piece", () => {
		expect(scenes(written([SCRIPT]))).toEqual(SCENES);
	});

	it("lands after the assets already on the canvas, which stay outside every scene", () => {
		const assets = [
			asset("asset_style", { text: "muted watercolor" }),
			asset("asset_character", { name: "Ayla", text: "a keeper" }),
		];

		const editor = written(SCRIPT.match(/[^]{1,7}/g) ?? [], assets);

		expect(editor.children.slice(1, 3)).toEqual(assets);
		expect(getAssets(editor.children)).toEqual(assets);
		expect(scenes(editor)).toEqual(SCENES);
	});

	it("replaces the empty narration a canvas of only its title and assets is seeded with", () => {
		const editor = written([]);
		editor.children = [createTitle("Moon"), asset("asset_style")];
		editor.normalize({ force: true });
		expect(scenes(editor)).toEqual([["narration"]]);

		createScriptWriter(editor)(SCRIPT);

		expect(scenes(editor)).toEqual(SCENES);
	});

	it("starts a blank project on one scene holding the welcome line", () => {
		const editor = written([BLANK_SCRIPT]);

		expect(scenes(editor)).toEqual([["narration"]]);
		expect(getContentElements(editor.children).map(getElementBodyText)).toEqual(
			[expect.stringContaining("Welcome to OpenSlop")],
		);
	});
});
