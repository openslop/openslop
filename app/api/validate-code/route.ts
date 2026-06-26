import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseBody } from "@/lib/api/parse";
import { withPublic } from "@/lib/api/with-auth";
import { createClient } from "@/lib/supabase/server";

const ERROR_MESSAGES: Record<string, string> = {
	invalid: "Invalid access code",
	inactive: "This code is no longer active",
	expired: "This code has expired",
};

const INVALID_FORMAT = "Invalid code format";
const ValidateCodeRequest = z.object(
	{
		code: z
			.string({ error: INVALID_FORMAT })
			.length(6, { message: INVALID_FORMAT }),
	},
	INVALID_FORMAT,
);

export async function POST(request: NextRequest) {
	return withPublic("validate-code", async () => {
		const parsed = await parseBody(
			request,
			ValidateCodeRequest,
			"validate-code",
		);
		if (!parsed.ok) return parsed.response;

		const supabase = await createClient();
		const { data, error } = await supabase.rpc("validate_access_code", {
			p_code: parsed.data.code.toUpperCase(),
		});

		if (error) throw error;
		if (typeof data !== "string") {
			throw new Error("validate_access_code returned an unexpected result");
		}
		if (data !== "valid") {
			return NextResponse.json(
				{ error: ERROR_MESSAGES[data] ?? "Invalid access code" },
				{ status: 401 },
			);
		}

		return NextResponse.json({ redirect: "/signup" });
	});
}
