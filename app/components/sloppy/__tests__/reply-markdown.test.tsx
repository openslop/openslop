// @vitest-environment happy-dom

import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { SloppyMessage } from "@/lib/agent/types";
import { ReplyMarkdown } from "../reply-markdown";
import { AgentTurn } from "../sloppy-message";

const render = (text: string, streaming = false) => {
	const container = document.createElement("div");
	container.innerHTML = renderToStaticMarkup(
		<ReplyMarkdown text={text} streaming={streaming} />,
	);
	return container;
};

describe("ReplyMarkdown", () => {
	it("renders bold, italic, lists and inline code as rich text", () => {
		const reply = render(
			"**Done.** I made it *shorter*:\n\n- `scene_2` trimmed\n- music faded\n\n1. first\n2. second",
		);

		expect(reply.querySelector("strong")?.textContent).toBe("Done.");
		expect(reply.querySelector("em")?.textContent).toBe("shorter");
		expect(reply.querySelectorAll("ul li")).toHaveLength(2);
		expect(reply.querySelectorAll("ol li")).toHaveLength(2);
		expect(reply.querySelector("code")?.textContent).toBe("scene_2");
		expect(reply.textContent).not.toMatch(/\*|`/);
	});

	it("opens a link in a new tab", () => {
		const link = render(
			"See [the docs](https://example.com/docs).",
		).querySelector("a");

		expect(link?.getAttribute("href")).toBe("https://example.com/docs");
		expect(link?.getAttribute("target")).toBe("_blank");
		expect(link?.getAttribute("rel")).toBe("noreferrer");
	});

	it("never shows half-streamed syntax while a reply arrives", () => {
		const reply = render("Here is the **plan", true);

		expect(reply.textContent).not.toContain("**");
		expect(reply.querySelector("strong")?.textContent).toBe("plan");
	});

	it("shows a link whose URL hasn't arrived as plain text", () => {
		const reply = render("Read [the guide](https://exa", true);

		expect(reply.querySelector("a")).toBeNull();
		expect(reply.textContent).toContain("the guide");
		expect(reply.textContent).not.toContain("](");
	});

	it("keeps headings at the reply's own size", () => {
		const heading = render("# Plan").querySelector("h3");

		expect(heading?.textContent).toBe("Plan");
		expect(heading?.className).not.toMatch(/text-(xl|2xl|3xl|lg)/);
	});
});

describe("a reply in a turn", () => {
	it("renders the reply's markdown rather than its raw syntax", () => {
		const message: SloppyMessage = {
			id: "m1",
			role: "assistant",
			parts: [{ type: "text", text: "**Done.**", state: "done" }],
		};
		const markup = renderToStaticMarkup(
			<TooltipProvider>
				<AgentTurn message={message} streaming={false} />
			</TooltipProvider>,
		);

		expect(markup).toContain("<strong");
		expect(markup).not.toContain(">**Done.**<");
	});
});
