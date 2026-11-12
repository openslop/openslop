import type {
	LanguageModelV4Message,
	LanguageModelV4Prompt,
	LanguageModelV4ToolResultOutput,
} from "@ai-sdk/provider";

type Item = Extract<
	LanguageModelV4ToolResultOutput,
	{ type: "content" }
>["value"][number];

const PICTURE_DROPPED: Item = {
	type: "text",
	text: "An earlier picture, not kept. Look again if you still need it.",
};

const withoutPicture = (item: Item): Item =>
	item.type === "file" && item.mediaType.startsWith("image")
		? PICTURE_DROPPED
		: item;

const withoutPictures = (
	message: LanguageModelV4Message,
): LanguageModelV4Message =>
	message.role === "tool"
		? {
				...message,
				content: message.content.map((part) =>
					part.type === "tool-result" && part.output.type === "content"
						? {
								...part,
								output: {
									...part.output,
									value: part.output.value.map(withoutPicture),
								},
							}
						: part,
				),
			}
		: message;

/** Every tool-result picture before the latest tool message is swapped for a note. */
export function keepLatestPictures(
	prompt: LanguageModelV4Prompt,
): LanguageModelV4Prompt {
	const latest = prompt.findLastIndex((message) => message.role === "tool");
	return prompt.map((message, index) =>
		index < latest ? withoutPictures(message) : message,
	);
}
