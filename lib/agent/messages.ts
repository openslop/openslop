import {
	getToolName,
	isToolUIPart,
	safeValidateUIMessages,
	validateUIMessages,
	type ModelMessage,
	type ToolResultPart,
} from "ai";
import {
	retentionOf,
	SCRIPT_STREAM_FIELDS,
	SLOPPY_TOOLS,
} from "./tools/registry";
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

type ToolPart = Extract<SloppyMessage["parts"][number], { toolCallId: string }>;

const isPending = (part: ToolPart) =>
	isUnanswered(part) ||
	(part.state === "input-streaming" &&
		SCRIPT_STREAM_FIELDS.has(getToolName(part)));

/** A call handed to the editor and not yet answered, or writing the canvas as it streams in, of any tool or of `tools`. */
export function hasPendingToolCall(
	messages: SloppyMessage[],
	tools?: ReadonlySet<string>,
): boolean {
	return (trailingAssistant(messages)?.parts ?? [])
		.filter(isToolUIPart)
		.some(
			(part) => isPending(part) && (!tools || tools.has(getToolName(part))),
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

const cleared = (part: ToolResultPart): ToolResultPart => ({
	...part,
	output: { type: "text", value: "[Old tool result content cleared]" },
});

type LatestByTool = ReadonlyMap<string, ToolResultPart>;

const isStale = (part: ToolResultPart, latest: LatestByTool) => {
	switch (retentionOf(part.toolName)) {
		case "always":
			return false;
		case "turn":
			return true;
		case "latest":
			return part !== latest.get(part.toolName);
	}
};

const pruneFinished = (
	message: ModelMessage,
	latest: LatestByTool,
): ModelMessage => {
	if (message.role === "assistant" && typeof message.content !== "string")
		return {
			...message,
			content: message.content.filter((part) => part.type !== "reasoning"),
		};
	if (message.role === "tool")
		return {
			...message,
			content: message.content.map((part) =>
				part.type === "tool-result" && isStale(part, latest)
					? cleared(part)
					: part,
			),
		};
	return message;
};

/** Before the last user message is history: drop its reasoning and stale tool output. */
export function pruneTranscript(messages: ModelMessage[]): ModelMessage[] {
	const currentTurnStart = messages.findLastIndex(
		(message) => message.role === "user",
	);
	const latest: LatestByTool = new Map(
		messages
			.slice(0, currentTurnStart)
			.flatMap((message) => (message.role === "tool" ? message.content : []))
			.filter((part) => part.type === "tool-result")
			.map((part) => [part.toolName, part]),
	);
	return messages.map((message, index) =>
		index < currentTurnStart ? pruneFinished(message, latest) : message,
	);
}

// Optional: the message a turn opens with carries no metadata yet.
const metadataSchema = sloppyMetadataSchema.optional();

/** Rows the server wrote, never held to today's tools; a row it cannot read back is a broken transcript, not a 400. */
export async function parseSloppyMessages(
	messages: unknown[],
): Promise<SloppyMessage[]> {
	// The validator refuses an empty array; a new conversation is one.
	if (messages.length === 0) return [];
	return validateUIMessages<SloppyMessage>({ messages, metadataSchema });
}

/** One message off the wire. Null is the caller's 400, never a thrown 500. */
export async function parseSloppyMessage(
	message: unknown,
): Promise<SloppyMessage | null> {
	const parsed = await safeValidateUIMessages<SloppyMessage>({
		messages: [message],
		metadataSchema,
		tools: SLOPPY_TOOLS,
	});
	return parsed.success ? (parsed.data[0] ?? null) : null;
}
