"use client";

import { useMemo } from "react";
import type { Editor } from "slate";
import { clearEditor } from "@/lib/canvas/editorOps";
import { serializeOSMLWithScenes } from "@/lib/canvas/osmlSerializer";
import { useConfig } from "@/lib/config/ConfigProvider";
import { applyRefineOps } from "@/lib/script/refine/applyOps";
import { normalizeCharacterName } from "@/lib/project/characterName";
import { useProjectStoreHandle } from "@/lib/project/ProjectStoreProvider";
import { useScriptControl } from "@/lib/script/ScriptProvider";
import type { AgentToolContext } from "./context";
import { executeToolCall } from "./registry";

export function useAgentTools(editor: Editor) {
	const { connectorConfig } = useConfig();
	const { submitPrompt } = useScriptControl();
	const store = useProjectStoreHandle();

	return useMemo(() => {
		const ctx: AgentToolContext = {
			readScript: () => serializeOSMLWithScenes(editor.children),
			readMetadata: () => store.getState().metadata,
			clearScript: () => clearEditor(editor),
			editScript: (ops) => applyRefineOps(editor, ops, connectorConfig),
			writeScript: submitPrompt,
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
		return (call: { toolName: string; input: unknown }) =>
			executeToolCall(call, ctx);
	}, [editor, connectorConfig, submitPrompt, store]);
}
