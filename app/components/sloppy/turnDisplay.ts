import { isStaticToolUIPart, isTextUIPart } from "ai";
import type { SloppyMessage } from "@/lib/agent/types";

export type TurnPart = SloppyMessage["parts"][number];

/** The editor runs a call after the model emits it, so a call still means work. */
export function turnStatus(parts: TurnPart[]): string {
	const last = parts.at(-1);
	if (last && isTextUIPart(last)) return "Responding";
	if (last && isStaticToolUIPart(last) && last.state === "input-available") {
		return "Applying changes";
	}
	return "Slopping…";
}

export function userText(message: SloppyMessage): string {
	return message.parts
		.filter(isTextUIPart)
		.map((part) => part.text)
		.join("\n");
}

const LONG_REASONING = 600;

/** Opening is a live-streaming affordance, so a restored thought stays shut whatever state it was stored in. */
export function reasoningOpen(
	live: boolean,
	superseded: boolean,
	text: string,
): boolean {
	return live && !superseded && text.length <= LONG_REASONING;
}
