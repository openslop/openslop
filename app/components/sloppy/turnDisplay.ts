import type { AgentContentPart } from "@/lib/agent/types";

/**
 * What Sloppy is doing right now, read off how far its turn has got. A turn ends
 * at its tool call, so a call still means work: the canvas edit runs after.
 */
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

/** Past this the thought crowds the panel out, so it arrives shut. */
const LONG_THOUGHT = 600;

/**
 * A thought is worth reading while it is the newest thing in the turn. Once
 * Sloppy has moved on to a reply or an edit, it gets out of the way.
 */
export function thoughtOpen(superseded: boolean, text: string): boolean {
	return !superseded && text.length <= LONG_THOUGHT;
}
