import { NextResponse } from "next/server";

export function badRequest(message: string) {
	return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound() {
	return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export function serverError(message: string) {
	return NextResponse.json({ error: message }, { status: 500 });
}

export function unauthorized() {
	return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden() {
	return NextResponse.json(
		{
			error:
				"Forbidden, your API access has been revoked. Please contact hi@openslop.ai or post on our Discord server for help.",
		},
		{ status: 403 },
	);
}
