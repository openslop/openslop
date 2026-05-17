import type { NextRequest } from "next/server";
import type { z } from "zod";
import { logger } from "./logger";
import { badRequest } from "./response";

export type ParseResult<T> =
	| { ok: true; data: T }
	| { ok: false; response: Response };

export async function parseBody<TSchema extends z.ZodType>(
	request: NextRequest,
	schema: TSchema,
	label: string,
): Promise<ParseResult<z.infer<TSchema>>> {
	const parsed = schema.safeParse(await request.json());
	if (parsed.success) return { ok: true, data: parsed.data };
	const message = parsed.error.issues[0]?.message ?? "Invalid request body";
	logger.warn(`${label}: ${message}`);
	return { ok: false, response: badRequest(message) };
}
