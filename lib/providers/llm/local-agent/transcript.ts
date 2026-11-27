import type {
	LanguageModelV3Message,
	LanguageModelV3Prompt,
	LanguageModelV3ToolResultOutput,
} from "@ai-sdk/provider";

type Part = Exclude<LanguageModelV3Message["content"], string>[number];

function outputText(output: LanguageModelV3ToolResultOutput): string {
	switch (output.type) {
		case "text":
		case "error-text":
			return output.value;
		case "json":
		case "error-json":
			return JSON.stringify(output.value);
		case "execution-denied":
			return `Denied${output.reason ? `: ${output.reason}` : ""}`;
		case "content":
			return output.value
				.map((item) =>
					item.type === "text"
						? item.text
						: `[${"url" in item ? item.url : item.type}]`,
				)
				.join("\n");
	}
}

function partText(part: Part): string {
	switch (part.type) {
		case "text":
			return part.text;
		case "reasoning":
			return "";
		case "file":
			return `[${part.mediaType} file]`;
		case "tool-call":
			return `<tool_call name="${part.toolName}">${JSON.stringify(part.input)}</tool_call>`;
		case "tool-result":
			return `<tool_result name="${part.toolName}">${outputText(part.output)}</tool_result>`;
		case "tool-approval-response":
			return "";
	}
}

/** The whole conversation as one prompt, for a fresh ACP session to continue. */
export function transcript(prompt: LanguageModelV3Prompt): string {
	return prompt
		.map(({ role, content }) => {
			const text =
				typeof content === "string"
					? content
					: content.map(partText).filter(Boolean).join("\n");
			return `<${role}>\n${text}\n</${role}>`;
		})
		.join("\n\n");
}
