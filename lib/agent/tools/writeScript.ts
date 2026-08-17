import type { AgentToolContext } from "./context";
import type { ToolInput } from "./specs";

export async function writeScript(
	{ brief }: ToolInput<"write_script">,
	ctx: AgentToolContext,
): Promise<string> {
	// The stream appends anything it cannot find by id, so a script left in
	// place would end up with the new one stacked under it.
	ctx.clearScript();
	await ctx.writeScript(brief);
	return "Wrote a new script onto the canvas. Read it to see what landed.";
}
