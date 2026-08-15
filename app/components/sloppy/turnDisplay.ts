import type { AgentContentPart } from "@/lib/agent/types";

/** A turn ends at its tool call, so a call still means work: the edit runs after. */
export function turnStatus(parts: AgentContentPart[]): string {
	switch (parts.at(-1)?.type) {
		case "text":
			return "Responding";
		case "tool-call":
			return "Applying changes";
		default:
			return "Slopping…";
	}
}

const LONG_THOUGHT = 600;

export function thoughtOpen(superseded: boolean, text: string): boolean {
	return !superseded && text.length <= LONG_THOUGHT;
}
