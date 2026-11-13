"use client";

import { useCallback } from "react";
import { useSlateStatic } from "slate-react";
import pick from "lodash/pick";
import { getAssets } from "@/lib/canvas/assets";
import { findElementById, requireElement } from "@/lib/canvas/editor-ops";
import { serializeOSMLWithScenes } from "@/lib/canvas/osml-serializer";
import { getContentElements, isScriptEmpty } from "@/lib/canvas/scenes";
import {
	countSpokenWords,
	estimateDialogueLengths,
} from "@/lib/canvas/spoken-words";
import { isGenerated } from "@/lib/canvas/types";
import { estimateRuntime } from "@/lib/render/estimate-runtime";
import { estimateVisualSpans } from "@/lib/render/visual-spans";
import {
	captionElements,
	autoCaptionElements,
	withoutCaptions,
} from "@/lib/captions/auto-captions";
import { resolveModel } from "@/lib/connectors/models";
import { useProjectId } from "@/lib/project/project-provider";
import { useGenerationQueue } from "@/lib/generation/generation-queue-provider";
import { buildNode, buildNodes } from "@/lib/generation/generation-graph";
import { staleReason } from "@/lib/generation/stale-reason";
import { useBuildContext } from "@/lib/generation/use-build-context";
import { useCreateConnector } from "@/lib/connectors/use-create-connector";
import { findProviderKey } from "@/lib/connectors/provider-key";
import { applyRefineOps } from "@/lib/script/refine/apply-ops";
import { useProjectStoreHandle } from "@/lib/project/project-store-provider";
import { useAccountStoreHandle } from "@/lib/user/account-store-provider";
import type { ScriptSource } from "@/lib/script/prompt/build";
import {
	commitUploaded,
	isUploadable,
	uploadKindOf,
	uploadedResult,
} from "@/lib/upload/uploaded-result";
import { streamScript } from "@/lib/script/stream-script";
import { elementResult, resultView } from "../element-result";
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
	const projectId = useProjectId();

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
					estimateRuntime(editor.children, store.getState().videoSettings),
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
				modelDefaults: () => ({
					project: store.getState().models,
					account: account.getState().models,
				}),
				editScript: (ops) => applyRefineOps(editor, ops),
				writeScript: (brief) => draftScript({ kind: "brief", brief }),
				adaptScript: (script, notes) =>
					draftScript({ kind: "adapt", script, notes }),
				isConnected: (provider) =>
					findProviderKey(account.getState().providerKeys, provider) !== null,
				generateCaptions: (ids) => {
					const content = getContentElements(editor.children);
					const named = (id: string) => {
						const found = content.find((element) => element.id === id);
						if (!found)
							throw new Error(
								`There is no element ${id} in the scenes. Read the script for the ids there are.`,
							);
						return found;
					};
					return captionElements(
						queue,
						ids
							? ids.map(named)
							: withoutCaptions(
									autoCaptionElements(editor.children),
									queue.getElementSnapshot,
								),
						resolveModel("stt", editor.defaultModels().stt),
						projectId,
					);
				},
				setElementResult: (id, url) => {
					const [element] = requireElement(editor, id);
					if (!isUploadable(element))
						throw new Error(
							`${id} is a ${element.type} element and can't take a file.`,
						);
					return commitUploaded(
						queue,
						buildNode(element, buildContext()),
						uploadKindOf(element),
						url,
					);
				},
				viewMedia: async ({ kind, url }) =>
					resultView(await uploadedResult(kind, url)),
				...pick(store.getState(), PROJECT_SETTERS),
			};
			return executeToolCall(call, ctx);
		},
		[editor, store, account, queue, buildContext, createConnector, projectId],
	);
}
