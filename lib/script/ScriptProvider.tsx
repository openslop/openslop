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
import { useProjectStoreHandle } from "@/lib/project/ProjectStoreProvider";
import { BLANK_SCRIPT } from "@/lib/project/serialize";
import { useOSMLStreamParser } from "@/lib/canvas/useOSMLStreamParser";
import {
	buildScriptPrompt,
	sourceText,
	type ScriptSource,
} from "./prompt/build";

type ScriptControl = {
	runScript: (source: ScriptSource) => Promise<void>;
	/** Leaves the hero for the workspace, before there is anything to show in it. */
	enterWorkspace: () => void;
	startBlank: () => void;
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
	const { connectorConfig } = useConfig();
	const store = useProjectStoreHandle();
	const updateMetadata = useProject((s) => s.updateMetadata);
	const [script, setScript] = useState(initialScript);
	const [hasContent, setHasContent] = useState(initialScript.length > 0);
	const { nodes, appendChunk, reset } = useOSMLStreamParser();

	const { provider: llmProvider, config: llmConfig } = getDefaultConnector(
		connectorConfig,
		"llm",
	);

	const runScript = useCallback(
		async (source: ScriptSource) => {
			updateMetadata({ lastPrompt: sourceText(source) });
			reset();
			const connector = createConnector("llm", llmProvider, llmConfig);
			const { system, prompt } = buildScriptPrompt(
				store.getState().metadata,
				source,
			);
			for await (const chunk of connector.stream({
				prompt,
				systemPrompt: system,
			})) {
				if (!chunk.text) continue;
				setHasContent(true);
				appendChunk(chunk.text);
			}
		},
		[store, llmProvider, llmConfig, appendChunk, reset, updateMetadata],
	);

	const enterWorkspace = useCallback(() => setHasContent(true), []);

	const startBlank = useCallback(() => {
		setScript(BLANK_SCRIPT);
		setHasContent(true);
	}, []);

	const control = useMemo<ScriptControl>(
		() => ({ runScript, enterWorkspace, startBlank }),
		[runScript, enterWorkspace, startBlank],
	);

	return (
		<ScriptControlContext value={control}>
			<ScriptNodesContext value={nodes}>
				<ScriptInitialContext value={script}>
					<ScriptHasContentContext value={hasContent}>
						{children}
					</ScriptHasContentContext>
				</ScriptInitialContext>
			</ScriptNodesContext>
		</ScriptControlContext>
	);
}
