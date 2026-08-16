import type { AssistantModelMessage, ToolCallPart } from "ai";
import type { AgentRequestRecord, AgentStreamPart } from "./types";

type AssistantParts = Exclude<AssistantModelMessage["content"], string>;

/** The turn being streamed, in the shape the panel renders a stored one from. */
export type LiveTurn = {
	user: string;
	parts: AssistantParts;
	request: AgentRequestRecord | null;
	/** Null until the model reports how long it thought. */
	thoughtSeconds: number | null;
};

export const emptyTurn = (user: string): LiveTurn => ({
	user,
	parts: [],
	request: null,
	thoughtSeconds: null,
});

export const toolCallsIn = (turn: LiveTurn): ToolCallPart[] =>
	turn.parts.filter((part) => part.type === "tool-call");

/** Grows the trailing text or reasoning part, so deltas become one part, not many. */
function withDelta(
	parts: AssistantParts,
	type: "text" | "reasoning",
	text: string,
): AssistantParts {
	const last = parts.at(-1);
	if (last?.type === type) {
		return [...parts.slice(0, -1), { ...last, text: last.text + text }];
	}
	return [...parts, { type, text }];
}

/** Folds one streamed part into the turn. Returns `turn` when nothing changed. */
export function reduceTurn(turn: LiveTurn, part: AgentStreamPart): LiveTurn {
	switch (part.type) {
		case "request":
			return { ...turn, request: part.request };
		case "reasoning-delta":
			return {
				...turn,
				parts: withDelta(turn.parts, "reasoning", part.text),
			};
		case "reasoning-end":
			return { ...turn, thoughtSeconds: part.seconds };
		case "text-delta":
			return {
				...turn,
				parts: withDelta(turn.parts, "text", part.text),
			};
		case "tool-call":
			return {
				...turn,
				parts: [
					...turn.parts,
					{
						type: "tool-call",
						toolCallId: part.toolCallId,
						toolName: part.toolName,
						input: part.input,
					},
				],
			};
		default:
			return turn;
	}
}
