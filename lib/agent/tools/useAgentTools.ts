"use client";

import { useCallback } from "react";
import type { Editor } from "slate";
import compact from "lodash/compact";
import pick from "lodash/pick";
import { getAssets, referenceUrls } from "@/lib/canvas/assets";
import { findElementById } from "@/lib/canvas/editorOps";
import { serializeOSMLWithScenes } from "@/lib/canvas/osmlSerializer";
import { countSpokenWords } from "@/lib/canvas/spokenWords";
import {
	isGenerated,
	type ElementType,
	type CanvasElement,
} from "@/lib/canvas/types";
import {
	measureElementLengths,
	measureRuntime,
} from "@/lib/render/elementLengths";
import { useGenerationQueue } from "@/lib/generation/GenerationQueueProvider";
import { buildNodes } from "@/lib/generation/generationGraph";
import { staleReason } from "@/lib/generation/staleReason";
import { useBuildContext } from "@/lib/generation/useBuildContext";
import { getPrimaryUrl } from "@/lib/connectors/assetUrl";
import { createConnector } from "@/lib/connectors/factory";
import { getPromptText } from "@/lib/generation/inputs";
import { applyRefineOps } from "@/lib/script/refine/applyOps";
import { useProjectStoreHandle } from "@/lib/project/ProjectStoreProvider";
import type { ScriptSource } from "@/lib/script/prompt/build";
import { streamScript } from "@/lib/script/streamScript";
import { elementState } from "../elementState";
import type { AgentToolContext, ElementImage } from "./context";
import { executeToolCall } from "./registry";

type PicturesOf = (element: CanvasElement) => ElementImage["pictures"];

export function useAgentTools(editor: Editor) {
	const store = useProjectStoreHandle();
	const queue = useGenerationQueue();
	const buildContext = useBuildContext();

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
			const generated: PicturesOf = (element) => {
				const { status, result } = queue.getElementSnapshot(element.id);
				return { status, urls: compact([getPrimaryUrl(result, "image")]) };
			};
			const picturesOf: Partial<Record<ElementType, PicturesOf>> = {
				image: generated,
				asset_avatar: generated,
				asset_references: (element) => ({
					status: "idle",
					urls: referenceUrls([element]),
				}),
			};
			const ctx: AgentToolContext = {
				readScript: () => serializeOSMLWithScenes(editor.children),
				countSpokenWords: () => countSpokenWords(editor.children),
				measureElementLengths: () => measureElementLengths(editor.children),
				measureRuntime: () => measureRuntime(editor.children),
				elementImage: (id) => {
					const element = findElementById(editor, id)?.[0];
					return (
						element && {
							type: element.type,
							prompt: getPromptText(element),
							pictures: picturesOf[element.type]?.(element),
						}
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
					const { text } = await llm().generate({ prompt, ...options });
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
				...pick(store.getState(), [
					"setTitle",
					"updateScriptSettings",
					"updateVideoSettings",
				]),
			};
			return executeToolCall(call, ctx);
		},
		[editor, store, queue, buildContext],
	);
}
