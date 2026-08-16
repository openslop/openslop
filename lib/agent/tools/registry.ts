import type { ToolResultPart } from "ai";
import { errorMessage } from "@/lib/errors";
import type { AgentTool, AgentToolContext } from "./defineTool";
import { editScriptTool } from "./editScript";
import { writeScriptTool } from "./writeScript";
import type { AgentToolName } from "./specs";

/**
 * The client half of the tool set: each spec bound to the executor that runs it
 * against the canvas. Keyed by the spec names, so a tool the model is offered
 * but nothing can run is a compile error rather than a runtime surprise.
 */
const AGENT_TOOLS: Record<AgentToolName, AgentTool> = {
	edit_script: editScriptTool,
	write_script: writeScriptTool,
};

function isAgentToolName(name: string): name is AgentToolName {
	return name in AGENT_TOOLS;
}

export type AgentToolCall = {
	toolCallId: string;
	toolName: string;
	input: unknown;
};

/** Runs a tool call. A failure is reported, not thrown: the model reads it next turn. */
export async function executeToolCall(
	call: AgentToolCall,
	ctx: AgentToolContext,
): Promise<ToolResultPart> {
	const base = {
		type: "tool-result" as const,
		toolCallId: call.toolCallId,
		toolName: call.toolName,
	};
	const fail = (value: string): ToolResultPart => ({
		...base,
		output: { type: "error-text", value },
	});

	if (!isAgentToolName(call.toolName)) {
		return fail(`Unknown tool "${call.toolName}".`);
	}

	try {
		const value = await AGENT_TOOLS[call.toolName].execute(call.input, ctx);
		return { ...base, output: { type: "text", value } };
	} catch (error) {
		return fail(errorMessage(error));
	}
}
