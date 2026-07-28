import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { badRequest } from "@/lib/api/response";
import { createPublicQueryRouteHandler } from "@/lib/api/route-handler";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const ImpersonateRequest = z.object({
	email: z.email({ error: "A valid email query param is required" }),
});

const impersonate = createPublicQueryRouteHandler({
	schema: ImpersonateRequest,
	label: "impersonate",
	handle: async ({ input, request }) => {
		// `recovery` targets an existing user and errors when the email is
		// unknown; `magiclink` would silently create a junk account instead.
		const { data, error } = await createServiceClient().auth.admin.generateLink(
			{
				type: "recovery",
				email: input.email,
			},
		);
		if (error) {
			if (error.status && error.status < 500)
				return badRequest(
					`Cannot impersonate ${input.email}: ${error.message}`,
				);
			throw error;
		}

		const supabase = await createClient();
		const { error: verifyError } = await supabase.auth.verifyOtp({
			token_hash: data.properties.hashed_token,
			type: "recovery",
		});
		if (verifyError) throw verifyError;

		return NextResponse.redirect(new URL("/", request.url));
	},
});

// Signs the caller in as an existing user with no email delivery, against
// whichever Supabase project the environment points at — production included.
export async function GET(request: NextRequest) {
	if (process.env.NODE_ENV === "production")
		return new NextResponse(null, { status: 404 });

	return impersonate(request);
}
