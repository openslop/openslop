import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getTTSProvider } from "@/lib/api/providers";
import { badRequest } from "@/lib/api/response";
import { withApiAccess } from "@/lib/api/with-auth";
import {
	TTS_ACCENTS,
	TTS_AGES,
	TTS_GENDERS,
	TTS_LANGUAGES,
	TTS_PITCHES,
} from "@/lib/connectors/tts/enums";

const nonBlankString = z.string().min(1);
const queryLimitSchema = z
	.union([z.number(), z.string()])
	.transform((value) =>
		typeof value === "string" && value.trim() === "" ? NaN : Number(value),
	)
	.refine((value) => Number.isFinite(value), {
		message: "must be a finite number",
	})
	.refine((value) => Number.isInteger(value) && value > 0, {
		message: "must be a positive integer",
	})
	.optional();

const voiceSearchQuerySchema = z
	.object({
		gender: z.enum(TTS_GENDERS).optional(),
		age: z.enum(TTS_AGES).optional(),
		pitch: z.enum(TTS_PITCHES).optional(),
		accent: z.enum(TTS_ACCENTS).optional(),
		description: nonBlankString.optional(),
		language: z.enum(TTS_LANGUAGES).optional(),
		query: nonBlankString.optional(),
		name: nonBlankString.optional(),
		limit: queryLimitSchema,
	})
	.strict();

export async function GET(request: NextRequest) {
	return withApiAccess("Voice search", async () => {
		const parsed = voiceSearchQuerySchema.safeParse(
			Object.fromEntries(request.nextUrl.searchParams),
		);
		if (!parsed.success) {
			return badRequest(
				`Invalid voice search parameters: ${parsed.error.issues[0]?.message ?? "unknown error"}`,
			);
		}

		const voices = await getTTSProvider().search(parsed.data);
		return NextResponse.json({ voices });
	});
}
