"use client";

import { useCallback } from "react";
import { useSlateStatic } from "slate-react";
import pick from "lodash/pick";
import { getAssets } from "@/lib/canvas/assets";
import { findElementById } from "@/lib/canvas/editor-ops";
import { serializeOSMLWithScenes } from "@/lib/canvas/osml-serializer";
import { isScriptEmpty } from "@/lib/canvas/scenes";
import {
	countSpokenWords,
	estimateDialogueLengths,
} from "@/lib/canvas/spoken-words";
import { isGenerated } from "@/lib/canvas/types";
import {
	estimateRuntime,
	estimateVisualSpans,
} from "@/lib/render/visual-spans";
import { useGenerationQueue } from "@/lib/generation/generation-queue-provider";
import { buildNodes } from "@/lib/generation/generation-graph";
import { staleReason } from "@/lib/generation/stale-reason";
import { useBuildContext } from "@/lib/generation/use-build-context";
import { useCreateConnector } from "@/lib/connectors/use-create-connector";
import { findProviderKey } from "@/lib/connectors/provider-key";
import { applyRefineOps } from "@/lib/script/refine/apply-ops";
import { useProjectStoreHandle } from "@/lib/project/project-store-provider";
import { useAccountStoreHandle } from "@/lib/user/account-store-provider";
import type { ScriptSource } from "@/lib/script/prompt/build";
import { streamScript } from "@/lib/script/stream-script";
import { elementResult } from "../element-result";
import { elementState } from "../element-state";
import { PROJECT_SETTERS, type AgentToolContext } from "./context";
import { executeToolCall } from "./registry";

export function useAgentTools() {
	const editor = useSlateStatic();
	const store = useProjectStoreHandle();
	const account = useAccountStoreHandle();
	const queue = useGenerationQueue();
	const buildContext = useBuildContext();
	const createConnector = useCreateConnector();

	return useCallback(
		(call: { toolName: string; input: unknown }, signal?: AbortSignal) => {
			const llm = () => createConnector("llm", editor.defaultModels().llm);
			const draftScript = (source: ScriptSource) =>
				streamScript(
					editor,
					store.getState().scriptSettings,
					llm(),
					source,
					signal,
				);
			const ctx: AgentToolContext = {
				readScript: () => serializeOSMLWithScenes(editor.children),
				isScriptEmpty: () => isScriptEmpty(editor.children),
				countSpokenWords: () => countSpokenWords(editor.children),
				estimateDialogueLengths: () => estimateDialogueLengths(editor.children),
				estimateVisualSpans: () => estimateVisualSpans(editor.children),
				estimateRuntime: () =>
					estimateRuntime(
						editor.children,
						store.getState().videoSettings.transitionType,
					),
				elementResult: async (id) => {
					const element = findElementById(editor, id)?.[0];
					return (
						element && elementResult(element, queue.getElementSnapshot(id))
					);
				},
				elementStates: () => {
					const context = buildContext();
					return buildNodes(context.canvas.filter(isGenerated), context).map(
						(node) =>
							elementState(
								node.id,
								queue.getElementSnapshot(node.id),
								staleReason(node, queue),
							),
					);
				},
				generateText: async (prompt, options) => {
					const { text } = await llm().generate(
						{ prompt, ...options },
						{ signal },
					);
					if (!text.trim())
						throw new Error(
							"The model spent its whole output budget thinking and replied with nothing. Ask for less thinking, or for a shorter answer.",
						);
					return text;
				},
				readAssets: () => getAssets(editor.children),
				readProject: () => store.getState(),
				editScript: (ops) => applyRefineOps(editor, ops),
				writeScript: (brief) => draftScript({ kind: "brief", brief }),
				adaptScript: (script, notes) =>
					draftScript({ kind: "adapt", script, notes }),
				isConnected: (provider) =>
					findProviderKey(account.getState().providerKeys, provider) !== null,
				...pick(store.getState(), PROJECT_SETTERS),
			};
			return executeToolCall(call, ctx);
		},
		[editor, store, account, queue, buildContext, createConnector],
	);
}
