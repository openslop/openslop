import type { LanguageModelV4Prompt } from "@ai-sdk/provider";
import { describe, expect, it, vi } from "vitest";
import { keepNewestImages, replaceImageUrls } from "../llm/tool-result-images";

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

describe("replaceImageUrls", () => {
	it("swaps every image's URL and keeps everything else in place", async () => {
		const mapped = await replaceImageUrls(
			looks(2),
			async (url) => new URL(url.href.replace("cdn.test", "small.test")),
		);
		const sent = JSON.stringify(mapped);

		expect(sent).toContain("https://small.test/0.png");
		expect(sent).toContain("https://small.test/1.png");
		expect(sent).not.toContain("cdn.test");
		expect(sent).toContain("look 1");
	});

	it("replaces a URL seen twice once", async () => {
		const map = vi.fn(async (url: URL) => url);

		await replaceImageUrls([look(0), look(0)], map);

		expect(map).toHaveBeenCalledTimes(1);
	});
});

describe("keepNewestImages", () => {
	it("keeps the newest images up to the max and notes the earlier ones", () => {
		const sent = JSON.stringify(
			keepNewestImages(looks(3), { max: 2, batchSize: 1 }),
		);

		expect(sent.match(/"type":"file"/g)).toHaveLength(2);
		expect(sent).toContain("only the newest 2 images stay in view");
		expect(sent).toContain("no more than 2 images at a time");
		expect(sent).not.toContain("https://cdn.test/0.png");
		expect(sent).toContain("https://cdn.test/2.png");
		expect(sent).toContain("look 0");
	});

	it("drops a whole batch at a time so the kept images change less often", () => {
		const sent = JSON.stringify(
			keepNewestImages(looks(4), { max: 3, batchSize: 2 }),
		);

		expect(sent.match(/"type":"file"/g)).toHaveLength(2);
		expect(sent).not.toContain("https://cdn.test/1.png");
		expect(sent).toContain("https://cdn.test/2.png");
	});

	it("leaves a prompt under the max as it is", () => {
		const prompt = looks(3);

		expect(keepNewestImages(prompt, { max: 20, batchSize: 10 })).toBe(prompt);
	});
});
