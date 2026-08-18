import type { AgentToolContext } from "./context";
import type { ToolInput } from "./specs";

export async function setNarrator(
	traits: ToolInput<"set_narrator">,
	ctx: AgentToolContext,
): Promise<string> {
	ctx.setMetadata({ narration: traits });
	return "Set the narrator's voice.";
}
