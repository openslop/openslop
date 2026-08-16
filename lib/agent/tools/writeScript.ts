import { defineTool } from "./defineTool";
import { writeScriptSpec } from "./specs";

export const writeScriptTool = defineTool(
	writeScriptSpec,
	async ({ brief }, ctx) => {
		// The stream appends anything it cannot find by id, so a script left in
		// place would end up with the new one stacked under it.
		ctx.clearScript();
		await ctx.writeScript(brief);
		return "Wrote a new script onto the canvas.";
	},
);
