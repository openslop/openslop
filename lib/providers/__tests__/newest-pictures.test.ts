import type { LanguageModelV4Prompt } from "@ai-sdk/provider";
import { describe, expect, it } from "vitest";
import { keepNewestPictures } from "../llm/newest-pictures";

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

describe("keepNewestPictures", () => {
	it("keeps the newest pictures up to the limit and notes the earlier ones", () => {
		const sent = JSON.stringify(
			keepNewestPictures(looks(3), { limit: 2, batch: 1 }),
		);

		expect(sent.match(/"type":"file"/g)).toHaveLength(2);
		expect(sent.match(/only the newest 2 pictures stay in view/g)).toHaveLength(
			1,
		);
		expect(sent).toContain("no more than 2 pictures at a time");
		expect(sent).not.toContain("https://cdn.test/0.png");
		expect(sent).toContain("https://cdn.test/2.png");
		expect(sent).toContain("look 0");
	});

	it("counts the pictures of looks taken together one by one", () => {
		const together = looks(3).flatMap((message) =>
			message.role === "tool" ? message.content : [],
		);
		const sent = JSON.stringify(
			keepNewestPictures([{ role: "tool", content: together }], {
				limit: 2,
				batch: 1,
			}),
		);

		expect(sent.match(/"type":"file"/g)).toHaveLength(2);
		expect(sent).not.toContain("https://cdn.test/0.png");
	});

	it("drops a whole batch at a time so the kept pictures change less often", () => {
		const sent = JSON.stringify(
			keepNewestPictures(looks(4), { limit: 3, batch: 2 }),
		);

		expect(sent.match(/"type":"file"/g)).toHaveLength(2);
		expect(sent).not.toContain("https://cdn.test/1.png");
		expect(sent).toContain("https://cdn.test/2.png");
	});

	it("leaves a prompt under the limit as it is", () => {
		const prompt = looks(3);

		expect(keepNewestPictures(prompt, { limit: 20, batch: 10 })).toBe(prompt);
	});
});
