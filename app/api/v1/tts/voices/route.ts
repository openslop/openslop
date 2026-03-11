import { NextRequest, NextResponse } from "next/server";
import { getTTSProvider } from "@/lib/api/providers";
import { serverError } from "@/lib/api/response";
import { logger } from "@/lib/api/logger";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const query = searchParams.get("query") || undefined;
    const gender = searchParams.get("gender") || undefined;
    const accent = searchParams.get("accent") || undefined;
    const language = searchParams.get("language") || undefined;

    const provider = getTTSProvider();
    const voices = await provider.search({ query, gender, accent, language });

    return NextResponse.json({ voices });
  } catch (error) {
    logger.error(error, "Voice search failed");
    return serverError("Voice search failed");
  }
}
