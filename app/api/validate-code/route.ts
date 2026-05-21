import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ERROR_MESSAGES: Record<string, string> = {
	invalid: "Invalid access code",
	inactive: "This code is no longer active",
	expired: "This code has expired",
};

export async function POST(request: NextRequest) {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid code format" }, { status: 400 });
	}
	const code =
		body && typeof body === "object" && "code" in body
			? (body as { code: unknown }).code
			: undefined;

	if (!code || typeof code !== "string" || code.length !== 6) {
		return NextResponse.json({ error: "Invalid code format" }, { status: 400 });
	}

	const supabase = await createClient();

	const { data, error } = await supabase.rpc("validate_access_code", {
		p_code: code.toUpperCase(),
	});

	if (error || typeof data !== "string") {
		return NextResponse.json({ error: "Invalid access code" }, { status: 401 });
	}

	if (data !== "valid") {
		return NextResponse.json(
			{ error: ERROR_MESSAGES[data] ?? "Invalid access code" },
			{ status: 401 },
		);
	}

	return NextResponse.json({ redirect: "/signup" });
}
