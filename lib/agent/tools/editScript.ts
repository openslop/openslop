import { applyRefineOps } from "@/lib/script/refine/applyOps";
import { defineTool } from "./defineTool";
import { editScriptSpec } from "./specs";

export const editScriptTool = defineTool(
	editScriptSpec,
	async ({ ops }, ctx) => {
		const { applied, failures } = applyRefineOps(
			ctx.editor,
			ops,
			ctx.connectors,
		);
		if (failures.length === 0) {
			return `Applied ${applied} operation${applied === 1 ? "" : "s"}.`;
		}
		return [
			`Applied ${applied} of ${ops.length} operations.`,
			`Failed: ${failures.join("; ")}.`,
			"Re-read the script before retrying; the canvas may have changed.",
		].join(" ");
	},
);
