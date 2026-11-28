import type { NextRequest } from "next/server";
import { notFound } from "./response";

const LOOPBACK_HOSTS = ["localhost", "127.0.0.1", "[::1]"];

/** A local agent acts on this computer, so only loopback may reach one. A browser always sends its Origin, which must be this page; other local clients send none. */
export function isLocalRequest(request: NextRequest): boolean {
	if (process.env.NODE_ENV !== "development") return false;
	const url = new URL(request.url);
	const forwardedHost = request.headers.get("x-forwarded-host");
	const origin = request.headers.get("origin");
	return (
		LOOPBACK_HOSTS.includes(url.hostname) &&
		(forwardedHost === null || forwardedHost === url.host) &&
		(origin === null || origin === url.origin)
	);
}

export const localOnly =
	(handler: (request: NextRequest) => Promise<Response>) =>
	async (request: NextRequest) =>
		isLocalRequest(request) ? handler(request) : notFound();
