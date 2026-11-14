import { NextRequest } from "next/server";
import { z } from "zod";
import { createSessionRouteHandler } from "@/lib/api/route-handler";
import { agentTurnSchema, streamAgentTurn } from "@/lib/api/agent-turn";
import { ownsProject } from "@/lib/api/projects";
import { badRequest, notFound } from "@/lib/api/response";
import { parseSloppyMessage } from "@/lib/agent/messages";
import { localClaudeAccess } from "@/lib/local-claude/access";
import { LocalClaudeProvider } from "@/lib/local-claude/provider";

const agent = createSessionRouteHandler({
	schema: agentTurnSchema(
		z.object({
			provider: z.literal("claude-code"),
			model: z.literal("Claude subscription"),
		}),
	),
	label: "Local Claude conversation",
	handle: async ({ user, input, request }) => {
		if (!(await ownsProject(input.projectId))) return notFound();
		const message = await parseSloppyMessage(input.message);
		if (!message) return badRequest("Invalid message");
		return streamAgentTurn({
			...input,
			message,
			userId: user.id,
			recordSpend: async () => {},
			llm: async () => new LocalClaudeProvider(user.id, request.signal),
		});
	},
});
export async function POST(request: NextRequest) {
	return localClaudeAccess(request) ?? agent(request);
}
