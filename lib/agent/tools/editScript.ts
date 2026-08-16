import { defineTool } from "./defineTool";
import { editScriptSpec } from "./specs";

export const editScriptTool = defineTool(
	editScriptSpec,
	async ({ ops }, ctx) => {
		const { applied, failures } = ctx.editScript(ops);
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
