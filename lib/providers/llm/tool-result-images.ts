import type {
	LanguageModelV4Prompt,
	LanguageModelV4ToolResultOutput,
} from "@ai-sdk/provider";

type ContentItem = Extract<
	LanguageModelV4ToolResultOutput,
	{ type: "content" }
>["value"][number];

type ImageUrlPart = Extract<ContentItem, { type: "file" }> & {
	data: { type: "url"; url: URL };
};

const isImageUrlPart = (item: ContentItem): item is ImageUrlPart =>
	item.type === "file" &&
	item.mediaType.startsWith("image") &&
	item.data.type === "url";

export const toolResultImages = (prompt: LanguageModelV4Prompt) =>
	prompt
		.flatMap((message) => (message.role === "tool" ? message.content : []))
		.flatMap((part) =>
			part.type === "tool-result" && part.output.type === "content"
				? part.output.value
				: [],
		)
		.filter(isImageUrlPart);

const mapToolResultImages = (
	prompt: LanguageModelV4Prompt,
	map: (image: ImageUrlPart) => ContentItem,
): LanguageModelV4Prompt =>
	prompt.map((message) => {
		if (message.role !== "tool") return message;
		const content = message.content.map((part) => {
			if (part.type !== "tool-result" || part.output.type !== "content")
				return part;
			const value = part.output.value.map((item) =>
				isImageUrlPart(item) ? map(item) : item,
			);
			return { ...part, output: { ...part.output, value } };
		});
		return { ...message, content };
	});

/** Past `max`, the oldest images become a note, `batchSize` at a time so a cached prefix moves less. */
export function keepNewestImages(
	prompt: LanguageModelV4Prompt,
	{ max, batchSize }: { max: number; batchSize: number },
): LanguageModelV4Prompt {
	const images = toolResultImages(prompt);
	if (images.length <= max) return prompt;
	const overflow = Math.ceil((images.length - max) / batchSize) * batchSize;
	const dropped = new Set(images.slice(0, overflow));
	const note: ContentItem = {
		type: "text",
		text: `An earlier image, dropped because only the newest ${max} images stay in view. Go by what you saw of it. To see it again, look at no more than ${max - batchSize + 1} images at a time.`,
	};
	return mapToolResultImages(prompt, (image) =>
		dropped.has(image) ? note : image,
	);
}

/** Each distinct image URL swapped for what `replace` gives it, called once per URL. */
export async function replaceImageUrls(
	prompt: LanguageModelV4Prompt,
	replace: (url: URL) => Promise<URL>,
): Promise<LanguageModelV4Prompt> {
	const hrefs = new Set(
		toolResultImages(prompt).map(({ data }) => data.url.href),
	);
	const replacements = new Map(
		await Promise.all(
			[...hrefs].map(
				async (href) => [href, await replace(new URL(href))] as const,
			),
		),
	);
	return mapToolResultImages(prompt, (image) => ({
		...image,
		data: {
			type: "url",
			url: replacements.get(image.data.url.href) ?? image.data.url,
		},
	}));
}
