import { NextRequest, NextResponse } from "next/server";
import { parseSearchParams } from "@/lib/api/parse";
import { getTTSProvider } from "@/lib/api/providers";
import { withApiAccess } from "@/lib/api/with-auth";
import { voiceSearchParamsSchema } from "@/lib/project/types";

export async function GET(request: NextRequest) {
	return withApiAccess("Voice search", async () => {
		const parsed = parseSearchParams(
			request,
			voiceSearchParamsSchema,
			"Voice search",
		);
		if (!parsed.ok) return parsed.response;
		const voices = await getTTSProvider().search(parsed.data);
		return NextResponse.json({ voices });
	});
}
