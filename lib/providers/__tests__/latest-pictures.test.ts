import type { LanguageModelV4Prompt } from "@ai-sdk/provider";
import { describe, expect, it } from "vitest";
import { keepLatestPictures } from "../llm/latest-pictures";

const look = (index: number): LanguageModelV4Prompt[number] => ({
	role: "tool",
	content: [
		{
			type: "tool-result",
			toolCallId: `v${index}`,
			toolName: "view_result",
			output: {
				type: "content",
				value: [
					{ type: "text", text: `look ${index}` },
					{
						type: "file",
						mediaType: "image",
						data: {
							type: "url",
							url: new URL(`https://cdn.test/${index}.png`),
						},
					},
				],
			},
		},
	],
});

const looks = (count: number) =>
	Array.from({ length: count }, (_look, index) => look(index));

describe("keepLatestPictures", () => {
	it("keeps the pictures of the latest look and notes the earlier ones", () => {
		const sent = JSON.stringify(keepLatestPictures(looks(3)));

		expect(sent.match(/"type":"file"/g)).toHaveLength(1);
		expect(sent.match(/An earlier picture, not kept/g)).toHaveLength(2);
		expect(sent).toContain("https://cdn.test/2.png");
		expect(sent).not.toContain("https://cdn.test/1.png");
		expect(sent).toContain("look 0");
	});

	it("keeps every picture of looks taken together", () => {
		const together = looks(2).flatMap((message) =>
			message.role === "tool" ? message.content : [],
		);
		const sent = JSON.stringify(
			keepLatestPictures([look(9), { role: "tool", content: together }]),
		);

		expect(sent.match(/"type":"file"/g)).toHaveLength(2);
		expect(sent).not.toContain("https://cdn.test/9.png");
	});
});
