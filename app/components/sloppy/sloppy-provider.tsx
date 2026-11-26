"use client";

import { useMemo, useRef, type ReactNode } from "react";
import {
	DefaultChatTransport,
	lastAssistantMessageIsCompleteWithToolCalls,
	type HttpChatTransportInitOptions,
} from "ai";
import { useChat } from "@ai-sdk/react";
import type { Editor } from "slate";
import { useSlateStatic } from "slate-react";
import { agentPathFor } from "@/lib/agent/client";
import { tapToolInputText } from "@/lib/agent/tap-tool-input";
import type { ModelRef } from "@/lib/connectors/types";
import { useDefaultModels } from "@/lib/connectors/use-default-models";
import {
	hasPendingToolCall,
	settleUnansweredCalls,
} from "@/lib/agent/messages";
import { sloppyMetadataSchema, type SloppyMessage } from "@/lib/agent/types";
import {
	DRAFTING_TOOLS,
	SCRIPT_STREAM_FIELDS,
	type AgentToolName,
} from "@/lib/agent/tools/registry";
import { useAgentTools } from "@/lib/agent/tools/use-agent-tools";
import { createRequiredContext } from "@/lib/components/create-required-context";
import { createScriptSink } from "@/lib/script/script-writer";
import {
	useProjectId,
	useInitialTranscript,
} from "@/lib/project/project-provider";
import { toastError } from "@/lib/toast-error";

const STOPPED_TEXT = "Stopped by you before the editor finished it";

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

/** Writes each script-streaming call onto the canvas while its OSML is still streaming in. */
class SloppyTransport extends DefaultChatTransport<SloppyMessage> {
	private readonly editor: Editor;

	constructor(
		editor: Editor,
		options: HttpChatTransportInitOptions<SloppyMessage>,
	) {
		super(options);
		this.editor = editor;
	}

	protected processResponseStream(stream: ReadableStream<Uint8Array>) {
		return super
			.processResponseStream(stream)
			.pipeThrough(
				tapToolInputText(SCRIPT_STREAM_FIELDS, () =>
					createScriptSink(this.editor),
				),
			);
	}
}

/**
 * The ReAct loop. A step ends at a tool call, the editor runs it against the
 * canvas, and the result goes straight back as the next step, until the model
 * answers with text instead of another call.
 */
export function SloppyProvider({ children }: { children: ReactNode }) {
	const projectId = useProjectId();
	const initialTranscript = useInitialTranscript();
	const editor = useSlateStatic();
	const runTool = useAgentTools();
	const model = useDefaultModels().llm;
	const turnModel = useRef<ModelRef>(undefined);
	// Stopping drops the output of a tool call still in flight
	const turn = useRef<AbortController>(undefined);

	const { messages, sendMessage, setMessages, stop, status, addToolOutput } =
		useChat<SloppyMessage>({
			messages: initialTranscript,
			messageMetadataSchema: sloppyMetadataSchema,
			// eslint-disable-next-line react-hooks/refs -- the SDK calls this per request, not per render
			transport: new SloppyTransport(editor, {
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
			// Not awaited: the SDK awaits each call in turn, so this runs a step's calls together.
			onToolCall: ({ toolCall }) => {
				const signal = turn.current?.signal;
				const call = {
					tool: toolCall.toolName as AgentToolName,
					toolCallId: toolCall.toolCallId,
				};
				void runTool(toolCall).then((outcome) => {
					if (signal?.aborted) return;
					addToolOutput(
						outcome.ok
							? { ...call, output: outcome.output }
							: {
									...call,
									state: "output-error",
									errorText: outcome.errorText,
								},
					);
				});
			},
			onFinish: ({ isAbort, isDisconnect, isError }) => {
				if (isAbort || isDisconnect || isError)
					setMessages((current) => settleUnansweredCalls(current));
			},
			onError: (error) => toastError(error, "Sloppy could not finish that"),
			throttle: 50,
		});

	const loading =
		status === "submitted" ||
		status === "streaming" ||
		hasPendingToolCall(messages);
	const writingScript = hasPendingToolCall(messages, DRAFTING_TOOLS);
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
				setMessages((current) => settleUnansweredCalls(current, STOPPED_TEXT));
			},
			loading,
			writingScript,
		}),
		[sendMessage, setMessages, stop, loading, writingScript, model],
	);

	return (
		<SloppyControlContext value={control}>
			<SloppyMessagesContext value={messages}>{children}</SloppyMessagesContext>
		</SloppyControlContext>
	);
}
