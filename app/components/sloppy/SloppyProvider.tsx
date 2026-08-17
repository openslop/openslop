"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Editor } from "slate";
import {
	DefaultChatTransport,
	lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { Chat, useChat } from "@ai-sdk/react";
import { AGENT_PATH, loadAgentTranscript } from "@/lib/agent/client";
import { hasPendingToolCall } from "@/lib/agent/messages";
import { sloppyMetadataSchema, type SloppyMessage } from "@/lib/agent/types";
import { useAgentTools } from "@/lib/agent/tools/useAgentTools";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import { useConfig } from "@/lib/config/ConfigProvider";
import { spokenLanguage } from "@/lib/connectors/llm/plugins/language-prompt";
import { useProjectStoreHandle } from "@/lib/project/ProjectStoreProvider";
import { toastError } from "@/lib/toastError";

type SloppyControl = {
	send: (message: string, model?: string) => void;
	stop: () => void;
	/** The turn is not finished: streaming, or running the tools it asked for. */
	loading: boolean;
	/** Only the stream can be stopped; the tool calls it asked for run to the end. */
	streaming: boolean;
};

// Split by update frequency: only the transcript changes per streamed token.
const [SloppyMessagesContext, useSloppyMessages] = createRequiredContext<
	SloppyMessage[] | null
>("SloppyProvider");
const [SloppyControlContext, useSloppy] =
	createRequiredContext<SloppyControl>("SloppyProvider");

export { useSloppyMessages, useSloppy };

/**
 * The chat is built once and outlives a rebound canvas, so a step looks the
 * executor up when it runs rather than closing over the one it opened with.
 */
function useToolRunner(editor: Editor) {
	const runTool = useAgentTools(editor);
	const latest = useRef(runTool);
	useEffect(() => {
		latest.current = runTool;
	}, [runTool]);

	return useCallback(
		(call: { toolName: string; input: unknown }) => latest.current(call),
		[],
	);
}

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
export function SloppyProvider({
	editor,
	children,
}: {
	editor: Editor;
	children: ReactNode;
}) {
	const { projectId } = useConfig();
	const store = useProjectStoreHandle();
	const runTool = useToolRunner(editor);
	const restored = useTranscript(projectId);

	const chat = useMemo(() => {
		const chat: Chat<SloppyMessage> = new Chat({
			messageMetadataSchema: sloppyMetadataSchema,
			transport: new DefaultChatTransport<SloppyMessage>({
				api: AGENT_PATH,
				// Only the newest message travels; the server reads the rest of the
				// turn from the conversation it already stores.
				prepareSendMessagesRequest: ({ messages, body }) => ({
					body: { ...body, projectId, message: messages.at(-1) },
				}),
			}),
			sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
			onToolCall: async ({ toolCall }) => {
				const outcome = await runTool(toolCall);
				const call = {
					tool: toolCall.toolName,
					toolCallId: toolCall.toolCallId,
				};
				chat.addToolOutput(
					outcome.ok
						? { ...call, output: outcome.output }
						: { ...call, state: "output-error", errorText: outcome.errorText },
				);
			},
			onError: (error) => toastError(error, "Sloppy could not finish that"),
		});
		return chat;
	}, [projectId, runTool]);

	// A turn is one message that grows a part at a time, so an unthrottled chat
	// re-renders the whole panel per streamed token.
	const { messages, sendMessage, stop, status } = useChat({
		chat,
		throttle: 50,
	});

	const streaming = status === "submitted" || status === "streaming";
	const working = streaming || hasPendingToolCall(messages);
	const control = useMemo<SloppyControl>(
		() => ({
			send: (message, model) =>
				void sendMessage(
					{ text: message },
					{
						body: {
							model,
							language: spokenLanguage(store.getState().metadata, ""),
						},
					},
				),
			stop,
			loading: working,
			streaming,
		}),
		[sendMessage, stop, streaming, working, store],
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
