import { MCP_PATH } from "@/lib/agent/mcp/bridge";
import { supabaseUrl } from "@/lib/supabase/env";

/** Where an MCP client signs in: Supabase Auth's OAuth server. */
export function GET(request: Request): Response {
	return Response.json({
		resource: new URL(MCP_PATH, request.url).href,
		authorization_servers: [`${supabaseUrl()}/auth/v1`],
	});
}
