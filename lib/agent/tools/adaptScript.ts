import type { AgentToolContext } from "./context";
import type { ToolInput } from "./specs";

export async function adaptScript(
	{ script }: ToolInput<"adapt_script">,
	ctx: AgentToolContext,
): Promise<string> {
	await ctx.adaptScript(script);
	return "Put that script onto the canvas. Read it to see what landed.";
}
