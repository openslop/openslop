import {
	modelMessageSchema,
	type AssistantContent,
	type ModelMessage,
	type ToolCallPart,
	type ToolResultPart,
} from "ai";

/**
 * A turn, stored exactly as the model layer takes it. Nothing is converted on
 * the way in or out, so a vendor that signs its thinking blocks gets them back
 * byte for byte.
 */
export type AgentMessage = ModelMessage;

export const agentMessageSchema = modelMessageSchema;

export type AgentUsage = {
	inputTokens: number;
	outputTokens: number;
	/** Absent on turns recorded before the model layer reported thinking time. */
	thoughtSeconds?: number;
	/** The model call end to end. Excludes the canvas edit, which the client runs. */
	workSeconds?: number;
};

export type AgentRequestRecord = { system: string; model: string };

export type AgentMessageRow = {
	id: string;
	message: AgentMessage;
	request: AgentRequestRecord | null;
	usage: AgentUsage | null;
};

/**
 * The panel renders a streaming turn and the row it becomes with one component,
 * so the stream carries every fact the stored row will hold.
 */
export type AgentStreamPart =
	| { type: "request"; request: AgentRequestRecord }
	| { type: "text-delta"; text: string }
	| { type: "reasoning-delta"; text: string }
	| { type: "reasoning-end"; seconds: number }
	| { type: "tool-call"; toolCallId: string; toolName: string; input: unknown }
	| { type: "error"; message: string }
	| { type: "finish"; usage: AgentUsage };

export type AgentContentPart =
	| Exclude<AssistantContent, string>[number]
	| ToolResultPart;

/** Content is a bare string on simple turns; the panel only ever renders parts. */
export function messageParts(message: AgentMessage): AgentContentPart[] {
	if (typeof message.content === "string") {
		return message.content ? [{ type: "text", text: message.content }] : [];
	}
	return message.content as AgentContentPart[];
}

export function toolResultText(output: ToolResultPart["output"]): string {
	return "value" in output && typeof output.value === "string"
		? output.value
		: JSON.stringify(output);
}

export function isToolFailure(output: ToolResultPart["output"]): boolean {
	return output.type.startsWith("error");
}

/**
 * Tool calls with no result after them. A closed tab leaves one behind, and a
 * vendor rejects a history that contains an unanswered call.
 */
export function pendingToolCalls(messages: AgentMessage[]): ToolCallPart[] {
	const settled = new Set<string>();
	const calls: ToolCallPart[] = [];

	for (const message of messages) {
		for (const part of messageParts(message)) {
			if (part.type === "tool-result") settled.add(part.toolCallId);
			if (part.type === "tool-call") calls.push(part);
		}
	}

	return calls.filter((call) => !settled.has(call.toolCallId));
}
