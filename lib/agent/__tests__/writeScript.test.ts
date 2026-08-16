import { describe, expect, it } from "vitest";
import { createEditor } from "slate";
import { ZERO_WIDTH_SPACE } from "@/lib/canvas/constants";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { writeScriptOnto } from "../tools/useAgentTools";

function narration(id: string, text: string): CanvasContentElement {
	return {
		id,
		type: "narration",
		children: [
			{ id: `${id}-m`, type: "narration", text: ZERO_WIDTH_SPACE },
			{ id: `${id}-t`, type: "narration", text },
		],
	};
}

describe("writeScriptOnto", () => {
	it("clears the canvas before streaming, so the new script does not stack", async () => {
		const editor = createEditor();
		editor.children = [narration("n1", "the old story")];
		let childrenWhenWriting: unknown[] = [narration("unset", "")];

		await writeScriptOnto(editor, "a new story", async () => {
			childrenWhenWriting = [...editor.children];
		});

		expect(childrenWhenWriting).toEqual([]);
	});
});
