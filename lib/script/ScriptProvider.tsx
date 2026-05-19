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
import { useOSMLSerializer } from "@/app/components/canvas/hooks/useOSMLSerializer";

type ScriptControl = {
	loading: boolean;
	submitPrompt: (prompt: string) => Promise<void>;
	stopGeneration: () => void;
};

// `nodes` is rebuilt on every streamed token, so it lives in its own context
// to keep low-frequency controls from re-rendering the editor shell per token.
const ScriptNodesContext = createContext<ParsedElement[] | null>(null);
const ScriptControlContext = createContext<ScriptControl | null>(null);
const ScriptTextContext = createContext<string>("");

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

export function useScriptText() {
	return use(ScriptTextContext);
}

export function ScriptProvider({
	initialScript = "",
	children,
}: {
	initialScript?: string;
	children: ReactNode;
}) {
	const { connectorConfig } = useConfig();
	const [script, setScript] = useState(initialScript);
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

			setScript("");
			setLoading(true);
			try {
				const connector = createConnector("llm", llmProvider, llmConfig);
				for await (const chunk of connector.stream({ prompt })) {
					if (controller.signal.aborted) break;
					setScript((prev) => prev + chunk.text);
					appendChunk(chunk.text);
				}
			} finally {
				if (abortRef.current === controller) {
					abortRef.current = null;
					setLoading(false);
				}
			}
		},
		[llmProvider, llmConfig, appendChunk],
	);

	const control = useMemo<ScriptControl>(
		() => ({ loading, submitPrompt, stopGeneration }),
		[loading, submitPrompt, stopGeneration],
	);

	return (
		<ScriptControlContext.Provider value={control}>
			<ScriptNodesContext.Provider value={nodes}>
				<ScriptTextContext.Provider value={script}>
					{children}
				</ScriptTextContext.Provider>
			</ScriptNodesContext.Provider>
		</ScriptControlContext.Provider>
	);
}
