import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getTTSProvider } from "@/lib/api/providers";
import { badRequest } from "@/lib/api/response";
import { withApiAccess } from "@/lib/api/with-auth";
import { voiceSearchParamsSchema } from "@/lib/project/types";

const voiceSearchQuerySchema = voiceSearchParamsSchema.extend({
	limit: z
		.string()
		.transform((value) => (value.trim() === "" ? NaN : Number(value)))
		.refine((value) => Number.isFinite(value), {
			message: "limit must be a finite number",
		})
		.refine((value) => Number.isInteger(value), {
			message: "limit must be an integer",
		})
		.refine((value) => value > 0, { message: "limit must be positive" })
		.optional(),
});

export async function GET(request: NextRequest) {
	return withApiAccess("Voice search", async () => {
		const parsed = voiceSearchQuerySchema.safeParse(
			Object.fromEntries(request.nextUrl.searchParams),
		);
		if (!parsed.success) {
			return badRequest(
				parsed.error.issues[0]?.message ?? "Invalid voice search query",
			);
		}
		const voices = await getTTSProvider().search(parsed.data);
		return NextResponse.json({ voices });
	});
}
