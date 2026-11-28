import { createClient } from "@supabase/supabase-js";
import { callTab } from "@/lib/agent/mcp/call-tab";
import { handleMcp } from "@/lib/agent/mcp/server";
import { withErrorEnvelope } from "@/lib/api/with-auth";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

/** A 401 points the agent to Supabase's OAuth server; after sign-in it sends the user's token. */
export const POST = (request: Request) =>
	withErrorEnvelope("MCP", async () => {
		const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
		const supabase = createClient(supabaseUrl(), supabaseAnonKey(), {
			auth: { persistSession: false },
		});
		const user = token && (await supabase.auth.getUser(token)).data.user;
		if (!token || !user)
			return new Response(null, {
				status: 401,
				headers: {
					"WWW-Authenticate": `Bearer resource_metadata="${new URL("/.well-known/oauth-protected-resource", request.url)}"`,
				},
			});
		await supabase.realtime.setAuth(token);
		return handleMcp(request, callTab(supabase, user.id));
	});
