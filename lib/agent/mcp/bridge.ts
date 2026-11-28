import maxBy from "lodash/maxBy";
import { z } from "zod";

export const MCP_PATH = "/api/mcp";

/** A user's open project tabs and their own agent meet on a private channel named for them. */
export const agentChannel = (userId: string) => `agent:${userId}`;

export const CALL = "call";
export const ANSWER = "answer";

export const BridgeCallSchema = z.object({
	id: z.uuid(),
	toolName: z.string(),
	input: z.unknown(),
});

export type BridgeCall = z.infer<typeof BridgeCallSchema>;

const BridgeOutcomeSchema = z.discriminatedUnion("ok", [
	z.object({ ok: z.literal(true), output: z.unknown() }),
	z.object({ ok: z.literal(false), errorText: z.string() }),
]);

export type BridgeOutcome = z.infer<typeof BridgeOutcomeSchema>;

export const BridgeAnswerSchema = z.object({
	id: z.uuid(),
	outcome: BridgeOutcomeSchema,
});

export type TabPresence = { openedAt: number };

/** The tab that runs a call: the one opened last, so two open tabs never both act. */
export function newestTab(
	state: Record<string, TabPresence[]>,
): string | undefined {
	return maxBy(Object.entries(state), ([, [tab]]) => tab.openedAt)?.[0];
}
