"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Editor } from "slate";
import {
	loadAgentTranscript,
	reportToolResults,
	sendAgentTurn,
} from "@/lib/agent/client";
import {
	emptyTurn,
	reduceTurn,
	toolCallsIn,
	type LiveTurn,
} from "@/lib/agent/liveTurn";
import type { AgentMessageRow } from "@/lib/agent/types";
import { useAgentTools } from "@/lib/agent/tools/useAgentTools";
import { serializeOSMLWithScenes } from "@/lib/canvas/osmlSerializer";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import { useConfig } from "@/lib/config/ConfigProvider";
import { spokenLanguage } from "@/lib/connectors/llm/plugins/language-prompt";
import { useProjectStoreHandle } from "@/lib/project/ProjectStoreProvider";
import { toastError } from "@/lib/toastError";

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
			let turn = emptyTurn(message);
			setLive(turn);

			try {
				const stream = sendAgentTurn(
					{
						projectId,
						message,
						script: serializeOSMLWithScenes(editor.children),
						model,
						language: spokenLanguage(store.getState().metadata, ""),
					},
					controller.signal,
				);
				for await (const part of stream) {
					if (part.type === "error") throw new Error(part.message);
					turn = reduceTurn(turn, part);
					setLive(turn);
				}

				const results = await Promise.all(toolCallsIn(turn).map(runTool));
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
