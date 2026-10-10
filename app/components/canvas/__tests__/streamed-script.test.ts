import { describe, expect, it } from "vitest";
import { createEditor } from "slate";
import { withReact } from "slate-react";
import { asset } from "@/lib/canvas/__tests__/_assets";
import { getElementBodyText } from "@/lib/canvas/osml-serializer";
import { getContentElements } from "@/lib/canvas/scenes";
import type { CanvasEditor } from "@/lib/canvas/types";
import { createScriptWriter } from "@/lib/script/script-writer";
import { withAssets } from "../plugins/with-assets";
import { withLayout } from "../plugins/with-layout";
import { withNodeId } from "../plugins/with-node-id";
import { withScenes } from "../plugins/with-scenes";
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

function written(chunks: string[]): CanvasEditor {
	const editor = withNodeId(
		withScenes(withAssets(withLayout(withReact(createEditor())))),
	);
	editor.defaultModels = () => ({});
	chunks.forEach(createScriptWriter(editor));
	return editor;
}

const scenes = (editor: CanvasEditor) =>
	shape(editor).filter(([first]) => !first?.startsWith("!"));

describe("a script streamed onto the canvas", () => {
	it("opens a scene at each visual as the text trickles in", () => {
		expect(scenes(written(SCRIPT.match(/[^]{1,7}/g) ?? []))).toEqual(SCENES);
	});

	it("forms the same scenes when it arrives in one piece", () => {
		expect(scenes(written([SCRIPT]))).toEqual(SCENES);
	});

	it("clears the script already on the canvas as soon as it starts", () => {
		const editor = written(["<narration>An old draft.</narration>"]);
		const write = createScriptWriter(editor);
		expect(getContentElements(editor.children).map(getElementBodyText)).toEqual(
			[""],
		);

		write(SCRIPT);
		expect(scenes(editor)).toEqual(SCENES);
	});

	it("replaces the empty narration a canvas of only assets is seeded with", () => {
		const editor = written([]);
		editor.children = [asset("asset_style")];
		editor.normalize({ force: true });
		expect(scenes(editor)).toEqual([["narration"]]);

		createScriptWriter(editor)(SCRIPT);

		expect(scenes(editor)).toEqual(SCENES);
	});
});
