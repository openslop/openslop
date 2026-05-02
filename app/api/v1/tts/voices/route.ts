import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/api/auth";
import { logger } from "@/lib/api/logger";
import { getTTSProvider } from "@/lib/api/providers";
import { serverError, unauthorized } from "@/lib/api/response";
import { genderSchema } from "@/lib/project/types";

export async function GET(request: NextRequest) {
	try {
		const user = await getUser();
		if (!user) return unauthorized();

		const { searchParams } = request.nextUrl;
		const query = searchParams.get("query") || undefined;
		const gender = genderSchema.parse(searchParams.get("gender"));
		const age = searchParams.get("age") || undefined;
		const pitch = searchParams.get("pitch") || undefined;
		const accent = searchParams.get("accent") || undefined;
		const description = searchParams.get("description") || undefined;
		const language = searchParams.get("language") || undefined;

		const provider = getTTSProvider();
		const voices = await provider.search({
			query,
			gender,
			age,
			pitch,
			accent,
			description,
			language,
		});

		return NextResponse.json({ voices });
	} catch (error) {
		logger.error(error, "Voice search failed");
		return serverError("Voice search failed");
	}
}
