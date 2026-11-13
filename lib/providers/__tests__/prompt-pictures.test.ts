import type { LanguageModelV4Prompt } from "@ai-sdk/provider";
import { describe, expect, it, vi } from "vitest";
import { mapPictureUrls } from "../llm/prompt-pictures";

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

describe("mapPictureUrls", () => {
	it("swaps every picture's URL and keeps everything else in place", async () => {
		const mapped = await mapPictureUrls(
			looks(2),
			async (url) => new URL(url.href.replace("cdn.test", "small.test")),
		);
		const sent = JSON.stringify(mapped);

		expect(sent).toContain("https://small.test/0.png");
		expect(sent).toContain("https://small.test/1.png");
		expect(sent).not.toContain("cdn.test");
		expect(sent).toContain("look 1");
	});

	it("maps a URL seen twice once", async () => {
		const map = vi.fn(async (url: URL) => url);

		await mapPictureUrls([look(0), look(0)], map);

		expect(map).toHaveBeenCalledTimes(1);
	});
});
