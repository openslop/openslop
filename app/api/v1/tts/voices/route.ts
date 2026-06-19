import { NextRequest, NextResponse } from "next/server";
import { getTTSProvider } from "@/lib/api/providers";
import { badRequest } from "@/lib/api/response";
import { withApiAccess } from "@/lib/api/with-auth";
import { voiceSearchRequestSchema } from "@/lib/project/types";

export async function GET(request: NextRequest) {
	return withApiAccess("Voice search", async () => {
		const parsed = voiceSearchRequestSchema.safeParse(
			Object.fromEntries(request.nextUrl.searchParams),
		);
		if (!parsed.success) {
			return badRequest(
				parsed.error.issues[0]?.message ?? "Invalid voice search",
			);
		}

		const voices = await getTTSProvider().search(parsed.data);
		return NextResponse.json({ voices });
	});
}
