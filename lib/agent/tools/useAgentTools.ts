"use client";

import { useCallback } from "react";
import type { Editor } from "slate";
import {
	applyNodeVersion,
	clearEditor,
	findNodeById,
} from "@/lib/canvas/editorOps";
import { serializeOSMLWithScenes } from "@/lib/canvas/osmlSerializer";
import { getContentElements } from "@/lib/canvas/scenes";
import { countSpokenWords } from "@/lib/canvas/spokenWords";
import { measureElementLengths } from "@/lib/video/elementLengths";
import { DEFAULT_TRIM_VISUALS_TO_DIALOGUE } from "@/lib/video/scene-builder";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useElementHistoryStore } from "@/lib/generation/ElementHistoryProvider";
import { forElement } from "@/lib/generation/graph";
import { useGenerationQueue } from "@/lib/generation/GenerationQueueProvider";
import { nodeBuilder } from "@/lib/generation/resolveGraph";
import { restoreElementVersion } from "@/lib/generation/restore";
import { staleReason } from "@/lib/generation/staleReason";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { characterAvatarUrl } from "@/lib/project/characterAvatar";
import { pictureElementId } from "@/lib/connectors/animated_image/plugins/still-frame";
import { getPrimaryUrl } from "@/lib/connectors/assetUrl";
import { createConnector } from "@/lib/connectors/factory";
import { useResolveDefaultModels } from "@/lib/connectors/useDefaultModels";
import { getPromptText } from "@/lib/generation/inputs";
import { applyScriptEdit } from "@/lib/generation/scriptEdit";
import { normalizeCharacterName } from "@/lib/project/characterName";
import { useProjectStoreHandle } from "@/lib/project/ProjectStoreProvider";
import { useScriptControl } from "@/lib/script/ScriptProvider";
import { elementState, summarizeVersions } from "../elementState";
import type { AgentToolContext } from "./context";
import { executeToolCall } from "./registry";

export function useAgentTools(editor: Editor) {
	const { connectorConfig } = useConfig();
	const { runScript } = useScriptControl();
	const store = useProjectStoreHandle();
	const defaultModels = useResolveDefaultModels();
	const queue = useGenerationQueue();
	const history = useElementHistoryStore();

	return useCallback(
		(call: { toolName: string; input: unknown }, signal?: AbortSignal) => {
			const nodeFor = (element: CanvasContentElement) =>
				nodeBuilder(connectorConfig, store.getState())(forElement(element));
			const ctx: AgentToolContext = {
				readScript: () => serializeOSMLWithScenes(editor.children),
				countSpokenWords: () => countSpokenWords(editor.children),
				measureElementLengths: () =>
					measureElementLengths(
						editor.children,
						DEFAULT_TRIM_VISUALS_TO_DIALOGUE,
					),
				referenceImages: () => store.getState().referenceImages,
				avatarUrl: (name) => characterAvatarUrl(queue, name),
				elementImage: (id) => {
					const element = findNodeById(editor, id)?.[0];
					if (!element) return undefined;
					const pictureId = pictureElementId(element);
					const { status, result } = queue.getElementSnapshot(pictureId);
					return {
						type: element.type,
						prompt: getPromptText(element),
						picture: pictureId
							? { status, url: getPrimaryUrl(result, "image") }
							: undefined,
					};
				},
				elementStates: () =>
					getContentElements(editor.children).map((element) =>
						elementState(element.id, queue.getElementSnapshot(element.id), () =>
							staleReason(nodeFor(element), queue),
						),
					),
				elementHistory: async (id) => {
					const found = findNodeById(editor, id);
					if (!found) return undefined;
					const [element, path] = found;
					await history.load(id);
					const versions = history.get(id);
					return {
						versions: summarizeVersions(nodeFor(element), versions, queue),
						restore: async (number) => {
							const version = versions[number - 1];
							if (!version) throw new Error(`${id} has no version ${number}`);
							const restored = restoreElementVersion(queue, history, version);
							applyNodeVersion(editor, path, version);
							await restored;
						},
					};
				},
				generateText: async (prompt, options) => {
					const model = defaultModels().llm;
					const llm = createConnector("llm", model, connectorConfig.llm);
					const { text } = await llm.generate({ prompt, ...options });
					return text;
				},
				readMetadata: () => store.getState().metadata,
				editScript: (ops) =>
					applyScriptEdit(
						{
							editor,
							queue,
							connectors: connectorConfig,
							state: store.getState(),
							models: defaultModels(),
						},
						ops,
					),
				// The stream appends what it cannot find by id, so the canvas is cleared
				// first or the new script stacks under the old one.
				writeScript: (brief) => {
					clearEditor(editor);
					return runScript({ kind: "brief", brief }, signal);
				},
				adaptScript: (script, notes) => {
					clearEditor(editor);
					return runScript({ kind: "adapt", script, notes }, signal);
				},
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
		[editor, connectorConfig, runScript, store, defaultModels, queue, history],
	);
}
