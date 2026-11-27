import { expect, it } from "vitest";
import { transcript } from "../transcript";

it("writes the whole conversation out for a fresh session", () => {
	expect(
		transcript([
			{ role: "system", content: "You are Sloppy." },
			{ role: "user", content: [{ type: "text", text: "Add a scene" }] },
			{
				role: "assistant",
				content: [
					{ type: "reasoning", text: "Private." },
					{ type: "text", text: "On it." },
					{
						type: "tool-call",
						toolCallId: "1",
						toolName: "add_scene",
						input: { title: "Opening" },
					},
				],
			},
			{
				role: "tool",
				content: [
					{
						type: "tool-result",
						toolCallId: "1",
						toolName: "add_scene",
						output: { type: "json", value: { ok: true } },
					},
				],
			},
		]),
	).toBe(
		[
			"<system>\nYou are Sloppy.\n</system>",
			"<user>\nAdd a scene\n</user>",
			'<assistant>\nOn it.\n<tool_call name="add_scene">{"title":"Opening"}</tool_call>\n</assistant>',
			'<tool>\n<tool_result name="add_scene">{"ok":true}</tool_result>\n</tool>',
		].join("\n\n"),
	);
});

it("names media it cannot pass on", () => {
	expect(
		transcript([
			{
				role: "tool",
				content: [
					{
						type: "tool-result",
						toolCallId: "1",
						toolName: "read_frame",
						output: {
							type: "content",
							value: [
								{ type: "text", text: "The frame:" },
								{ type: "image-url", url: "https://x.test/a.png" },
							],
						},
					},
				],
			},
		]),
	).toContain("The frame:\n[https://x.test/a.png]");
});
