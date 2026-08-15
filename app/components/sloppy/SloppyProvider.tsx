"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Editor } from "slate";
import {
	loadAgentTranscript,
	reportToolResults,
	sendAgentTurn,
} from "@/lib/agent/client";
import type { AssistantModelMessage } from "ai";
import type {
	AgentMessage,
	AgentMessageRow,
	AgentRequestRecord,
	AgentStreamPart,
} from "@/lib/agent/types";
import { executeToolCall } from "@/lib/agent/tools/registry";
import type { AgentToolContext } from "@/lib/agent/tools/defineTool";
import { serializeOSMLWithScenes } from "@/lib/canvas/osmlSerializer";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import { useConfig } from "@/lib/config/ConfigProvider";
import { spokenLanguage } from "@/lib/connectors/llm/plugins/language-prompt";
import { useProjectStoreHandle } from "@/lib/project/ProjectStoreProvider";
import { useScriptControl } from "@/lib/script/ScriptProvider";
import { useStreamRun } from "@/lib/script/useStreamRun";
import { toastError } from "@/lib/toastError";

export type LiveTurn = {
	user: string;
	assistant: AgentMessage;
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
const [SloppyMessagesContext, useSloppyMessages] =
	createRequiredContext<AgentMessageRow[]>("SloppyProvider");
const [SloppyLiveContext, useSloppyLive] =
	createRequiredContext<LiveTurn | null>("SloppyProvider");
const [SloppyControlContext, useSloppy] =
	createRequiredContext<SloppyControl>("SloppyProvider");

export { useSloppyMessages, useSloppyLive, useSloppy };

const emptyTurn = (user: string): LiveTurn => ({
	user,
	assistant: { role: "assistant", content: [] },
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
	const { projectId, connectorConfig } = useConfig();
	const store = useProjectStoreHandle();
	const { submitPrompt } = useScriptControl();
	const { loading, run, stop } = useStreamRun();

	const [messages, setMessages] = useState<AgentMessageRow[]>([]);
	const [live, setLive] = useState<LiveTurn | null>(null);

	// Drops a response the project has already moved on from.
	useEffect(() => {
		let current = true;
		loadAgentTranscript(projectId)
			.then((rows) => {
				if (current) setMessages(rows);
			})
			.catch((error) => toastError(error, "Could not load Sloppy"));
		return () => {
			current = false;
		};
	}, [projectId]);

	const send = useCallback(
		async (message: string, model?: string) => {
			const calls: Extract<AgentStreamPart, { type: "tool-call" }>[] = [];
			let finished = false;
			setLive(emptyTurn(message));

			const applyPart = (part: AgentStreamPart) => {
				// A provider error ends the turn rather than being swallowed into it.
				if (part.type === "error") throw new Error(part.message);
				if (part.type === "tool-call") calls.push(part);
				setLive((turn) => (turn ? reduceTurn(turn, part) : turn));
			};

			try {
				await run(
					sendAgentTurn({
						projectId,
						message,
						script: serializeOSMLWithScenes(editor.children),
						model,
						language: spokenLanguage(store.getState().metadata, ""),
					}),
					applyPart,
					() => {
						finished = true;
					},
				);

				if (!finished) return;

				const ctx: AgentToolContext = {
					editor,
					connectors: connectorConfig,
					writeScript: submitPrompt,
				};
				const results = await Promise.all(
					calls.map((call) => executeToolCall(call, ctx)),
				);
				if (results.length > 0) {
					await reportToolResults(projectId, [
						{ role: "tool", content: results },
					]);
				}
			} catch (error) {
				toastError(error, "Sloppy could not finish that");
			} finally {
				// Read before either setState, so the live turn and the rows that
				// replace it swap in one commit rather than blinking out between them.
				const rows = await loadAgentTranscript(projectId).catch(() => null);
				setLive(null);
				if (rows) setMessages(rows);
			}
		},
		[projectId, editor, store, run, connectorConfig, submitPrompt],
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

type AssistantParts = Exclude<AssistantModelMessage["content"], string>;

const assistant = (content: AssistantParts): AgentMessage => ({
	role: "assistant",
	content,
});

const partsOf = (message: AgentMessage): AssistantParts =>
	Array.isArray(message.content) ? (message.content as AssistantParts) : [];

/** Grows the trailing text or reasoning part, so deltas become one part, not many. */
function withDelta(
	message: AgentMessage,
	type: "text" | "reasoning",
	text: string,
): AgentMessage {
	const content = partsOf(message);
	const last = content.at(-1);
	if (last?.type === type) {
		return assistant([
			...content.slice(0, -1),
			{ ...last, text: last.text + text },
		]);
	}
	return assistant([...content, { type, text }]);
}

function reduceTurn(turn: LiveTurn, part: AgentStreamPart): LiveTurn {
	switch (part.type) {
		case "request":
			return { ...turn, request: part.request };
		case "reasoning-delta":
			return {
				...turn,
				assistant: withDelta(turn.assistant, "reasoning", part.text),
			};
		case "reasoning-end":
			return { ...turn, thoughtSeconds: part.seconds };
		case "text-delta":
			return {
				...turn,
				assistant: withDelta(turn.assistant, "text", part.text),
			};
		case "tool-call":
			return {
				...turn,
				assistant: assistant([
					...partsOf(turn.assistant),
					{
						type: "tool-call",
						toolCallId: part.toolCallId,
						toolName: part.toolName,
						input: part.input,
					},
				]),
			};
		default:
			return turn;
	}
}
