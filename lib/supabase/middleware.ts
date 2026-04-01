import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseUrl, getSupabaseAnonKey } from "./env";

const AUTH_ROUTES = ["/login", "/signup"];
const API_PREFIX = "/api/v1";

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle API routes with Bearer token auth
  if (pathname.startsWith(API_PREFIX)) {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerClient(
      getSupabaseUrl(),
      getSupabaseAnonKey(),
      {
        cookies: { getAll: () => [], setAll: () => {} },
      },
    );

    const { error } = await supabase.auth.getUser(token);
    if (error) {
      return NextResponse.json({ error }, { status: 401 });
    }

    return NextResponse.next({ request });
  }

  // Cookie-based session refresh for non-API routes
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({
          request,
        });
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

  // Redirect authenticated users away from auth-only routes
  if (user && AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return supabaseResponse;
}
