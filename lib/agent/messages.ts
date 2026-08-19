import {
	getToolName,
	isToolUIPart,
	safeValidateUIMessages,
	validateUIMessages,
} from "ai";
import { SLOPPY_TOOLS, SNAPSHOT_TOOLS } from "./tools/registry";
import { sloppyMetadataSchema, type SloppyMessage } from "./types";

export function upsertMessage(
	messages: SloppyMessage[],
	message: SloppyMessage,
): SloppyMessage[] {
	const index = messages.findIndex((existing) => existing.id === message.id);
	return index === -1 ? [...messages, message] : messages.with(index, message);
}

function trailingAssistant(messages: SloppyMessage[]): SloppyMessage | null {
	const last = messages.at(-1);
	return last?.role === "assistant" ? last : null;
}

export function toolCallsMade(messages: SloppyMessage[]): number {
	return (trailingAssistant(messages)?.parts ?? []).filter(isToolUIPart).length;
}

/** A call the editor has been handed and not yet answered, of any tool or of `tools`. */
export function hasPendingToolCall(
	messages: SloppyMessage[],
	tools?: ReadonlySet<string>,
): boolean {
	return (trailingAssistant(messages)?.parts ?? []).some(
		(part) =>
			isToolUIPart(part) &&
			part.state === "input-available" &&
			(!tools || tools.has(getToolName(part))),
	);
}

/**
 * Remove all prior reasoning blocks and snapshots tool results
 */
export function pruneTranscript(messages: SloppyMessage[]): SloppyMessage[] {
	return messages.map((message, idx) => {
		if (idx !== messages.length - 1 && message.role === "assistant") {
			return {
				...message,
				parts: message.parts.filter((part) => {
					if (part.type === "reasoning") {
						return false;
					}
					return !(isToolUIPart(part) && SNAPSHOT_TOOLS.has(getToolName(part)));
				}),
			};
		}
		return message;
	});
}

// Optional: the message a turn opens with carries no metadata yet, and the
// validator checks the field whether or not it is there.
const shape = {
	metadataSchema: sloppyMetadataSchema.optional(),
	tools: SLOPPY_TOOLS,
};

/** Rows the server wrote. A row it cannot read back is a broken transcript, not a 400. */
export async function parseSloppyMessages(
	messages: unknown[],
): Promise<SloppyMessage[]> {
	// The validator refuses an empty array; a new conversation is one.
	if (messages.length === 0) return [];
	return validateUIMessages<SloppyMessage>({ messages, ...shape });
}

/** One message off the wire. Null is the caller's 400, never a thrown 500. */
export async function parseSloppyMessage(
	message: unknown,
): Promise<SloppyMessage | null> {
	const parsed = await safeValidateUIMessages<SloppyMessage>({
		messages: [message],
		...shape,
	});
	return parsed.success ? (parsed.data[0] ?? null) : null;
}
