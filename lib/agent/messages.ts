import {
	getToolName,
	isToolUIPart,
	safeValidateUIMessages,
	validateUIMessages,
	type ModelMessage,
	type ToolContent,
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

export function trailingAssistant(
	messages: SloppyMessage[],
): SloppyMessage | null {
	const last = messages.at(-1);
	return last?.role === "assistant" ? last : null;
}

export function toolCallsMade(messages: SloppyMessage[]): number {
	return (trailingAssistant(messages)?.parts ?? []).filter(isToolUIPart).length;
}

const isUnanswered = (part: SloppyMessage["parts"][number]) =>
	isToolUIPart(part) && part.state === "input-available";

/** A call the editor has been handed and not yet answered, of any tool or of `tools`. */
export function hasPendingToolCall(
	messages: SloppyMessage[],
	tools?: ReadonlySet<string>,
): boolean {
	return (trailingAssistant(messages)?.parts ?? []).some(
		(part) => isUnanswered(part) && (!tools || tools.has(getToolName(part))),
	);
}

const UNANSWERED = "Stopped before the editor ran it";

/** A call the editor never answered, settled with `errorText` so nothing waits on it. Covers a turn stopped mid-call, including one reloaded from storage. */
export function settleUnansweredCalls(
	messages: SloppyMessage[],
	errorText = UNANSWERED,
): SloppyMessage[] {
	return messages.map((message) => ({
		...message,
		parts: message.parts.map((part) =>
			isUnanswered(part) ? { ...part, state: "output-error", errorText } : part,
		),
	}));
}

const STALE_SNAPSHOT =
	"Taken in an earlier turn and not kept. The canvas may have changed since.";

const withStaleSnapshot = (part: ToolContent[number]) =>
	part.type === "tool-result" && SNAPSHOT_TOOLS.has(part.toolName)
		? { ...part, output: { type: "text" as const, value: STALE_SNAPSHOT } }
		: part;

const pruneFinished = (message: ModelMessage): ModelMessage => {
	if (message.role === "assistant" && typeof message.content !== "string")
		return {
			...message,
			content: message.content.filter((part) => part.type !== "reasoning"),
		};
	if (message.role === "tool")
		return { ...message, content: message.content.map(withStaleSnapshot) };
	return message;
};

/**
 * Before the last user message is history: snapshot calls stay but their output
 * goes, and so does reasoning, which no model reads back from an earlier turn.
 */
export function pruneTranscript(messages: ModelMessage[]): ModelMessage[] {
	const inFlightFrom = messages.findLastIndex(
		(message) => message.role === "user",
	);
	return messages.map((message, index) =>
		index < inFlightFrom ? pruneFinished(message) : message,
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
