import { NextResponse } from "next/server";
import { z } from "zod";
import { unauthorized } from "@/lib/api/response";
import { createPublicRouteHandler } from "@/lib/api/route-handler";
import { createClient } from "@/lib/supabase/server";

const Outcome = z.enum(["valid", "invalid", "inactive", "expired"]);

const REJECTIONS: Record<Exclude<z.infer<typeof Outcome>, "valid">, string> = {
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

export const POST = createPublicRouteHandler({
	schema: ValidateCodeRequest,
	label: "validate-code",
	handle: async ({ input }) => {
		const supabase = await createClient();
		const { data, error } = await supabase.rpc("validate_access_code", {
			p_code: input.code.toUpperCase(),
		});

		if (error) throw error;
		const outcome = Outcome.parse(data);
		if (outcome !== "valid") return unauthorized(REJECTIONS[outcome]);

		return NextResponse.json({ redirect: "/signup" });
	},
});
