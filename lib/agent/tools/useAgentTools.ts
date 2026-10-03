"use client";

import { useCallback } from "react";
import type { Editor } from "slate";
import compact from "lodash/compact";
import { getAssets, referenceUrls } from "@/lib/canvas/assets";
import { setAsset } from "@/lib/canvas/assetOps";
import { findNodeById } from "@/lib/canvas/editorOps";
import { serializeOSMLWithScenes } from "@/lib/canvas/osmlSerializer";
import { countSpokenWords } from "@/lib/canvas/spokenWords";
import {
	connectorOf,
	isGenerated,
	type ScriptElement,
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

export function useAgentTools(editor: Editor) {
	const store = useProjectStoreHandle();
	const queue = useGenerationQueue();
	const buildContext = useBuildContext();

	return useCallback(
		(call: { toolName: string; input: unknown }, signal?: AbortSignal) => {
			const llm = () => createConnector("llm", editor.defaultModels().llm);
			const draftScript = (source: ScriptSource) =>
				streamScript(editor, llm(), source, signal);
			const picturesOf = (element: ScriptElement): ElementImage["pictures"] => {
				if (element.type === "references")
					return { status: "idle", urls: referenceUrls([element]) };
				if (connectorOf(element.type) !== "image") return undefined;
				const { status, result } = queue.getElementSnapshot(element.id);
				return { status, urls: compact([getPrimaryUrl(result, "image")]) };
			};
			const ctx: AgentToolContext = {
				readScript: () => serializeOSMLWithScenes(editor.children),
				countSpokenWords: () => countSpokenWords(editor.children),
				measureElementLengths: () => measureElementLengths(editor.children),
				measureRuntime: () => measureRuntime(editor.children),
				elementImage: (id) => {
					const element = findNodeById(editor, id)?.[0];
					return (
						element && {
							type: element.type,
							prompt: getPromptText(element),
							pictures: picturesOf(element),
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
				readVideoSettings: () => store.getState().videoSettings,
				editScript: (ops) => applyRefineOps(editor, ops),
				writeScript: (brief) => draftScript({ kind: "brief", brief }),
				adaptScript: (script, notes) =>
					draftScript({ kind: "adapt", script, notes }),
				setAsset: (type, name, patch) => setAsset(editor, type, name, patch),
				setVideoSettings: (patch) =>
					store.getState().updateVideoSettings(patch),
			};
			return executeToolCall(call, ctx);
		},
		[editor, store, queue, buildContext],
	);
}
