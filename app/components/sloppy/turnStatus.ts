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
			return "Thinking";
	}
}
