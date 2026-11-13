import type {
	LanguageModelV4Prompt,
	LanguageModelV4ToolResultOutput,
} from "@ai-sdk/provider";

type ContentItem = Extract<
	LanguageModelV4ToolResultOutput,
	{ type: "content" }
>["value"][number];

type PictureLimit = { limit: number; batch: number };

const pictureDropped = ({ limit, batch }: PictureLimit): ContentItem => ({
	type: "text",
	text: `An earlier picture, dropped because only the newest ${limit} pictures stay in view. Go by what you saw of it. To see it again, look at no more than ${limit - batch + 1} pictures at a time.`,
});

const isPicture = (item: ContentItem) =>
	item.type === "file" && item.mediaType.startsWith("image");

const pictures = (prompt: LanguageModelV4Prompt) =>
	prompt
		.flatMap((message) => (message.role === "tool" ? message.content : []))
		.flatMap((part) =>
			part.type === "tool-result" && part.output.type === "content"
				? part.output.value
				: [],
		)
		.filter(isPicture);

/** Past `limit`, the oldest pictures become a note, `batch` at a time so a cached prefix moves less. */
export function keepNewestPictures(
	prompt: LanguageModelV4Prompt,
	picturesKept: PictureLimit,
): LanguageModelV4Prompt {
	const { limit, batch } = picturesKept;
	const all = pictures(prompt);
	if (all.length <= limit) return prompt;
	const dropped = new Set(
		all.slice(0, Math.ceil((all.length - limit) / batch) * batch),
	);
	const note = pictureDropped(picturesKept);
	return prompt.map((message) => {
		if (message.role !== "tool") return message;
		const content = message.content.map((part) => {
			if (part.type !== "tool-result" || part.output.type !== "content")
				return part;
			const value = part.output.value.map((item) =>
				dropped.has(item) ? note : item,
			);
			return { ...part, output: { ...part.output, value } };
		});
		return { ...message, content };
	});
}
