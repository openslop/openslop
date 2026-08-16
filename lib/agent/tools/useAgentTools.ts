"use client";

import { useMemo } from "react";
import type { Editor } from "slate";
import { clearEditor } from "@/lib/canvas/editorOps";
import { useConfig } from "@/lib/config/ConfigProvider";
import { applyRefineOps } from "@/lib/script/refine/applyOps";
import { useScriptControl } from "@/lib/script/ScriptProvider";
import type { AgentToolContext } from "./defineTool";
import { executeToolCall, type AgentToolCall } from "./registry";

export function useAgentTools(editor: Editor) {
	const { connectorConfig } = useConfig();
	const { submitPrompt } = useScriptControl();

	return useMemo(() => {
		const ctx: AgentToolContext = {
			clearScript: () => clearEditor(editor),
			editScript: (ops) => applyRefineOps(editor, ops, connectorConfig),
			writeScript: submitPrompt,
		};
		return (call: AgentToolCall) => executeToolCall(call, ctx);
	}, [editor, connectorConfig, submitPrompt]);
}
