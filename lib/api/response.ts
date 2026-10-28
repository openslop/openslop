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

export function forbidden() {
	return errorResponse(
		{
			error:
				"Forbidden, your API access has been revoked. Please contact hi@openslop.ai or post on our Discord server for help.",
		},
		403,
	);
}

export function paymentRequired(message: string) {
	return errorResponse({ error: message }, 402);
}
