import type { NextRequest } from "next/server";
import type { z } from "zod";
import { logger } from "./logger";
import { badRequest } from "./response";

export type ParseResult<T> =
	| { ok: true; data: T }
	| { ok: false; response: Response };

function toResult<TSchema extends z.ZodType>(
	schema: TSchema,
	input: unknown,
	label: string,
	fallbackMessage: string,
): ParseResult<z.infer<TSchema>> {
	const parsed = schema.safeParse(input);
	if (parsed.success) return { ok: true, data: parsed.data };
	const message = parsed.error.issues[0]?.message ?? fallbackMessage;
	logger.warn(`${label}: ${message}`);
	return { ok: false, response: badRequest(message) };
}

export async function parseBody<TSchema extends z.ZodType>(
	request: NextRequest,
	schema: TSchema,
	label: string,
): Promise<ParseResult<z.infer<TSchema>>> {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		logger.warn(`${label}: malformed JSON body`);
		return { ok: false, response: badRequest("Invalid JSON") };
	}
	return toResult(schema, body, label, "Invalid request body");
}

export async function parseFormData<TSchema extends z.ZodType>(
	request: NextRequest,
	schema: TSchema,
	label: string,
): Promise<ParseResult<z.infer<TSchema>>> {
	let form: FormData;
	try {
		form = await request.formData();
	} catch {
		logger.warn(`${label}: malformed form data`);
		return { ok: false, response: badRequest("Invalid form data") };
	}
	return toResult(schema, Object.fromEntries(form), label, "Invalid form data");
}

export function parseSearchParams<TSchema extends z.ZodType>(
	request: NextRequest,
	schema: TSchema,
	label: string,
): ParseResult<z.infer<TSchema>> {
	return toResult(
		schema,
		Object.fromEntries(request.nextUrl.searchParams),
		label,
		"Invalid query parameters",
	);
}
