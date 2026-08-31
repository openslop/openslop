import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { SloppyMessage } from "@/lib/agent/types";
import { AgentTurn } from "../SloppyMessage";

const interrupted: SloppyMessage = {
	id: "m2",
	role: "assistant",
	parts: [
		{ type: "step-start" },
		{ type: "reasoning", text: "half a thought", state: "streaming" },
	],
};

const render = (message: SloppyMessage, streaming: boolean) =>
	renderToStaticMarkup(<AgentTurn message={message} streaming={streaming} />);

describe("AgentTurn", () => {
	it("shows a restored half-open turn as finished, not as still thinking", () => {
		const markup = render(interrupted, false);

		expect(markup).toContain("Done thinking");
		expect(markup).not.toContain("Thinking…");
		expect(markup).not.toContain("shimmer");
	});

	it("leaves the abandoned half-thought collapsed rather than expanded", () => {
		expect(render(interrupted, false)).not.toContain("half a thought");
		expect(render(interrupted, true)).toContain("half a thought");
	});

	it("still shows the turn in flight as thinking", () => {
		expect(render(interrupted, true)).toContain("Thinking…");
	});
});
