import {
	getToolName,
	isToolUIPart,
	safeValidateUIMessages,
	validateUIMessages,
	type LanguageModelUsage,
} from "ai";
import { SLOPPY_TOOLS, SNAPSHOT_TOOLS } from "./tools/specs";
import {
	sloppyMetadataSchema,
	type AgentUsage,
	type SloppyMessage,
	type SloppyMetadata,
} from "./types";

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

/** What the turn recorded on the steps before this one. */
export function carriedMetadata(
	messages: SloppyMessage[],
): SloppyMetadata | undefined {
	return trailingAssistant(messages)?.metadata;
}

export function toolsUsed(messages: SloppyMessage[]): Set<string> {
	const parts = trailingAssistant(messages)?.parts ?? [];
	return new Set(parts.filter(isToolUIPart).map(getToolName));
}

/** A call the editor has been handed and not yet answered. */
export function hasPendingToolCall(messages: SloppyMessage[]): boolean {
	return (trailingAssistant(messages)?.parts ?? []).some(
		(part) => isToolUIPart(part) && part.state === "input-available",
	);
}

export function addUsage(
	carried: AgentUsage | undefined,
	step: Pick<LanguageModelUsage, "inputTokens" | "outputTokens">,
	seconds: number,
): AgentUsage {
	return {
		inputTokens: (carried?.inputTokens ?? 0) + (step.inputTokens ?? 0),
		outputTokens: (carried?.outputTokens ?? 0) + (step.outputTokens ?? 0),
		workSeconds: (carried?.workSeconds ?? 0) + seconds,
	};
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
