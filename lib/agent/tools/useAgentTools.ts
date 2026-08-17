"use client";

import { useMemo } from "react";
import type { Editor } from "slate";
import { clearEditor } from "@/lib/canvas/editorOps";
import { serializeOSMLWithScenes } from "@/lib/canvas/osmlSerializer";
import { useConfig } from "@/lib/config/ConfigProvider";
import { applyRefineOps } from "@/lib/script/refine/applyOps";
import { useScriptControl } from "@/lib/script/ScriptProvider";
import type { AgentToolContext } from "./context";
import { executeToolCall } from "./registry";

export function useAgentTools(editor: Editor) {
	const { connectorConfig } = useConfig();
	const { submitPrompt } = useScriptControl();

	return useMemo(() => {
		const ctx: AgentToolContext = {
			readScript: () => serializeOSMLWithScenes(editor.children),
			clearScript: () => clearEditor(editor),
			editScript: (ops) => applyRefineOps(editor, ops, connectorConfig),
			writeScript: submitPrompt,
		};
		return (call: { toolName: string; input: unknown }) =>
			executeToolCall(call, ctx);
	}, [editor, connectorConfig, submitPrompt]);
}
