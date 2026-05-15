import { cosineSimilarity } from "ai";
import type { VoiceInfo, VoiceSearchParams } from "@/lib/connectors/types";
import { embedText, embedTexts } from "../embed";

const SEMANTIC_FIELDS = [
	"query",
	"description",
	"accent",
	"pitch",
	"age",
] as const satisfies ReadonlyArray<keyof VoiceSearchParams>;

export function buildQueryText(params: VoiceSearchParams): string {
	return SEMANTIC_FIELDS.map((k) => params[k])
		.filter((v): v is string => Boolean(v))
		.join(" ")
		.trim();
}

export async function rankBySimilarity(
	voices: VoiceInfo[],
	queryText: string,
): Promise<VoiceInfo[]> {
	if (voices.length === 0) return [];

	const [query, voiceVecs] = await Promise.all([
		embedText(queryText),
		embedTexts(voices.map((v) => v.description)),
	]);

	const scores = new Map(
		voices.map((v, i) => [v.id, cosineSimilarity(query, voiceVecs[i])]),
	);
	return [...voices].sort(
		(a, b) => (scores.get(b.id) ?? -Infinity) - (scores.get(a.id) ?? -Infinity),
	);
}
