import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
	return await updateSession(request);
}

// `api` is excluded: those routes refresh the session themselves via
// `withApiAccess`/`withSession`, so running here too doubles the auth round trip.
export const config = {
	matcher: [
		"/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
