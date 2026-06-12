"use client";

import {
	createContext,
	use,
	useCallback,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from "react";
import type { ParsedElement } from "@/lib/canvas/types";
import { useConfig } from "@/lib/config/ConfigProvider";
import { getDefaultConnector } from "@/lib/config/connectorUtils";
import { createConnector } from "@/lib/connectors/factory";
import { getProjectStore } from "@/lib/project/store";
import { useOSMLSerializer } from "@/lib/canvas/useOSMLSerializer";

type ScriptControl = {
	loading: boolean;
	submitPrompt: (prompt: string) => Promise<void>;
	stopGeneration: () => void;
};

// `nodes` is rebuilt on every streamed token, so it lives in its own context
// to keep low-frequency controls from re-rendering the editor shell per token.
const ScriptNodesContext = createContext<ParsedElement[] | null>(null);
const ScriptControlContext = createContext<ScriptControl | null>(null);
// The live script string changes per streamed token, but nothing renders it:
// the shell only needs a stable "has any content" boolean, and the editor only
// needs the initial script once for rehydration. Exposing those instead of the
// raw string keeps the whole editor tree off the per-token render path.
const ScriptHasContentContext = createContext(false);
const ScriptInitialContext = createContext<string>("");

export function useScriptNodes() {
	const ctx = use(ScriptNodesContext);
	if (!ctx)
		throw new Error("useScriptNodes must be used within ScriptProvider");
	return ctx;
}

export function useScriptControl() {
	const ctx = use(ScriptControlContext);
	if (!ctx)
		throw new Error("useScriptControl must be used within ScriptProvider");
	return ctx;
}

export function useScriptHasContent() {
	return use(ScriptHasContentContext);
}

export function useScriptInitial() {
	return use(ScriptInitialContext);
}

export function ScriptProvider({
	initialScript = "",
	children,
}: {
	initialScript?: string;
	children: ReactNode;
}) {
	const { connectorConfig, projectId, mode } = useConfig();
	const [hasContent, setHasContent] = useState(initialScript.length > 0);
	const [loading, setLoading] = useState(false);
	const abortRef = useRef<AbortController | null>(null);
	const { nodes, appendChunk } = useOSMLSerializer();

	const stopGeneration = useCallback(() => {
		abortRef.current?.abort();
		abortRef.current = null;
		setLoading(false);
	}, []);

	const { provider: llmProvider, config: llmConfig } = getDefaultConnector(
		connectorConfig,
		"llm",
	);

	const submitPrompt = useCallback(
		async (prompt: string) => {
			abortRef.current?.abort();
			const controller = new AbortController();
			abortRef.current = controller;

			setHasContent(false);
			setLoading(true);
			getProjectStore(projectId)
				.getState()
				.updateMetadata({ lastMode: mode, lastPrompt: prompt });
			try {
				const connector = createConnector("llm", llmProvider, llmConfig);
				for await (const chunk of connector.stream({ prompt })) {
					if (controller.signal.aborted) break;
					if (!chunk.text) continue;
					setHasContent(true);
					appendChunk(chunk.text);
				}
			} finally {
				if (abortRef.current === controller) {
					abortRef.current = null;
					setLoading(false);
				}
			}
		},
		[llmProvider, llmConfig, appendChunk, projectId, mode],
	);

	const control = useMemo<ScriptControl>(
		() => ({ loading, submitPrompt, stopGeneration }),
		[loading, submitPrompt, stopGeneration],
	);

	return (
		<ScriptControlContext.Provider value={control}>
			<ScriptNodesContext.Provider value={nodes}>
				<ScriptInitialContext.Provider value={initialScript}>
					<ScriptHasContentContext.Provider value={hasContent}>
						{children}
					</ScriptHasContentContext.Provider>
				</ScriptInitialContext.Provider>
			</ScriptNodesContext.Provider>
		</ScriptControlContext.Provider>
	);
}
