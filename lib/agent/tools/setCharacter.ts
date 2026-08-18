import type { AgentToolContext } from "./context";
import type { ToolInput } from "./specs";

export async function setCharacter(
	{ name, ...patch }: ToolInput<"set_character">,
	ctx: AgentToolContext,
): Promise<string> {
	const settled = ctx.setCharacter(name, patch);

	return settled.created
		? `Added ${settled.name}. Its avatar has not been generated yet.`
		: `Changed ${settled.name}.`;
}
