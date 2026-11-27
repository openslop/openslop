import type { NextRequest } from "next/server";
import { notFound } from "./response";

const LOOPBACK_HOSTS = ["localhost", "127.0.0.1", "[::1]"];

/** A local agent acts on this computer, so only a page served from it on loopback may reach one. */
export function isLocalRequest(request: NextRequest): boolean {
	if (process.env.NODE_ENV !== "development") return false;
	const url = new URL(request.url);
	const forwardedHost = request.headers.get("x-forwarded-host");
	const origin = request.headers.get("origin");
	return (
		LOOPBACK_HOSTS.includes(url.hostname) &&
		(forwardedHost === null || forwardedHost === url.host) &&
		origin === url.origin
	);
}

export const localOnly =
	(handler: (request: NextRequest) => Promise<Response>) =>
	async (request: NextRequest) =>
		isLocalRequest(request) ? handler(request) : notFound();
