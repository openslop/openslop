import type { AgentToolContext } from "./context";
import type { ToolInput } from "./specs";

export async function setMetadata(
	{ title, style }: ToolInput<"set_metadata">,
	ctx: AgentToolContext,
): Promise<string> {
	ctx.setMetadata({
		...(title !== undefined && { title }),
		...(style !== undefined && { style }),
	});

	const changed = [
		title !== undefined && "title",
		style !== undefined && "art style",
	].filter(Boolean);

	return `Set the ${changed.join(" and ")}.`;
}
