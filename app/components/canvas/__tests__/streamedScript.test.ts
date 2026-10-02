import { describe, expect, it } from "vitest";
import { createEditor } from "slate";
import { withReact } from "slate-react";
import { getElementBodyText } from "@/lib/canvas/osmlSerializer";
import { getContentElements } from "@/lib/canvas/scenes";
import type { CanvasEditor } from "@/lib/canvas/types";
import { createProjectStore } from "@/lib/project/store";
import { BLANK_SCRIPT } from "@/lib/project/serialize";
import { createScriptWriter } from "@/lib/script/scriptWriter";
import { withLayout } from "../plugins/withLayout";
import { withNodeId } from "../plugins/withNodeId";
import { withScenes } from "../plugins/withScenes";
import { shape } from "./fixtures";

const SCRIPT = `<metadata_title>The Lighthouse</metadata_title>
<image>A lighthouse at dusk, waves crashing</image>
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
	const defaultModels = () => ({});
	const editor = withNodeId(
		withScenes(withLayout(defaultModels)(withReact(createEditor()))),
	);
	chunks.forEach(
		createScriptWriter({ editor, store: createProjectStore(), defaultModels }),
	);
	return editor;
}

describe("a script streamed onto the canvas", () => {
	it("opens a scene at each visual as the text trickles in", () => {
		expect(shape(written(SCRIPT.match(/[^]{1,7}/g) ?? []))).toEqual(SCENES);
	});

	it("forms the same scenes when it arrives in one piece", () => {
		expect(shape(written([SCRIPT]))).toEqual(SCENES);
	});

	it("starts a blank project on one scene holding the welcome line", () => {
		const editor = written([BLANK_SCRIPT]);

		expect(shape(editor)).toEqual([["narration"]]);
		expect(getContentElements(editor.children).map(getElementBodyText)).toEqual(
			[expect.stringContaining("Welcome to OpenSlop")],
		);
	});
});
