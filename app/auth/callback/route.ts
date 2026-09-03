import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/api/logger";

export async function GET(request: Request) {
	const { searchParams, origin } = new URL(request.url);
	const code = searchParams.get("code");

	const failed = NextResponse.redirect(
		`${origin}/login?error=auth_callback_failed`,
	);
	if (!code) return failed;

	const supabase = await createClient();
	const { error } = await supabase.auth.exchangeCodeForSession(code);
	if (error) {
		logger.error(error, "Auth callback failed");
		return failed;
	}
	return NextResponse.redirect(`${origin}/`);
}
