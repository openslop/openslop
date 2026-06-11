import { unstable_cache } from "next/cache";
import { openai } from "@ai-sdk/openai";
import { embed } from "ai";

const embedModel = openai.embedding("text-embedding-3-small");

const providerOptions = { openai: { dimensions: 512 } };

export const embedText = unstable_cache(
	(text: string): Promise<number[]> =>
		embed({ model: embedModel, value: text, providerOptions }).then(
			(r) => r.embedding,
		),
	["voice-embedding"],
	{ revalidate: 604800 },
);
