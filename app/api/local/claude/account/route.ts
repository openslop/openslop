import { NextRequest, NextResponse } from "next/server";
import { withSession } from "@/lib/api/with-auth";
import { badRequest } from "@/lib/api/response";
import { localClaudeAccess } from "@/lib/local-claude/access";
import { claudeAccount, signInClaude } from "@/lib/local-claude/account";
import { runClaude } from "@/lib/local-claude/process";
import { errorMessage } from "@/lib/errors";

async function account(request: NextRequest) {
	const denied = localClaudeAccess(request);
	if (denied) return denied;
	return withSession("Local Claude account", async (user) => {
		try {
			if (request.method === "POST")
				return NextResponse.json(await signInClaude(user.id, request.signal));
			if (request.method === "DELETE")
				await runClaude(user.id, ["auth", "logout"]);
			return NextResponse.json(await claudeAccount(user.id));
		} catch (error) {
			return badRequest(errorMessage(error));
		}
	});
}

export const GET = account;
export const POST = account;
export const DELETE = account;
