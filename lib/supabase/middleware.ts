import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseAnonKey, supabaseUrl } from "./env";

const AUTH_ROUTES = ["/login", "/signup"];

export async function updateSession(request: NextRequest) {
	let supabaseResponse = NextResponse.next({ request });

	const supabase = createServerClient(supabaseUrl(), supabaseAnonKey(), {
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
		// Carry over whatever `getUser` rotated, or the redirect signs the user out.
		const redirect = NextResponse.redirect(new URL("/", request.url));
		for (const cookie of supabaseResponse.cookies.getAll())
			redirect.cookies.set(cookie);
		return redirect;
	}

	return supabaseResponse;
}
