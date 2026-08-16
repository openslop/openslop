"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Editor } from "slate";
import {
	loadAgentTranscript,
	reportToolResults,
	sendAgentTurn,
} from "@/lib/agent/client";
import type { AssistantModelMessage } from "ai";
import type {
	AgentMessageRow,
	AgentRequestRecord,
	AgentStreamPart,
} from "@/lib/agent/types";
import { useAgentTools } from "@/lib/agent/tools/useAgentTools";
import { serializeOSMLWithScenes } from "@/lib/canvas/osmlSerializer";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import { useConfig } from "@/lib/config/ConfigProvider";
import { spokenLanguage } from "@/lib/connectors/llm/plugins/language-prompt";
import { useProjectStoreHandle } from "@/lib/project/ProjectStoreProvider";
import { toastError } from "@/lib/toastError";

type AssistantParts = Exclude<AssistantModelMessage["content"], string>;

export type LiveTurn = {
	user: string;
	parts: AssistantParts;
	request: AgentRequestRecord | null;
	/** Null until the model reports how long it thought. */
	thoughtSeconds: number | null;
};
type SloppyControl = {
	send: (message: string, model?: string) => Promise<void>;
	stop: () => void;
	loading: boolean;
};
// Split by update frequency: only the live turn changes per streamed token.
const [SloppyMessagesContext, useSloppyMessages] = createRequiredContext<
	AgentMessageRow[] | null
>("SloppyProvider");
const [SloppyLiveContext, useSloppyLive] =
	createRequiredContext<LiveTurn | null>("SloppyProvider");
const [SloppyControlContext, useSloppy] =
	createRequiredContext<SloppyControl>("SloppyProvider");

export { useSloppyMessages, useSloppyLive, useSloppy };

const emptyTurn = (user: string): LiveTurn => ({
	user,
	parts: [],
	request: null,
	thoughtSeconds: null,
});

export function SloppyProvider({
	editor,
	children,
}: {
	editor: Editor;
	children: ReactNode;
}) {
	const { projectId } = useConfig();
	const store = useProjectStoreHandle();
	const runTool = useAgentTools(editor);

	const [messages, setMessages] = useState<AgentMessageRow[] | null>(null);
	const [live, setLive] = useState<LiveTurn | null>(null);
	const inFlight = useRef<AbortController | null>(null);
	const loading = live !== null;

	const stop = useCallback(() => inFlight.current?.abort(), []);

	useEffect(() => {
		let current = true;
		loadAgentTranscript(projectId)
			.then((rows) => {
				if (current) setMessages(rows);
			})
			.catch((error) => {
				toastError(error, "Could not load Sloppy");
				if (current) setMessages([]);
			});
		return () => {
			current = false;
		};
	}, [projectId]);

	const send = useCallback(
		async (message: string, model?: string) => {
			if (inFlight.current) return;
			const controller = new AbortController();
			inFlight.current = controller;
			const calls: Extract<AgentStreamPart, { type: "tool-call" }>[] = [];
			setLive(emptyTurn(message));

			try {
				const turn = sendAgentTurn(
					{
						projectId,
						message,
						script: serializeOSMLWithScenes(editor.children),
						model,
						language: spokenLanguage(store.getState().metadata, ""),
					},
					controller.signal,
				);
				for await (const part of turn) {
					if (part.type === "error") throw new Error(part.message);
					if (part.type === "tool-call") calls.push(part);
					setLive((live) => (live ? reduceTurn(live, part) : live));
				}

				const results = await Promise.all(calls.map(runTool));
				if (results.length > 0) {
					await reportToolResults(projectId, [
						{ role: "tool", content: results },
					]);
				}
			} catch (error) {
				// Stopping tears the request down; that is the outcome asked for.
				if (!controller.signal.aborted) {
					toastError(error, "Sloppy could not finish that");
				}
			} finally {
				// Read before either setState, so the live turn and the rows that
				// replace it swap in one commit rather than blinking out between them.
				const rows = await loadAgentTranscript(projectId).catch((error) => {
					toastError(error, "Sloppy finished, but the transcript did not load");
					return null;
				});
				setLive(null);
				if (rows) setMessages(rows);
				inFlight.current = null;
			}
		},
		[projectId, editor, store, runTool],
	);

	const control = useMemo<SloppyControl>(
		() => ({ send, stop, loading }),
		[send, stop, loading],
	);
	return (
		<SloppyControlContext value={control}>
			<SloppyMessagesContext value={messages}>
				<SloppyLiveContext value={live}>{children}</SloppyLiveContext>
			</SloppyMessagesContext>
		</SloppyControlContext>
	);
}

/** Grows the trailing text or reasoning part, so deltas become one part, not many. */
function withDelta(
	parts: AssistantParts,
	type: "text" | "reasoning",
	text: string,
): AssistantParts {
	const last = parts.at(-1);
	if (last?.type === type) {
		return [...parts.slice(0, -1), { ...last, text: last.text + text }];
	}
	return [...parts, { type, text }];
}

function reduceTurn(turn: LiveTurn, part: AgentStreamPart): LiveTurn {
	switch (part.type) {
		case "request":
			return { ...turn, request: part.request };
		case "reasoning-delta":
			return {
				...turn,
				parts: withDelta(turn.parts, "reasoning", part.text),
			};
		case "reasoning-end":
			return { ...turn, thoughtSeconds: part.seconds };
		case "text-delta":
			return {
				...turn,
				parts: withDelta(turn.parts, "text", part.text),
			};
		case "tool-call":
			return {
				...turn,
				parts: [
					...turn.parts,
					{
						type: "tool-call",
						toolCallId: part.toolCallId,
						toolName: part.toolName,
						input: part.input,
					},
				],
			};
		default:
			return turn;
	}
}
