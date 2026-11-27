// An ACP agent on stdio that thinks, says hello, then calls the first tool it was given.
import { Readable, Writable } from "node:stream";
import * as acp from "@agentclientprotocol/sdk";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const servers = new Map();

acp
	.agent({ name: "fake" })
	.onRequest(acp.methods.agent.initialize, () => ({
		protocolVersion: acp.PROTOCOL_VERSION,
		agentCapabilities: { mcpCapabilities: { http: true } },
	}))
	.onRequest(acp.methods.agent.session.new, ({ params }) => {
		const sessionId = crypto.randomUUID();
		servers.set(sessionId, params.mcpServers[0]);
		return { sessionId };
	})
	.onNotification(acp.methods.agent.session.cancel, () => {})
	.onRequest(acp.methods.agent.session.prompt, async ({ params, client }) => {
		const say = (sessionUpdate, text) =>
			client.notify(acp.methods.client.session.update, {
				sessionId: params.sessionId,
				update: { sessionUpdate, content: { type: "text", text } },
			});
		await say("agent_thought_chunk", "Thinking.");
		await say("agent_message_chunk", "Hello");
		await say("agent_message_chunk", " there.");
		await client.notify(acp.methods.client.session.update, {
			sessionId: params.sessionId,
			update: { sessionUpdate: "tool_call", toolCallId: "own", title: "Read" },
		});
		await say("agent_message_chunk", "Done.");
		const server = servers.get(params.sessionId);
		if (!server) return { stopReason: "end_turn" };
		const mcp = new Client({ name: "fake", version: "1" });
		await mcp.connect(new StreamableHTTPClientTransport(new URL(server.url)));
		const { tools } = await mcp.listTools();
		await mcp.callTool({ name: tools[0].name, arguments: { text: "hi" } });
		return { stopReason: "end_turn" };
	})
	.connect(
		acp.ndJsonStream(
			Writable.toWeb(process.stdout),
			Readable.toWeb(process.stdin),
		),
	);
