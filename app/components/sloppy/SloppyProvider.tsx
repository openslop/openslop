"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useSlateStatic } from "slate-react";
import {
	DefaultChatTransport,
	lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { useChat } from "@ai-sdk/react";
import { AGENT_PATH, loadAgentTranscript } from "@/lib/agent/client";
import { hasPendingToolCall } from "@/lib/agent/messages";
import { sloppyMetadataSchema, type SloppyMessage } from "@/lib/agent/types";
import { SCRIPT_TOOLS, type AgentToolName } from "@/lib/agent/tools/registry";
import { useAgentTools } from "@/lib/agent/tools/useAgentTools";
import { useAgentContext } from "@/lib/agent/projectContext";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import { useConfig } from "@/lib/config/ConfigProvider";
import { toastError } from "@/lib/toastError";
import { useSloppyModel } from "./SloppyModelProvider";

type SloppyControl = {
	send: (message: string) => void;
	stop: () => void;
	loading: boolean;
	writingScript: boolean;
};

// Split by update frequency: only the transcript changes per streamed token.
const [SloppyMessagesContext, useSloppyMessages] = createRequiredContext<
	SloppyMessage[] | null
>("SloppyProvider");
const [SloppyControlContext, useSloppy] =
	createRequiredContext<SloppyControl>("SloppyProvider");

export { useSloppyMessages, useSloppy };

/**
 * The stored transcript. Null until it is known, which is what draws the
 * skeleton. One project per mount: the route keys the editor on its id.
 */
function useTranscript(projectId: string): SloppyMessage[] | null {
	const [restored, setRestored] = useState<SloppyMessage[] | null>(null);

	useEffect(() => {
		let current = true;
		loadAgentTranscript(projectId)
			.then((messages) => {
				if (current) setRestored(messages);
			})
			.catch((error) => {
				toastError(error, "Could not load Sloppy");
				if (current) setRestored([]);
			});
		return () => {
			current = false;
		};
	}, [projectId]);

	return restored;
}

/**
 * The ReAct loop. A step ends at a tool call, the editor runs it against the
 * canvas, and the result goes straight back as the next step, until the model
 * answers with text instead of another call.
 */
export function SloppyProvider({ children }: { children: ReactNode }) {
	const editor = useSlateStatic();
	const { projectId } = useConfig();
	const runTool = useAgentTools(editor);
	const readContext = useAgentContext(editor);
	const restored = useTranscript(projectId);
	const { model } = useSloppyModel();
	const turnModel = useRef<string>(undefined);
	// Stopping should also cancel the tool call in flight
	const turn = useRef<AbortController>(undefined);

	const { messages, sendMessage, stop, status, addToolOutput } =
		useChat<SloppyMessage>({
			messageMetadataSchema: sloppyMetadataSchema,
			// eslint-disable-next-line react-hooks/refs -- the SDK calls this per request, not per render
			transport: new DefaultChatTransport<SloppyMessage>({
				api: AGENT_PATH,
				prepareSendMessagesRequest: ({ messages, body }) => ({
					body: {
						...body,
						projectId,
						message: messages.at(-1),
						context: readContext(),
						model: turnModel.current,
					},
				}),
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
	const writingScript = hasPendingToolCall(messages, SCRIPT_TOOLS);
	const control = useMemo<SloppyControl>(
		() => ({
			send: (message) => {
				turnModel.current = model;
				turn.current = new AbortController();
				void sendMessage({ text: message });
			},
			stop: () => {
				turn.current?.abort();
				void stop();
			},
			loading: working,
			writingScript,
		}),
		[sendMessage, stop, working, writingScript, model],
	);

	// History sits in front of the chat's own turns rather than being written
	// into it, so a brief sent while it was still loading keeps its place.
	const transcript = useMemo(
		() => (restored ? [...restored, ...messages] : null),
		[restored, messages],
	);

	return (
		<SloppyControlContext value={control}>
			<SloppyMessagesContext value={transcript}>
				{children}
			</SloppyMessagesContext>
		</SloppyControlContext>
	);
}
