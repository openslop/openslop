"use client";

import { useCallback } from "react";
import type { Editor } from "slate";
import { findNodeById } from "@/lib/canvas/editorOps";
import { serializeOSMLWithScenes } from "@/lib/canvas/osmlSerializer";
import { getContentElements } from "@/lib/canvas/scenes";
import { countSpokenWords } from "@/lib/canvas/spokenWords";
import {
	measureElementLengths,
	measureRuntime,
} from "@/lib/render/elementLengths";
import { useConfig } from "@/lib/config/ConfigProvider";
import { forElement } from "@/lib/generation/graph";
import { useGenerationQueue } from "@/lib/generation/GenerationQueueProvider";
import { buildNode } from "@/lib/generation/generationGraph";
import { staleReason } from "@/lib/generation/staleReason";
import { characterAvatarUrl } from "@/lib/project/characterAvatar";
import { getPrimaryUrl } from "@/lib/connectors/assetUrl";
import { createConnector } from "@/lib/connectors/factory";
import { useResolveDefaultModels } from "@/lib/connectors/useDefaultModels";
import { getPromptText } from "@/lib/generation/inputs";
import { applyRefineOps } from "@/lib/script/refine/applyOps";
import { normalizeCharacterName } from "@/lib/project/characterName";
import { useProjectStoreHandle } from "@/lib/project/ProjectStoreProvider";
import type { ScriptSource } from "@/lib/script/prompt/build";
import { streamScript } from "@/lib/script/streamScript";
import { elementState } from "../elementState";
import { useAgentContext } from "../projectContext";
import type { AgentToolContext } from "./context";
import { executeToolCall } from "./registry";

export function useAgentTools(editor: Editor) {
	const { connectorConfig } = useConfig();
	const store = useProjectStoreHandle();
	const defaultModels = useResolveDefaultModels();
	const queue = useGenerationQueue();
	const readSettings = useAgentContext(editor);

	return useCallback(
		(call: { toolName: string; input: unknown }, signal?: AbortSignal) => {
			const llm = () =>
				createConnector("llm", defaultModels().llm, connectorConfig.llm);
			const draftScript = (source: ScriptSource) =>
				streamScript({ editor, store, defaultModels }, llm(), source, signal);
			const ctx: AgentToolContext = {
				readScript: () => serializeOSMLWithScenes(editor.children),
				countSpokenWords: () => countSpokenWords(editor.children),
				measureElementLengths: () => measureElementLengths(editor.children),
				measureRuntime: () => measureRuntime(editor.children),
				referenceImages: () => store.getState().referenceImages,
				avatarUrl: (name) => characterAvatarUrl(queue, name),
				elementImage: (id) => {
					const element = findNodeById(editor, id)?.[0];
					if (!element) return undefined;
					const { status, result } = queue.getElementSnapshot(element.id);
					return {
						type: element.type,
						prompt: getPromptText(element),
						picture:
							element.type === "image"
								? { status, url: getPrimaryUrl(result, "image") }
								: undefined,
					};
				},
				elementStates: () => {
					const ctx = {
						store,
						state: store.getState(),
						canvas: getContentElements(editor.children),
						registry: connectorConfig,
					};
					return ctx.canvas.map((element) =>
						elementState(
							element.id,
							queue.getElementSnapshot(element.id),
							staleReason(buildNode(forElement(element), ctx), queue),
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
				readMetadata: () => store.getState().metadata,
				readSettings,
				editScript: (ops) => applyRefineOps(editor, ops, defaultModels()),
				writeScript: (brief) => draftScript({ kind: "brief", brief }),
				adaptScript: (script, notes) =>
					draftScript({ kind: "adapt", script, notes }),
				setMetadata: (patch) => store.getState().updateMetadata(patch),
				setCharacter: (raw, patch) => {
					const name = normalizeCharacterName(raw);
					const { metadata, setCharacter, updateCharacter } = store.getState();
					const created = !(name in metadata.characters);
					if (created)
						setCharacter(name, {
							appearance: "",
							avatarModel: defaultModels().image,
							...patch,
						});
					else updateCharacter(name, patch);
					return { name, created };
				},
			};
			return executeToolCall(call, ctx);
		},
		[editor, connectorConfig, store, defaultModels, queue, readSettings],
	);
}
