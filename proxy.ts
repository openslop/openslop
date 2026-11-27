import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
	return await updateSession(request);
}

// `api` routes refresh the session in `withSession`; doing it here too doubles the round trip.
export const config = {
	matcher: [
		"/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
