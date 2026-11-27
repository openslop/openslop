import { NextResponse } from "next/server";
import type { ApiErrorEnvelope } from "./error-envelope";

function errorResponse(body: ApiErrorEnvelope, status: number) {
	return NextResponse.json<ApiErrorEnvelope>(body, { status });
}

export function badRequest(message: string) {
	return errorResponse({ error: message }, 400);
}

export function notFound() {
	return errorResponse({ error: "Not found" }, 404);
}

export function serverError(message: string) {
	return errorResponse({ error: message }, 500);
}

export function unauthorized(message = "Unauthorized") {
	return errorResponse({ error: message }, 401);
}

export function outOfBalance() {
	return errorResponse(
		{
			error:
				"You've run out of balance for OpenSlop models. Please top up your account or pick a different provider via Profile picture > Settings > Models. Contact hi@openslop.ai or post on our Discord for help: https://discord.gg/zeP5482ced",
		},
		402,
	);
}
