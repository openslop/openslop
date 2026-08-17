import type { AgentToolContext } from "./context";

const EMPTY = "The canvas is empty.";

export async function readScript(ctx: AgentToolContext): Promise<string> {
	const script = ctx.readScript().trim();
	return script ? `\`\`\`osml\n${script}\n\`\`\`` : EMPTY;
}
