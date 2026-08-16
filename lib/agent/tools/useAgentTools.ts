"use client";

import { useMemo } from "react";
import type { Editor } from "slate";
import { clearEditor } from "@/lib/canvas/editorOps";
import { useConfig } from "@/lib/config/ConfigProvider";
import { applyRefineOps } from "@/lib/script/refine/applyOps";
import { useScriptControl } from "@/lib/script/ScriptProvider";
import type { AgentToolContext } from "./defineTool";
import { executeToolCall, type AgentToolCall } from "./registry";

/**
 * The stream appends anything it cannot find by id, so a script left in place
 * would end up with the new one stacked under it.
 */
export async function writeScriptOnto(
	editor: Editor,
	brief: string,
	submit: (brief: string) => Promise<void>,
): Promise<void> {
	clearEditor(editor);
	await submit(brief);
}

/** Binds the canvas verbs the tools are written against. */
export function useAgentTools(editor: Editor) {
	const { connectorConfig } = useConfig();
	const { submitPrompt } = useScriptControl();

	return useMemo(() => {
		const ctx: AgentToolContext = {
			editScript: (ops) => applyRefineOps(editor, ops, connectorConfig),
			writeScript: (brief) => writeScriptOnto(editor, brief, submitPrompt),
		};
		return (call: AgentToolCall) => executeToolCall(call, ctx);
	}, [editor, connectorConfig, submitPrompt]);
}
