import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
	return await updateSession(request);
}

// `api` is excluded because every route under it authenticates itself through
// `withApiAccess`/`withSession`, which refresh the session the same way this
// does. Running here too costs a second Supabase Auth round trip per request,
// on a path polled once a second per in-flight generation job.
export const config = {
	matcher: [
		"/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
