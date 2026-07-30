/**
 * Fetches a voice preview URL after verifying its origin matches the
 * provider's allow-list. The origin check covers protocol (HTTPS only),
 * hostname, and port — preventing the caller from coercing a plaintext
 * HTTP request that would leak any attached `Authorization` header.
 * `redirect: "manual"` so any cross-origin redirect is surfaced as a
 * non-`ok` response instead of replaying credentials.
 */
export function fetchAllowedVoicePreview(
	url: string,
	allowedHost: string,
	init?: RequestInit,
): Promise<Response> {
	const allowedOrigin = `https://${allowedHost}`;
	if (new URL(url).origin !== allowedOrigin) {
		throw new Error(`Voice preview origin not allowed: ${url}`);
	}
	return fetch(url, { ...init, redirect: "manual" });
}
