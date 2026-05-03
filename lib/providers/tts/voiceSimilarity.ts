import { embed, embedMany, cosineSimilarity } from "ai";
import { openai } from "@ai-sdk/openai";
import type { VoiceInfo, VoiceSearchParams } from "@/lib/connectors/types";

const SEMANTIC_FIELDS = [
	"query",
	"description",
	"accent",
	"pitch",
	"age",
] as const satisfies ReadonlyArray<keyof VoiceSearchParams>;

const EMBEDDING_MODEL = "text-embedding-3-small";

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
	const model = openai.embedding(EMBEDDING_MODEL);
	const [queryResult, voiceResult] = await Promise.all([
		embed({ model, value: queryText }),
		embedMany({ model, values: voices.map((v) => v.description) }),
	]);

	const scores = new Map(
		voices.map((v, i) => [
			v.id,
			cosineSimilarity(queryResult.embedding, voiceResult.embeddings[i]),
		]),
	);
	return [...voices].sort(
		(a, b) => (scores.get(b.id) ?? -Infinity) - (scores.get(a.id) ?? -Infinity),
	);
}
