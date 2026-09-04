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
import { createConnector } from "@/lib/connectors/factory";
import { useDefaultModels } from "@/lib/connectors/useDefaultModels";
import { useProject } from "@/lib/project/useProject";
import { useProjectStoreHandle } from "@/lib/project/ProjectStoreProvider";
import { BLANK_SCRIPT } from "@/lib/project/serialize";
import { useOSMLStreamParser } from "@/lib/canvas/useOSMLStreamParser";
import { buildScriptPrompt, type ScriptSource } from "./prompt/build";

type ScriptControl = {
	runScript: (source: ScriptSource, signal?: AbortSignal) => Promise<void>;
	setShowWorkspace: (showWorkspace: boolean) => void;
	startBlank: () => void;
};

// `nodes` is rebuilt on every streamed token, so it lives in its own context
// to keep low-frequency controls from re-rendering the editor shell per token.
const [ScriptNodesContext, useScriptNodes] =
	createRequiredContext<ParsedElement[]>("ScriptNodesContext");
const [ScriptControlContext, useScriptControl] =
	createRequiredContext<ScriptControl>("ScriptControlContext");
export { useScriptNodes, useScriptControl };
// Nothing renders the live script string: the shell reads a stable boolean and
// the editor rehydrates once, keeping the tree off the per-token render path.
const ShowWorkspaceContext = createContext(false);
const ScriptInitialContext = createContext<string>("");

export function useShowWorkspace() {
	return use(ShowWorkspaceContext);
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
	const [script] = useState(initialScript);
	const [showWorkspace, setShowWorkspace] = useState(initialScript.length > 0);
	const { nodes, appendChunk, reset } = useOSMLStreamParser();

	const model = useDefaultModels().llm;

	const runScript = useCallback(
		async (source: ScriptSource, signal?: AbortSignal) => {
			reset();
			const connector = createConnector("llm", model, connectorConfig.llm);
			const { system, prompt } = buildScriptPrompt(
				store.getState().metadata,
				source,
			);
			for await (const chunk of connector.stream(
				{ prompt, systemPrompt: system },
				signal,
			)) {
				if (!chunk.text) continue;
				appendChunk(chunk.text);
			}
		},
		[store, connectorConfig, model, appendChunk, reset],
	);

	const startBlank = useCallback(() => {
		updateMetadata({ title: "Untitled" });
		setShowWorkspace(true);
		appendChunk(BLANK_SCRIPT);
	}, [appendChunk, updateMetadata]);

	const control = useMemo<ScriptControl>(
		() => ({ runScript, setShowWorkspace, startBlank }),
		[runScript, startBlank],
	);

	return (
		<ScriptControlContext value={control}>
			<ScriptNodesContext value={nodes}>
				<ScriptInitialContext value={script}>
					<ShowWorkspaceContext value={showWorkspace}>
						{children}
					</ShowWorkspaceContext>
				</ScriptInitialContext>
			</ScriptNodesContext>
		</ScriptControlContext>
	);
}
