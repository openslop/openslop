import isUndefined from "lodash/isUndefined";
import mapValues from "lodash/mapValues";
import omitBy from "lodash/omitBy";
import type { z } from "zod";
import { ApiErrorEnvelope, type ApiErrorCode } from "@/lib/api/error-envelope";

export type QueryParams = Record<string, string | number | undefined>;

type RequestOptions = {
	method?: string;
	body?: unknown;
	params?: QueryParams;
	signal?: AbortSignal;
};

async function readError(
	response: Response,
): Promise<{ message: string; code?: ApiErrorCode }> {
	const body: unknown = await response.json().catch(() => undefined);
	const envelope = ApiErrorEnvelope.safeParse(body).data;
	return {
		message: envelope?.error ?? `${response.status} ${response.statusText}`,
		code: envelope?.code,
	};
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

/** A route answered with an error; `requestId` finds the request in Vercel's logs. */
export class ApiError extends Error {
	constructor(
		message: string,
		readonly requestId: string | null,
		readonly code?: ApiErrorCode,
	) {
		super(message);
		this.name = "ApiError";
	}
}

// fetch rejects with a TypeError only when no response came back at all;
// an abort is a DOMException and stays as-is.
function asUnreachable(error: unknown): never {
	if (error instanceof TypeError) throw new UnreachableError(error);
	throw error;
}

/** `fetch` for our own API routes, surfacing their error envelope as a thrown `ApiError`. */
export const fetchOrThrow: typeof fetch = async (input, init) => {
	const response = await fetch(input, init).catch(asUnreachable);
	if (!response.ok) {
		const { message, code } = await readError(response);
		throw new ApiError(message, response.headers.get("x-vercel-id"), code);
	}
	return response;
};

export const apiFetch = (
	url: string,
	{ method = "GET", body, params, signal }: RequestOptions = {},
): Promise<Response> =>
	fetchOrThrow(buildUrl(url, params), { ...buildInit(method, body), signal });

export async function apiJson<T>(
	url: string,
	schema: z.ZodType<T>,
	options?: RequestOptions,
): Promise<T> {
	const response = await apiFetch(url, options);
	return schema.parse(await response.json());
}
