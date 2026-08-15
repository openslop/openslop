import { describe, expect, it } from "vitest";
import { createEditor } from "slate";
import { ZERO_WIDTH_SPACE } from "@/lib/canvas/constants";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { DEFAULT_CONNECTOR_REGISTRY } from "@/lib/connectors/registry";
import { writeScriptTool } from "../tools/writeScript";

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

describe("writeScriptTool", () => {
	it("clears the canvas before streaming, so the new script does not stack", async () => {
		const editor = createEditor();
		editor.children = [narration("n1", "the old story")];
		let childrenWhenWriting: unknown[] = [narration("unset", "")];

		await writeScriptTool.execute(
			{ brief: "a new story" },
			{
				editor,
				connectors: DEFAULT_CONNECTOR_REGISTRY,
				writeScript: async () => {
					childrenWhenWriting = [...editor.children];
				},
			},
		);

		expect(childrenWhenWriting).toEqual([]);
	});
});
