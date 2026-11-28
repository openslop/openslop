import { asSchema, type ToolSet } from "ai";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import {
	CallToolRequestSchema,
	ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { OPENSLOP_INSTRUCTIONS } from "../prompt";
import { SLOPPY_TOOLS } from "../tools/registry";
import type { BridgeOutcome } from "./bridge";

const TOOLS = Object.entries<ToolSet[string]>(SLOPPY_TOOLS).map(
	([name, spec]) => ({
		name,
		description: spec.description,
		inputSchema: {
			type: "object" as const,
			...asSchema(spec.inputSchema).jsonSchema,
		},
	}),
);

/** Sloppy's tools as a stateless MCP server, each call run by `callTool`. */
export async function handleMcp(
	request: Request,
	callTool: (toolName: string, input: unknown) => Promise<BridgeOutcome>,
): Promise<Response> {
	// Raw JSON Schemas are the advanced case the low-level Server is kept for.
	const server = new Server(
		{ name: "openslop", version: "1.0.0" },
		{ capabilities: { tools: {} }, instructions: OPENSLOP_INSTRUCTIONS },
	);
	server.setRequestHandler(ListToolsRequestSchema, () => ({ tools: TOOLS }));
	server.setRequestHandler(CallToolRequestSchema, async ({ params }) => {
		const outcome = await callTool(params.name, params.arguments ?? {});
		return outcome.ok
			? { content: [{ type: "text", text: JSON.stringify(outcome.output) }] }
			: { isError: true, content: [{ type: "text", text: outcome.errorText }] };
	});
	const transport = new WebStandardStreamableHTTPServerTransport({
		sessionIdGenerator: undefined,
		enableJsonResponse: true,
	});
	await server.connect(transport);
	return transport.handleRequest(request);
}
