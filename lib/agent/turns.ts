import type { AgentMessageRow, AgentRequestRecord, AgentUsage } from "./types";
import type { ModelMessage } from "ai";

/** A turn as the panel reads it */
export type Turn = {
	id: string;
	role: ModelMessage["role"];
	messages: ModelMessage[];
	request: AgentRequestRecord | null;
	usage: AgentUsage | null;
};

/** Folds consecutive agent rows into the turn they belong to. */
export function foldTurns(rows: AgentMessageRow[]): Turn[] {
	const turns: Turn[] = [];

	for (const row of rows) {
		const last = turns.at(-1);
		const shouldFold =
			row.message.role !== "user" && last && last.role !== "user";
		if (shouldFold) {
			last.messages.push(row.message);
		} else {
			turns.push({
				id: row.id,
				role: row.message.role,
				messages: [row.message],
				request: row.request,
				usage: row.usage,
			});
		}
	}

	return turns;
}
