import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

const AUTH_ROUTES = ["/login", "/signup"];

export async function updateSession(request: NextRequest) {
	let supabaseResponse = NextResponse.next({ request });

	const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
		cookies: {
			getAll() {
				return request.cookies.getAll();
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value }) =>
					request.cookies.set(name, value),
				);
				supabaseResponse = NextResponse.next({ request });
				cookiesToSet.forEach(({ name, value, options }) =>
					supabaseResponse.cookies.set(name, value, options),
				);
			},
		},
	});

	// Refresh session — do not remove this line
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (user && AUTH_ROUTES.includes(request.nextUrl.pathname)) {
		const redirect = NextResponse.redirect(new URL("/", request.url));
		// getUser() may have rotated the session onto supabaseResponse. A fresh
		// redirect response would drop those Set-Cookie headers, leaving the
		// browser holding a refresh token Supabase has already consumed.
		for (const cookie of supabaseResponse.cookies.getAll()) {
			redirect.cookies.set(cookie);
		}
		return redirect;
	}

	return supabaseResponse;
}
