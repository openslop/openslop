import { describe, expect, it } from "vitest";
import { buildScriptPrompt } from "../build";
import { MetadataSchema, type Metadata } from "@/lib/project/types";
import { getTemplate, TEMPLATES } from "@/lib/templates/templates";
import { VIDEO_LENGTH_SPECS } from "@/lib/video/videoLength";

const metadata = (patch: Partial<Metadata> = {}): Metadata => ({
	...MetadataSchema.parse({}),
	...patch,
});

const template = TEMPLATES[0];
if (!template) throw new Error("expected a template fixture");

describe("buildScriptPrompt", () => {
	it("gives a brief the length budget and the format spec, and passes it through", () => {
		const { system, prompt } = buildScriptPrompt(metadata(), {
			kind: "brief",
			brief: "a rabbit finds a lantern",
		});

		const { minWords } = VIDEO_LENGTH_SPECS[metadata().videoSettings.length];
		expect(system).toContain(`Write ${minWords} to`);
		expect(system).toContain("The story script must be written");
		expect(prompt).toBe("a rabbit finds a lantern");
	});

	it("orders the length budget ahead of the format spec", () => {
		const { system } = buildScriptPrompt(metadata(), {
			kind: "brief",
			brief: "a brief",
		});

		expect(system.indexOf("# Length")).toBeLessThan(
			system.indexOf("The story script must be written"),
		);
	});

	it("pastiches the project's template and keeps the brief as the topic", () => {
		const { system, prompt } = buildScriptPrompt(
			metadata({ templateId: template.id }),
			{ kind: "brief", brief: "a barista" },
		);

		expect(system).toContain(getTemplate(template.id).systemPrompt);
		expect(prompt).toContain("<user_input>a barista</user_input>");
		expect(prompt).toContain(getTemplate(template.id).exampleText);
	});

	it("passes an adapted script through verbatim and drops the length budget", () => {
		const script = "NARRATOR\nHigh above the sleepy hills.";
		const { system, prompt } = buildScriptPrompt(metadata(), {
			kind: "adapt",
			script,
		});

		expect(prompt).toBe(script);
		expect(system).toContain("script-to-XML converter");
		expect(system).not.toContain("# Length");
	});

	it("adapts verbatim even when the project has a template", () => {
		const script = "a line the user wrote";
		const { system, prompt } = buildScriptPrompt(
			metadata({ templateId: template.id }),
			{ kind: "adapt", script },
		);

		expect(prompt).toBe(script);
		expect(system).not.toContain(getTemplate(template.id).systemPrompt);
	});

	it("carries the project's art style, narrator and characters", () => {
		const { system } = buildScriptPrompt(
			metadata({
				style: "muted watercolor",
				narration: { gender: "feminine" },
				characters: { Lumi: { appearance: "a small grey rabbit" } },
			}),
			{ kind: "brief", brief: "a brief" },
		);

		expect(system).toContain("# Art Style");
		expect(system).toContain("muted watercolor");
		expect(system).toContain("# Narration Voice");
		expect(system).toContain("# Characters");
		expect(system).toContain("a small grey rabbit");
	});

	it("carries a described appearance for a character with an uploaded avatar", () => {
		const { system } = buildScriptPrompt(
			metadata({
				characters: {
					Mira: { appearance: "a freckled girl", avatarUploaded: true },
				},
			}),
			{ kind: "brief", brief: "a brief" },
		);

		expect(system).toContain("- appearance: a freckled girl");
	});

	it("names the declared language, and defers to the input when it is auto", () => {
		const declared = buildScriptPrompt(metadata({ language: "es" }), {
			kind: "brief",
			brief: "a brief",
		});
		expect(declared.system).toContain("es (ISO 639-1)");

		const auto = buildScriptPrompt(metadata(), {
			kind: "brief",
			brief: "a brief",
		});
		expect(auto.system).toContain("the language of the user's own topic");
	});
});
