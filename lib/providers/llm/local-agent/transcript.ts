import type {
	LanguageModelV3Message,
	LanguageModelV3Prompt,
	LanguageModelV3ToolResultOutput,
} from "@ai-sdk/provider";

type Part = Exclude<LanguageModelV3Message["content"], string>[number];

const json = (value: unknown) => JSON.stringify(value);

function outputText(output: LanguageModelV3ToolResultOutput): string {
	switch (output.type) {
		case "text":
		case "error-text":
			return output.value;
		case "json":
		case "error-json":
			return json(output.value);
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
			return `<tool_call name="${part.toolName}">${json(part.input)}</tool_call>`;
		case "tool-result":
			return `<tool_result name="${part.toolName}">${outputText(part.output)}</tool_result>`;
		case "tool-approval-response":
			return "";
	}
}

/**
 * An ACP agent keeps its own history and takes one prompt, so the whole
 * conversation is written out as text for a fresh session to continue.
 */
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
