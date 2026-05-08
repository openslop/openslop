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
import type { ParsedElement } from "@/app/components/canvas/types";
import { useConfig } from "@/lib/config/ConfigProvider";
import { getDefaultConnector } from "@/lib/config/connectorUtils";
import { createConnector } from "@/lib/connectors/factory";
import { useOSMLSerializer } from "@/app/components/canvas/hooks/useOSMLSerializer";

type ScriptContextValue = {
	nodes: ParsedElement[];
	loading: boolean;
	submitPrompt: (prompt: string) => Promise<void>;
	stopGeneration: () => void;
};

const ScriptContext = createContext<ScriptContextValue | null>(null);
const ScriptTextContext = createContext<string>("");

export function useScript() {
	const ctx = use(ScriptContext);
	if (!ctx) throw new Error("useScript must be used within ScriptProvider");
	return ctx;
}

export function useScriptText() {
	return use(ScriptTextContext);
}

export function ScriptProvider({ children }: { children: ReactNode }) {
	const { connectorConfig } = useConfig();
	const [script, setScript] = useState("");
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

	const value = useMemo<ScriptContextValue>(
		() => ({
			nodes,
			loading,
			submitPrompt,
			stopGeneration,
		}),
		[nodes, loading, submitPrompt, stopGeneration],
	);

	return (
		<ScriptContext.Provider value={value}>
			<ScriptTextContext.Provider value={script}>
				{children}
			</ScriptTextContext.Provider>
		</ScriptContext.Provider>
	);
}
