import { NextResponse } from "next/server";
import type { ApiErrorEnvelope } from "./error-envelope";

function errorResponse(error: string, status: number) {
	const body: ApiErrorEnvelope = { error };
	return NextResponse.json(body, { status });
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

export function unauthorized() {
	return errorResponse("Unauthorized", 401);
}

export function forbidden() {
	return errorResponse(
		"Forbidden, your API access has been revoked. Please contact hi@openslop.ai or post on our Discord server for help.",
		403,
	);
}
