import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import type { LanguageModelV3FunctionTool } from "@ai-sdk/provider";
import type { McpServer } from "@agentclientprotocol/sdk";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
	CallToolRequestSchema,
	ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

export type ToolCall = { toolName: string; input: unknown };

export type ToolServer = { declaration: McpServer; close(): void };

/**
 * Offers the app's tools to an agent over MCP on loopback. A call is handed to
 * `onCall` and never answered here: the editor runs it, and the step ends.
 */
export async function serveTools(
	tools: LanguageModelV3FunctionTool[],
	onCall: (call: ToolCall) => void,
): Promise<ToolServer> {
	// Raw JSON Schemas are the advanced case the low-level Server is kept for.
	const mcp = () => {
		const server = new Server(
			{ name: "openslop", version: "1.0.0" },
			{ capabilities: { tools: {} } },
		);
		server.setRequestHandler(ListToolsRequestSchema, () => ({
			tools: tools.map(({ name, description, inputSchema }) => ({
				name,
				description,
				inputSchema: { type: "object" as const, ...inputSchema },
			})),
		}));
		server.setRequestHandler(CallToolRequestSchema, ({ params }) => {
			onCall({ toolName: params.name, input: params.arguments ?? {} });
			return new Promise<never>(() => {});
		});
		return server;
	};

	const path = `/${randomUUID()}`;
	const http = createServer(async (request, response) => {
		if (request.url !== path) return response.writeHead(404).end();
		const transport = new StreamableHTTPServerTransport({
			sessionIdGenerator: undefined,
		});
		await mcp().connect(transport);
		await transport.handleRequest(request, response);
	});
	await new Promise<void>((resolve) => http.listen(0, "127.0.0.1", resolve));
	const { port } = http.address() as AddressInfo;

	return {
		declaration: {
			type: "http",
			name: "openslop",
			url: `http://127.0.0.1:${port}${path}`,
			headers: [],
		},
		close: () => {
			http.closeAllConnections();
			http.close();
		},
	};
}
