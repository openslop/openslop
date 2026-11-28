"use client";

import { useEffect, useEffectEvent } from "react";
import { useSlateStatic } from "slate-react";
import { BridgeCallSchema, type BridgeCall } from "@/lib/agent/mcp/relay";
import { writeToolInputText } from "@/lib/agent/tap-tool-input";
import { SCRIPT_STREAM_FIELDS } from "@/lib/agent/tools/registry";
import { useAgentTools } from "@/lib/agent/tools/use-agent-tools";
import { apiFetch } from "@/lib/clients/http";
import { errorMessage } from "@/lib/errors";
import { createScriptSink } from "@/lib/script/script-writer";
import { toastError } from "@/lib/toast-error";
import { useOpenWorkspace } from "../canvas/workspace-context";

const ROUTE = "/api/local/mcp/tab";

/** Runs the tool calls a local agent makes over MCP on this project, as Sloppy's own calls run. */
export function AgentBridge() {
	const editor = useSlateStatic();
	const runTool = useAgentTools();
	const openWorkspace = useOpenWorkspace();

	const run = useEffectEvent(async (call: BridgeCall) => {
		openWorkspace();
		// Sloppy's stream writes a drafted script as it arrives; an MCP call arrives whole.
		writeToolInputText(
			SCRIPT_STREAM_FIELDS,
			() => createScriptSink(editor),
			call,
		);
		return runTool(call);
	});

	// Reconnecting would drop the calls in flight, so the stream opens once per tab.
	useEffect(() => {
		const source = new EventSource(ROUTE);
		source.onmessage = async ({ data }) => {
			const call = BridgeCallSchema.parse(JSON.parse(data));
			const outcome = await run(call).catch((error: unknown) => ({
				ok: false as const,
				errorText: errorMessage(error),
			}));
			await apiFetch(ROUTE, {
				method: "POST",
				body: { id: call.id, outcome },
			}).catch(toastError);
		};
		return () => source.close();
	}, []);

	return null;
}
