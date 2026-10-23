"use client";

import { useMemo, useRef } from "react";
import type { ReactNode } from "react";
import {
	DefaultChatTransport,
	lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { useChat } from "@ai-sdk/react";
import { agentPathFor } from "@/lib/agent/client";
import type { ModelRef } from "@/lib/connectors/types";
import { useDefaultModels } from "@/lib/connectors/use-default-models";
import { hasPendingToolCall, trailingAssistant } from "@/lib/agent/messages";
import { sloppyMetadataSchema, type SloppyMessage } from "@/lib/agent/types";
import { DRAFTING_TOOLS, type AgentToolName } from "@/lib/agent/tools/registry";
import { useAgentTools } from "@/lib/agent/tools/use-agent-tools";
import { useHandEdits } from "@/lib/agent/use-hand-edits";
import { createRequiredContext } from "@/lib/components/create-required-context";
import {
	useProjectId,
	useInitialTranscript,
} from "@/lib/project/project-provider";
import { toastError } from "@/lib/toast-error";

type SloppyControl = {
	send: (message: string) => void;
	stop: () => void;
	loading: boolean;
	writingScript: boolean;
};

// Split by update frequency: only the transcript changes per streamed token.
const [SloppyMessagesContext, useSloppyMessages] =
	createRequiredContext<SloppyMessage[]>("SloppyProvider");
const [SloppyControlContext, useSloppy] =
	createRequiredContext<SloppyControl>("SloppyProvider");

export { useSloppyMessages, useSloppy };

/**
 * The ReAct loop. A step ends at a tool call, the editor runs it against the
 * canvas, and the result goes straight back as the next step, until the model
 * answers with text instead of another call.
 */
export function SloppyProvider({ children }: { children: ReactNode }) {
	const projectId = useProjectId();
	const initialTranscript = useInitialTranscript();
	const runTool = useAgentTools();
	const model = useDefaultModels().llm;
	const turnModel = useRef<ModelRef>(undefined);
	// Stopping should also cancel the tool call in flight
	const turn = useRef<AbortController>(undefined);

	const { messages, sendMessage, stop, status, addToolOutput } =
		useChat<SloppyMessage>({
			messages: initialTranscript,
			messageMetadataSchema: sloppyMetadataSchema,
			// eslint-disable-next-line react-hooks/refs -- the SDK calls this per request, not per render
			transport: new DefaultChatTransport<SloppyMessage>({
				prepareSendMessagesRequest: ({ messages, body }) => {
					const picked = turnModel.current ?? model;
					return {
						api: agentPathFor(picked),
						body: {
							...body,
							projectId,
							message: messages.at(-1),
							...picked,
						},
					};
				},
			}),
			sendAutomaticallyWhen: (options) =>
				!turn.current?.signal.aborted &&
				lastAssistantMessageIsCompleteWithToolCalls(options),
			onToolCall: async ({ toolCall }) => {
				const outcome = await runTool(toolCall, turn.current?.signal);
				const call = {
					tool: toolCall.toolName as AgentToolName,
					toolCallId: toolCall.toolCallId,
				};
				addToolOutput(
					outcome.ok
						? { ...call, output: outcome.output }
						: { ...call, state: "output-error", errorText: outcome.errorText },
				);
			},
			onError: (error) => toastError(error, "Sloppy could not finish that"),
			throttle: 50,
		});

	const working =
		status === "submitted" ||
		status === "streaming" ||
		hasPendingToolCall(messages);
	const writingScript = hasPendingToolCall(messages, DRAFTING_TOOLS);
	const handEdits = useHandEdits(
		!working && trailingAssistant(messages) !== null,
	);

	const control = useMemo<SloppyControl>(
		() => ({
			send: (message) => {
				turnModel.current = model;
				turn.current = new AbortController();
				const edits = handEdits();
				void sendMessage({
					parts: [
						{ type: "text", text: message },
						...(edits
							? [{ type: "data-hand-edits" as const, data: edits }]
							: []),
					],
				});
			},
			stop: () => {
				turn.current?.abort();
				void stop();
			},
			loading: working,
			writingScript,
		}),
		[sendMessage, stop, working, writingScript, model, handEdits],
	);

	return (
		<SloppyControlContext value={control}>
			<SloppyMessagesContext value={messages}>{children}</SloppyMessagesContext>
		</SloppyControlContext>
	);
}
