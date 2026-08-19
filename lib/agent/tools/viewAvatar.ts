import type { AgentToolContext } from "./context";
import type { ToolInput } from "./specs";

export async function viewAvatar(
	{ name }: ToolInput<"view_avatar">,
	ctx: AgentToolContext,
): Promise<{ name: string; url: string }> {
	const url = ctx.avatarUrl(name);
	if (!url)
		throw new Error(
			`${name} has no avatar image yet. It appears once the avatar is uploaded or generated.`,
		);
	return { name, url };
}
