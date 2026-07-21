type RequestOptions = {
	method?: string;
	body?: unknown;
	params?: Record<string, string>;
};

/** Every internal route answers failures with `{ error }` (see `lib/api/response.ts`). */
async function readErrorMessage(res: Response): Promise<string> {
	const fallback = `${res.status} ${res.statusText}`;
	const detail = await res.json().then(
		(body: unknown) =>
			typeof body === "object" && body !== null && "error" in body
				? body.error
				: undefined,
		() => undefined,
	);
	return (typeof detail === "string" && detail) || fallback;
}

function buildInit(method: string, body: unknown): RequestInit {
	if (body === undefined) return { method };
	if (body instanceof FormData) return { method, body };
	return {
		method,
		headers: { "content-type": "application/json" },
		body: JSON.stringify(body),
	};
}

function buildUrl(url: string, params?: Record<string, string>): string {
	if (!params) return url;
	const qs = new URLSearchParams(
		Object.entries(params).filter(([, value]) => value !== undefined),
	).toString();
	return qs ? `${url}?${qs}` : url;
}

/** Calls one of our own API routes, surfacing its error envelope as a thrown `Error`. */
export async function apiFetch(
	url: string,
	{ method = "GET", body, params }: RequestOptions = {},
): Promise<Response> {
	const res = await fetch(buildUrl(url, params), buildInit(method, body));
	if (!res.ok) throw new Error(await readErrorMessage(res));
	return res;
}

export async function apiJson<T>(
	url: string,
	options?: RequestOptions,
): Promise<T> {
	const res = await apiFetch(url, options);
	return res.json() as Promise<T>;
}
