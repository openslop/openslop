import { NextResponse } from "next/server";
import type { ApiErrorEnvelope } from "./errorEnvelope";

function errorResponse(error: string, status: number) {
	return NextResponse.json<ApiErrorEnvelope>({ error }, { status });
}

export function badRequest(message: string) {
	return errorResponse(message, 400);
}

export function notFound() {
	return errorResponse("Not found", 404);
}

export function serverError(message: string) {
	return errorResponse(message, 500);
}

export function unauthorized(message = "Unauthorized") {
	return errorResponse(message, 401);
}

export function forbidden() {
	return errorResponse(
		"Forbidden, your API access has been revoked. Please contact hi@openslop.ai or post on our Discord server for help.",
		403,
	);
}
