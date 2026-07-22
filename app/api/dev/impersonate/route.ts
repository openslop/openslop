import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseSearchParams } from "@/lib/api/parse";
import { withPublic } from "@/lib/api/with-auth";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const ImpersonateRequest = z.object({
	email: z.email({ error: "A valid email query param is required" }),
});

// Signs the caller in as an existing user with no email delivery, against
// whichever Supabase project the environment points at — production included.
export async function GET(request: NextRequest) {
	if (process.env.NODE_ENV === "production")
		return new NextResponse(null, { status: 404 });

	return withPublic("impersonate", async () => {
		const parsed = parseSearchParams(
			request,
			ImpersonateRequest,
			"impersonate",
		);
		if (!parsed.ok) return parsed.response;

		const { data, error } = await createServiceClient().auth.admin.generateLink(
			{
				type: "magiclink",
				email: parsed.data.email,
			},
		);
		if (error) throw error;

		const supabase = await createClient();
		const { error: verifyError } = await supabase.auth.verifyOtp({
			token_hash: data.properties.hashed_token,
			type: "magiclink",
		});
		if (verifyError) throw verifyError;

		return NextResponse.redirect(new URL("/", request.url));
	});
}
