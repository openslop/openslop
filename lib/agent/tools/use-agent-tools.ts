"use client";

import { useCallback, useRef } from "react";
import { useSlateStatic } from "slate-react";
import pick from "lodash/pick";
import { findElementById, requireElement } from "@/lib/canvas/editor-ops";
import { serializeOSMLWithScenes } from "@/lib/canvas/osml-serializer";
import { getContentElements } from "@/lib/canvas/scenes";
import {
	countSpokenWords,
	estimateSpeechLengths,
} from "@/lib/canvas/spoken-words";
import { isGenerated } from "@/lib/canvas/types";
import { estimateRuntime } from "@/lib/render/estimate-runtime";
import { estimateVisualSpans } from "@/lib/render/visual-spans";
import {
	captionElements,
	autoCaptionElements,
	withoutCaptions,
} from "@/lib/captions/auto-captions";
import { useCaptionMedia } from "@/lib/captions/use-caption-media";
import { resolveModel } from "@/lib/connectors/models";
import { uploadedMedia } from "@/lib/project/media";
import { useProjectId } from "@/lib/project/project-provider";
import { useGenerationQueue } from "@/lib/generation/generation-queue-provider";
import { buildNode, buildNodes } from "@/lib/generation/generation-graph";
import { staleReason } from "@/lib/generation/stale-reason";
import { useBuildContext } from "@/lib/generation/use-build-context";
import { findProviderKey } from "@/lib/connectors/provider-key";
import { applyRefineOps } from "@/lib/script/refine/apply-ops";
import { useProjectStoreHandle } from "@/lib/project/project-store-provider";
import { useAccountStoreHandle } from "@/lib/user/account-store-provider";
import {
	commitUploaded,
	isUploadable,
	uploadKindOf,
	uploadedResult,
} from "@/lib/upload/uploaded-result";
import { elementResult, resultView } from "../element-result";
import { elementState } from "../element-state";
import { PROJECT_SETTERS, type AgentToolContext } from "./context";
import { executeToolCall } from "./registry";

export function useAgentTools() {
	const editor = useSlateStatic();
	// Slate replaces the children on every change, so a reference check spots any edit.
	const lastRead = useRef<typeof editor.children>(undefined);
	const store = useProjectStoreHandle();
	const account = useAccountStoreHandle();
	const queue = useGenerationQueue();
	const buildContext = useBuildContext();
	const projectId = useProjectId();
	const captionMedia = useCaptionMedia();

	return useCallback(
		(call: { toolName: string; input: unknown }) => {
			const markScriptRead = () => {
				lastRead.current = editor.children;
			};
			const isScriptReadCurrent = () => lastRead.current === editor.children;
			const ctx: AgentToolContext = {
				readScript: () => serializeOSMLWithScenes(editor.children),
				markScriptRead,
				isScriptReadCurrent,
				countSpokenWords: () => countSpokenWords(editor.children),
				estimateSpeechLengths: () => estimateSpeechLengths(editor.children),
				estimateVisualSpans: () =>
					estimateVisualSpans(editor.children, queue.getElementSnapshot),
				estimateRuntime: () =>
					estimateRuntime(
						editor.children,
						store.getState().videoSettings,
						queue.getElementSnapshot,
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
				readProject: () => store.getState(),
				modelDefaults: () => ({
					project: store.getState().models,
					account: account.getState().models,
				}),
				editScript: (ops) => {
					const current = isScriptReadCurrent();
					const report = applyRefineOps(editor, ops);
					if (current) markScriptRead();
					return report;
				},
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
				captionMedia,
				setElementResult: (id, url) => {
					const [element] = requireElement(editor, id);
					if (!isUploadable(element))
						throw new Error(
							`${id} is a ${element.type} element and can't take a file.`,
						);
					return commitUploaded(
						queue,
						buildNode(element, buildContext()),
						uploadedMedia(store.getState().media, url, uploadKindOf(element)),
					);
				},
				viewMedia: async (item) => resultView(await uploadedResult(item)),
				...pick(store.getState(), PROJECT_SETTERS),
			};
			return executeToolCall(call, ctx);
		},
		[editor, store, account, queue, buildContext, projectId, captionMedia],
	);
}
