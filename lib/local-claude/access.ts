import type { NextRequest } from "next/server";
import { forbidden, notFound } from "@/lib/api/response";

export function localClaudeAccess(request: NextRequest): Response | null {
	if (process.env.NODE_ENV !== "development") return notFound();
	const url = new URL(request.url);
	if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname))
		return forbidden();
	if (request.headers.has("x-forwarded-host")) {
		if (request.headers.get("x-forwarded-host") !== url.host)
			return forbidden();
	}
	const origin = request.headers.get("origin");
	if (request.method !== "GET" && origin !== url.origin) return forbidden();
	if (origin && origin !== url.origin) return forbidden();
	return null;
}
