"use client";

import { useCallback } from "react";
import type { Editor } from "slate";
import { clearEditor } from "@/lib/canvas/editorOps";
import { serializeOSMLWithScenes } from "@/lib/canvas/osmlSerializer";
import { countSpokenWords } from "@/lib/canvas/spokenWords";
import { measureElementLengths } from "@/lib/video/elementLengths";
import { DEFAULT_TRIM_VISUALS_TO_DIALOGUE } from "@/lib/video/scene-builder";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useGenerationQueue } from "@/lib/generation/GenerationQueueProvider";
import { characterAvatarUrl } from "@/lib/project/characterAvatar";
import { createDefaultConnector } from "@/lib/connectors/registry";
import { applyRefineOps } from "@/lib/script/refine/applyOps";
import { normalizeCharacterName } from "@/lib/project/characterName";
import { useProjectStoreHandle } from "@/lib/project/ProjectStoreProvider";
import { useScriptControl } from "@/lib/script/ScriptProvider";
import type { AgentToolContext } from "./context";
import { executeToolCall } from "./registry";

export function useAgentTools(editor: Editor) {
	const { connectorConfig } = useConfig();
	const { runScript } = useScriptControl();
	const store = useProjectStoreHandle();
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
				generateText: async (prompt, options) => {
					const llm = createDefaultConnector(connectorConfig, "llm");
					const { text } = await llm.generate({ prompt, ...options });
					return text;
				},
				readMetadata: () => store.getState().metadata,
				editScript: (ops) => applyRefineOps(editor, ops, connectorConfig),
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
		[editor, connectorConfig, runScript, store, queue],
	);
}
