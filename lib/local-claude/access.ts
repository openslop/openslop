import type { NextRequest } from "next/server";
import { forbidden, notFound } from "@/lib/api/response";

const LOOPBACK_HOSTS = ["localhost", "127.0.0.1", "[::1]"];

export function localClaudeAccess(request: NextRequest): Response | null {
	if (process.env.NODE_ENV !== "development") return notFound();
	const url = new URL(request.url);
	const forwardedHost = request.headers.get("x-forwarded-host");
	const origin = request.headers.get("origin");
	const loopback =
		LOOPBACK_HOSTS.includes(url.hostname) &&
		(forwardedHost === null || forwardedHost === url.host);
	const sameOrigin =
		origin === url.origin || (!origin && request.method === "GET");
	return loopback && sameOrigin ? null : forbidden();
}
