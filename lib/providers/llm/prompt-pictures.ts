import type {
	LanguageModelV4Prompt,
	LanguageModelV4ToolResultOutput,
} from "@ai-sdk/provider";

type ContentItem = Extract<
	LanguageModelV4ToolResultOutput,
	{ type: "content" }
>["value"][number];

type Picture = Extract<ContentItem, { type: "file" }> & {
	data: { type: "url"; url: URL };
};

const isPicture = (item: ContentItem): item is Picture =>
	item.type === "file" &&
	item.mediaType.startsWith("image") &&
	item.data.type === "url";

export const pictures = (prompt: LanguageModelV4Prompt) =>
	prompt
		.flatMap((message) => (message.role === "tool" ? message.content : []))
		.flatMap((part) =>
			part.type === "tool-result" && part.output.type === "content"
				? part.output.value
				: [],
		)
		.filter(isPicture);

const mapPictures = (
	prompt: LanguageModelV4Prompt,
	map: (picture: Picture) => ContentItem,
): LanguageModelV4Prompt =>
	prompt.map((message) => {
		if (message.role !== "tool") return message;
		const content = message.content.map((part) => {
			if (part.type !== "tool-result" || part.output.type !== "content")
				return part;
			const value = part.output.value.map((item) =>
				isPicture(item) ? map(item) : item,
			);
			return { ...part, output: { ...part.output, value } };
		});
		return { ...message, content };
	});

/** Past `limit`, the oldest pictures become a note, `batch` at a time so a cached prefix moves less. */
export function keepNewestPictures(
	prompt: LanguageModelV4Prompt,
	{ limit, batch }: { limit: number; batch: number },
): LanguageModelV4Prompt {
	const all = pictures(prompt);
	if (all.length <= limit) return prompt;
	const dropped = new Set(
		all.slice(0, Math.ceil((all.length - limit) / batch) * batch),
	);
	const note: ContentItem = {
		type: "text",
		text: `An earlier picture, dropped because only the newest ${limit} pictures stay in view. Go by what you saw of it. To see it again, look at no more than ${limit - batch + 1} pictures at a time.`,
	};
	return mapPictures(prompt, (picture) =>
		dropped.has(picture) ? note : picture,
	);
}

/** Every tool-result picture's URL swapped for what `map` gives it, once per URL. */
export async function mapPictureUrls(
	prompt: LanguageModelV4Prompt,
	map: (url: URL) => Promise<URL>,
): Promise<LanguageModelV4Prompt> {
	const hrefs = new Set(pictures(prompt).map(({ data }) => data.url.href));
	const swaps = new Map(
		await Promise.all(
			[...hrefs].map(async (href) => [href, await map(new URL(href))] as const),
		),
	);
	return mapPictures(prompt, (picture) => ({
		...picture,
		data: {
			type: "url",
			url: swaps.get(picture.data.url.href) ?? picture.data.url,
		},
	}));
}
