import { defineTool } from "./defineTool";
import { writeScriptSpec } from "./specs";

export const writeScriptTool = defineTool(
	writeScriptSpec,
	async ({ brief }, ctx) => {
		await ctx.writeScript(brief);
		return "Wrote a new script onto the canvas.";
	},
);
