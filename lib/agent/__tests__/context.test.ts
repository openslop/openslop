import { describe, expect, it } from "vitest";
import { renderAgentContext, type AgentContext } from "../context";

const context = (over: Partial<AgentContext> = {}): AgentContext => ({
	title: "",
	style: "",
	language: "auto",
	length: "3-5m",
	aspectRatio: "16:9",
	narration: {},
	characters: [],
	referenceImageCount: 0,
	scriptIsEmpty: true,
	...over,
});

describe("renderAgentContext", () => {
	it("names what is unset rather than leaving it blank", () => {
		const rendered = renderAgentContext(context());

		expect(rendered).toContain("title: not set");
		expect(rendered).toContain("art style: not set");
		expect(rendered).toContain("narrator voice: not set");
		expect(rendered).toContain("template: none");
		expect(rendered).toContain("none yet");
	});

	it("spells the length out as a word budget the model can write to", () => {
		const rendered = renderAgentContext(context({ length: "under-30s" }));

		expect(rendered).toMatch(
			/video length: under-30s \(\d+ to \d+ spoken words\)/,
		);
	});

	it("says auto carries no target rather than naming a budget", () => {
		const rendered = renderAgentContext(context({ length: "auto" }));

		expect(rendered).toContain("video length: auto (no target");
	});

	it("names the language rather than handing over a code", () => {
		expect(renderAgentContext(context({ language: "es" }))).toContain(
			"language: Spanish",
		);
	});

	it("renders the narrator's declared traits", () => {
		const rendered = renderAgentContext(
			context({ narration: { gender: "feminine", pitch: "low" } }),
		);

		expect(rendered).toContain("narrator voice: gender: feminine, pitch: low");
	});

	it("says which characters still need an appearance or an avatar", () => {
		const rendered = renderAgentContext(
			context({
				characters: [
					{ name: "Lumi", hasAppearance: true, avatar: "generated" },
					{ name: "Mira", hasAppearance: false, avatar: "none" },
				],
			}),
		);

		expect(rendered).toContain("Lumi (appearance set, avatar generated)");
		expect(rendered).toContain("Mira (no appearance, no avatar)");
	});

	it("says when an avatar came from the user, not the appearance", () => {
		const rendered = renderAgentContext(
			context({
				characters: [{ name: "Bo", hasAppearance: false, avatar: "uploaded" }],
			}),
		);

		expect(rendered).toContain(
			"Bo (no appearance, avatar uploaded by the user)",
		);
	});

	it("says whether the canvas already has a script on it", () => {
		expect(renderAgentContext(context())).toContain("canvas: empty");
		expect(renderAgentContext(context({ scriptIsEmpty: false }))).toContain(
			"canvas: has a script on it",
		);
	});

	it("points at read_script rather than claiming to hold the script", () => {
		expect(renderAgentContext(context())).toContain("read_script");
	});
});
