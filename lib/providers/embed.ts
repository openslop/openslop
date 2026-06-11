import { openai } from "@ai-sdk/openai";
import { embed, embedMany } from "ai";

const embedModel = openai.embedding("text-embedding-3-small");

const providerOptions = { openai: { dimensions: 512 } };

export const embedText = (text: string): Promise<number[]> =>
	embed({ model: embedModel, value: text, providerOptions }).then(
		(r) => r.embedding,
	);

export const embedTexts = (texts: string[]): Promise<number[][]> =>
	embedMany({ model: embedModel, values: texts, providerOptions }).then(
		(r) => r.embeddings,
	);
