import isUndefined from "lodash/isUndefined";
import mapValues from "lodash/mapValues";
import omitBy from "lodash/omitBy";
import { ApiErrorEnvelope } from "@/lib/api/error-envelope";

export type QueryParams = Record<string, string | number | undefined>;

type RequestOptions = {
	method?: string;
	body?: unknown;
	params?: QueryParams;
	signal?: AbortSignal;
};

async function readErrorMessage(response: Response): Promise<string> {
	const body: unknown = await response.json().catch(() => undefined);
	return (
		ApiErrorEnvelope.safeParse(body).data?.error ??
		`${response.status} ${response.statusText}`
	);
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

export function buildUrl(url: string, params?: QueryParams): string {
	if (!params) return url;
	const query = new URLSearchParams(
		mapValues(omitBy(params, isUndefined), String),
	).toString();
	return query ? `${url}?${query}` : url;
}

/** The request never reached the server (offline, stalled connection, DNS). */
export class UnreachableError extends Error {
	constructor(cause: unknown) {
		super("Failed to reach the server", { cause });
		this.name = "UnreachableError";
	}
}

// fetch rejects with a TypeError only when no response came back at all;
// an abort is a DOMException and stays as-is.
function asUnreachable(error: unknown): never {
	if (error instanceof TypeError) throw new UnreachableError(error);
	throw error;
}

/** Calls one of our own API routes, surfacing its error envelope as a thrown `Error`. */
export async function apiFetch(
	url: string,
	{ method = "GET", body, params, signal }: RequestOptions = {},
): Promise<Response> {
	const response = await fetch(buildUrl(url, params), {
		...buildInit(method, body),
		signal,
	}).catch(asUnreachable);
	if (!response.ok) throw new Error(await readErrorMessage(response));
	return response;
}

export async function apiJson<T>(
	url: string,
	options?: RequestOptions,
): Promise<T> {
	const response = await apiFetch(url, options);
	return response.json() as Promise<T>;
}
