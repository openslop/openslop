import type {
	LanguageModelV4Message,
	LanguageModelV4Prompt,
	LanguageModelV4ToolResultPart,
} from "@ai-sdk/provider";

const PICTURE_DROPPED = {
	type: "text" as const,
	text: "An earlier picture, not kept. Look again if you still need it.",
};

function dropPictures(
	part: LanguageModelV4ToolResultPart,
): LanguageModelV4ToolResultPart {
	if (part.output.type !== "content") return part;
	const value = part.output.value.map((item) => {
		if (item.type === "file" && item.mediaType.startsWith("image"))
			return PICTURE_DROPPED;
		return item;
	});
	return { ...part, output: { ...part.output, value } };
}

function withoutPictures(
	message: LanguageModelV4Message,
): LanguageModelV4Message {
	if (message.role !== "tool") return message;
	const content = message.content.map((part) => {
		if (part.type !== "tool-result") return part;
		return dropPictures(part);
	});
	return { ...message, content };
}

/** Every tool-result picture before the latest tool message is swapped for a note. */
export function keepLatestPictures(
	prompt: LanguageModelV4Prompt,
): LanguageModelV4Prompt {
	const latest = prompt.findLastIndex((message) => message.role === "tool");
	return prompt.map((message, index) => {
		if (index >= latest) return message;
		return withoutPictures(message);
	});
}
