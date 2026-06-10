import { NextRequest, NextResponse } from "next/server";
import { getTTSProvider } from "@/lib/api/providers";
import { withAuth } from "@/lib/api/with-auth";
import { voiceSearchParamsSchema } from "@/lib/project/types";

export async function GET(request: NextRequest) {
	return withAuth("Voice search", async () => {
		const params = voiceSearchParamsSchema.parse(
			Object.fromEntries(request.nextUrl.searchParams),
		);
		const voices = await getTTSProvider().search(params);
		return NextResponse.json({ voices });
	});
}
