import { asSchema, type ToolSet } from "ai";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import {
	CallToolRequestSchema,
	ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { sloppyInstructions } from "../prompt";
import { SLOPPY_TOOLS } from "../tools/registry";
import { callTool } from "./relay";

const SPECS: ToolSet = SLOPPY_TOOLS;

const TOOLS = Object.entries(SPECS).map(([name, spec]) => ({
	name,
	description: spec.description,
	inputSchema: {
		type: "object" as const,
		...asSchema(spec.inputSchema).jsonSchema,
	},
}));

const INSTRUCTIONS = sloppyInstructions({})
	.map(({ content }) => content)
	.join("\n\n");

/** Sloppy's tools as a stateless MCP server, each call run by the open project tab. */
export async function handleMcp(request: Request): Promise<Response> {
	// Raw JSON Schemas are the advanced case the low-level Server is kept for.
	const server = new Server(
		{ name: "openslop", version: "1.0.0" },
		{ capabilities: { tools: {} }, instructions: INSTRUCTIONS },
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
