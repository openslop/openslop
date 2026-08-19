import type { AgentToolContext } from "./context";
import type { ToolInput } from "./specs";

export async function writeScript(
	{ brief }: ToolInput<"write_script">,
	ctx: AgentToolContext,
): Promise<string> {
	await ctx.writeScript(brief);
	return "Wrote a new script onto the canvas. Read it to see what landed.";
}
