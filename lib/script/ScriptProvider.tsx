"use client";

import {
	createContext,
	use,
	useCallback,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import type { ParsedElement } from "@/lib/canvas/types";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import { useConfig } from "@/lib/config/ConfigProvider";
import { getDefaultConnector } from "@/lib/connectors/registry";
import { createConnector } from "@/lib/connectors/factory";
import { useProject } from "@/lib/project/useProject";
import { useOSMLStreamParser } from "@/lib/canvas/useOSMLStreamParser";
import { useStreamRun } from "./useStreamRun";

type ScriptControl = {
	loading: boolean;
	submitPrompt: (prompt: string) => Promise<void>;
	stopGeneration: () => void;
};

// `nodes` is rebuilt on every streamed token, so it lives in its own context
// to keep low-frequency controls from re-rendering the editor shell per token.
const [ScriptNodesContext, useScriptNodes] =
	createRequiredContext<ParsedElement[]>("ScriptNodesContext");
const [ScriptControlContext, useScriptControl] =
	createRequiredContext<ScriptControl>("ScriptControlContext");
export { useScriptNodes, useScriptControl };
// The live script string changes per streamed token, but nothing renders it:
// the shell only needs a stable "has any content" boolean, and the editor only
// needs the initial script once for rehydration. Exposing those instead of the
// raw string keeps the whole editor tree off the per-token render path.
const ScriptHasContentContext = createContext(false);
const ScriptInitialContext = createContext<string>("");

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
	const { connectorConfig, mode } = useConfig();
	const updateMetadata = useProject((s) => s.updateMetadata);
	const [hasContent, setHasContent] = useState(initialScript.length > 0);
	const { nodes, appendChunk } = useOSMLStreamParser();
	const { loading, run, stop: stopGeneration } = useStreamRun();

	const { provider: llmProvider, config: llmConfig } = getDefaultConnector(
		connectorConfig,
		"llm",
	);

	const submitPrompt = useCallback(
		async (prompt: string) => {
			setHasContent(false);
			updateMetadata({ lastMode: mode, lastPrompt: prompt });
			const connector = createConnector("llm", llmProvider, llmConfig);
			await run(connector.stream({ prompt }), (chunk) => {
				if (!chunk.text) return;
				setHasContent(true);
				appendChunk(chunk.text);
			});
		},
		[llmProvider, llmConfig, appendChunk, updateMetadata, mode, run],
	);

	const control = useMemo<ScriptControl>(
		() => ({ loading, submitPrompt, stopGeneration }),
		[loading, submitPrompt, stopGeneration],
	);

	return (
		<ScriptControlContext value={control}>
			<ScriptNodesContext value={nodes}>
				<ScriptInitialContext value={initialScript}>
					<ScriptHasContentContext value={hasContent}>
						{children}
					</ScriptHasContentContext>
				</ScriptInitialContext>
			</ScriptNodesContext>
		</ScriptControlContext>
	);
}
