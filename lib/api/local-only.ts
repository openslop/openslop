import type { NextRequest } from "next/server";
import { notFound } from "./response";

const LOOPBACK_HOSTS = ["localhost", "127.0.0.1", "[::1]"];

/** Only loopback may reach a local agent: a page from this origin, or a local client, which sends no Sec-Fetch-Site. */
export function isLocalRequest(request: NextRequest): boolean {
	if (process.env.NODE_ENV !== "development") return false;
	const url = new URL(request.url);
	const forwardedHost = request.headers.get("x-forwarded-host");
	const site = request.headers.get("sec-fetch-site");
	return (
		LOOPBACK_HOSTS.includes(url.hostname) &&
		(forwardedHost === null || forwardedHost === url.host) &&
		(site === null || site === "same-origin")
	);
}

export const localOnly =
	(handler: (request: NextRequest) => Promise<Response>) =>
	async (request: NextRequest) =>
		isLocalRequest(request) ? handler(request) : notFound();
