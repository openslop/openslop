"use client";

import { useEffect, useEffectEvent } from "react";
import { useSlateStatic } from "slate-react";
import {
	agentChannel,
	ANSWER,
	BridgeCallSchema,
	CALL,
	newestTab,
	type BridgeCall,
	type TabPresence,
} from "@/lib/agent/mcp/bridge";
import { writeToolInputText } from "@/lib/agent/tap-tool-input";
import { SCRIPT_STREAM_FIELDS } from "@/lib/agent/tools/registry";
import { useAgentTools } from "@/lib/agent/tools/use-agent-tools";
import { errorMessage } from "@/lib/errors";
import { createScriptSink } from "@/lib/script/script-writer";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/user/user-provider";
import { useOpenWorkspace } from "../canvas/workspace-context";

/** Runs the tool calls the user's own agent makes over MCP on this project, as Sloppy's own calls run. */
export function AgentBridge() {
	const editor = useSlateStatic();
	const runTool = useAgentTools();
	const openWorkspace = useOpenWorkspace();
	const { id: userId } = useUser();

	const run = useEffectEvent(async (call: BridgeCall) => {
		openWorkspace();
		// write_script puts its text on the canvas as the input streams in; MCP calls arrive whole, so write it here.
		writeToolInputText(
			SCRIPT_STREAM_FIELDS,
			() => createScriptSink(editor),
			call,
		);
		return runTool(call);
	});

	useEffect(() => {
		const supabase = createClient();
		const tab = crypto.randomUUID();
		let unmounted = false;
		const channel = supabase
			.channel(agentChannel(userId), {
				config: { private: true, presence: { key: tab } },
			})
			.on("broadcast", { event: CALL }, async ({ payload }) => {
				if (newestTab(channel.presenceState<TabPresence>()) !== tab) return;
				const call = BridgeCallSchema.parse(payload);
				const outcome = await run(call).catch((error: unknown) => ({
					ok: false as const,
					errorText: errorMessage(error),
				}));
				await channel.send({
					type: "broadcast",
					event: ANSWER,
					payload: { id: call.id, outcome },
				});
			});
		void supabase.realtime.setAuth().then(() => {
			if (unmounted) return;
			channel.subscribe((status) => {
				if (status === "SUBSCRIBED")
					void channel.track({ openedAt: Date.now() } satisfies TabPresence);
			});
		});
		return () => {
			unmounted = true;
			void supabase.removeChannel(channel);
		};
	}, [userId]);

	return null;
}
