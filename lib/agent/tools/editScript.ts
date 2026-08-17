import type { AgentToolContext } from "./context";
import type { ToolInput } from "./specs";

export async function editScript(
	{ ops }: ToolInput<"edit_script">,
	ctx: AgentToolContext,
): Promise<string> {
	const { applied, failures } = ctx.editScript(ops);
	if (failures.length === 0) {
		return `Applied ${applied} operation${applied === 1 ? "" : "s"}. The script has changed; read it again before editing further.`;
	}
	return [
		`Applied ${applied} of ${ops.length} operations.`,
		`Failed: ${failures.join("; ")}.`,
		"Read the script again before retrying; the ids you used may be stale.",
	].join(" ");
}
