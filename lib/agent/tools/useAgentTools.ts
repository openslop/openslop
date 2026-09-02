"use client";

import { useCallback } from "react";
import type { Editor } from "slate";
import { clearEditor, findNodeById } from "@/lib/canvas/editorOps";
import { serializeOSMLWithScenes } from "@/lib/canvas/osmlSerializer";
import { countSpokenWords } from "@/lib/canvas/spokenWords";
import { measureElementLengths } from "@/lib/video/elementLengths";
import { DEFAULT_TRIM_VISUALS_TO_DIALOGUE } from "@/lib/video/scene-builder";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useGenerationQueue } from "@/lib/generation/GenerationQueueProvider";
import { characterAvatarUrl } from "@/lib/project/characterAvatar";
import { pictureElementId } from "@/lib/connectors/animated_image/plugins/still-frame";
import { getPrimaryUrl } from "@/lib/connectors/assetUrl";
import { createModelConnector } from "@/lib/connectors/registry";
import { useResolveDefaultModels } from "@/lib/connectors/useDefaultModels";
import { getPromptText } from "@/lib/generation/inputs";
import { applyScriptEdit } from "@/lib/generation/scriptEdit";
import { normalizeCharacterName } from "@/lib/project/characterName";
import { useProjectStoreHandle } from "@/lib/project/ProjectStoreProvider";
import { useScriptControl } from "@/lib/script/ScriptProvider";
import type { AgentToolContext } from "./context";
import { executeToolCall } from "./registry";

export function useAgentTools(editor: Editor) {
	const { connectorConfig } = useConfig();
	const { runScript } = useScriptControl();
	const store = useProjectStoreHandle();
	const defaultModels = useResolveDefaultModels();
	const queue = useGenerationQueue();

	return useCallback(
		(call: { toolName: string; input: unknown }, signal?: AbortSignal) => {
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
				generateText: async (prompt, options) => {
					const model = defaultModels().llm;
					const llm = createModelConnector(connectorConfig, "llm", model);
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
					if (created) setCharacter(name, { appearance: "", ...patch });
					else updateCharacter(name, patch);
					return { name, created };
				},
			};
			return executeToolCall(call, ctx);
		},
		[editor, connectorConfig, runScript, store, defaultModels, queue],
	);
}
