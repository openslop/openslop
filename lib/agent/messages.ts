import {
	getToolName,
	isToolUIPart,
	safeValidateUIMessages,
	validateUIMessages,
} from "ai";
import { SLOPPY_TOOLS, SNAPSHOT_TOOLS } from "./tools/specs";
import { sloppyMetadataSchema, type SloppyMessage } from "./types";

export function upsertMessage(
	messages: SloppyMessage[],
	message: SloppyMessage,
): SloppyMessage[] {
	const index = messages.findIndex((existing) => existing.id === message.id);
	if (index === -1) return [...messages, message];
	return messages.map((existing, at) => (at === index ? message : existing));
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
 * A reading describes a canvas that a later turn has since edited. The turn in
 * flight keeps all of its own, so its cached prefix never moves mid-loop.
 */
export function withoutStaleReadings(
	messages: SloppyMessage[],
): SloppyMessage[] {
	const current = messages.at(-1);
	return messages.map((message) =>
		message === current || message.role !== "assistant"
			? message
			: {
					...message,
					parts: message.parts.filter(
						(part) =>
							!isToolUIPart(part) || !SNAPSHOT_TOOLS.has(getToolName(part)),
					),
				},
	);
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
