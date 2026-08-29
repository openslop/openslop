"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { nanoid } from "nanoid";
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

type QueuedMessage = { id: string; text: string };

type SloppyControl = {
	send: (message: string) => void;
	stop: () => void;
	/** Typed mid-turn and waiting for its own turn, in the order they were sent. */
	queued: QueuedMessage[];
	dropQueued: (id: string) => void;
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
	const [queued, setQueued] = useState<QueuedMessage[]>([]);
	// `sendMessage` only reaches "submitted" a microtask later, so a turn can be
	// under way while the chat still reads as ready.
	const dispatching = useRef(false);

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

	const dispatch = useCallback(
		(text: string) => {
			dispatching.current = true;
			turnModel.current = model;
			turn.current = new AbortController();
			void sendMessage({ text });
		},
		[sendMessage, model],
	);

	// The chat is the external system this synchronizes against: a queued
	// message goes out once its predecessor's turn has fully settled. A failed
	// turn leaves `status` on "error" and holds the queue there until the user
	// sends something themselves. Between a tool result and the follow-up step
	// the SDK sends for it the chat also reads as idle, so the same predicate
	// that continues the loop keeps a queued message out of that gap.
	useEffect(() => {
		if (working || status !== "ready") {
			dispatching.current = false;
			return;
		}
		const next = queued[0];
		if (!next || dispatching.current) return;
		if (lastAssistantMessageIsCompleteWithToolCalls({ messages })) return;
		// eslint-disable-next-line react-hooks/set-state-in-effect -- shifting the queue is the synchronization, not a cascading render
		setQueued((pending) => pending.slice(1));
		dispatch(next.text);
	}, [queued, working, status, messages, dispatch]);

	const control = useMemo<SloppyControl>(
		() => ({
			send: (message) => {
				if (working || dispatching.current) {
					setQueued((pending) => [...pending, { id: nanoid(), text: message }]);
					return;
				}
				dispatch(message);
			},
			stop: () => {
				turn.current?.abort();
				void stop();
				dispatching.current = false;
				setQueued([]);
			},
			queued,
			dropQueued: (id) =>
				setQueued((pending) => pending.filter((message) => message.id !== id)),
			loading: working,
			writingScript,
		}),
		[dispatch, stop, working, writingScript, queued, setQueued],
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
