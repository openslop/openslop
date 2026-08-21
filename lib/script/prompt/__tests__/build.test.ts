import { describe, expect, it } from "vitest";
import { buildScriptPrompt } from "../build";
import { MetadataSchema, type Metadata } from "@/lib/project/types";
import { TEMPLATES } from "@/lib/templates/templates";
import { getTemplatePrompt } from "@/lib/templates/templatePrompts";
import { VIDEO_LENGTH_SPECS } from "@/lib/video/videoLength";

const base = MetadataSchema.parse({});

const metadata = (patch: Partial<Metadata> = {}): Metadata => ({
	...base,
	...patch,
});

const lengthOf = (length: "1-3m" | "auto"): Metadata =>
	metadata({ videoSettings: { ...base.videoSettings, length } });

const template = TEMPLATES[0];
if (!template) throw new Error("expected a template fixture");

describe("buildScriptPrompt", () => {
	it("gives a brief the length budget and the format spec, and passes it through", async () => {
		const { system, prompt } = await buildScriptPrompt(lengthOf("1-3m"), {
			kind: "brief",
			brief: "a rabbit finds a lantern",
		});

		const { minWords } = VIDEO_LENGTH_SPECS["1-3m"];
		expect(system).toContain(`Write ${minWords} to`);
		expect(system).toContain("The story script must be written");
		expect(prompt).toBe("a rabbit finds a lantern");
	});

	it("orders the length budget ahead of the format spec", async () => {
		const { system } = await buildScriptPrompt(lengthOf("1-3m"), {
			kind: "brief",
			brief: "a brief",
		});

		expect(system.indexOf("# Length")).toBeLessThan(
			system.indexOf("The story script must be written"),
		);
	});

	it("leaves a brief on auto with no budget to write to", async () => {
		const { system } = await buildScriptPrompt(lengthOf("auto"), {
			kind: "brief",
			brief: "a brief",
		});

		expect(system).not.toContain("# Length");
	});

	it("keeps a pasted script's notes out of the text but in the guidance", async () => {
		const { system, prompt } = await buildScriptPrompt(lengthOf("auto"), {
			kind: "adapt",
			script: "NARRATOR\nOnce upon a time.",
			notes: "warm and slow, lots of wide shots",
		});

		expect(prompt).toBe("NARRATOR\nOnce upon a time.");
		expect(system).toContain("warm and slow, lots of wide shots");
		expect(system).not.toContain("# Length");
	});

	it("pastiches the project's template and keeps the brief as the topic", async () => {
		const { system, prompt } = await buildScriptPrompt(
			metadata({ templateId: template.id }),
			{ kind: "brief", brief: "a barista" },
		);

		expect(system).toContain(getTemplatePrompt(template.id).system);
		expect(prompt).toContain("<user_input>a barista</user_input>");
		expect(prompt).toContain(getTemplatePrompt(template.id).exampleStory);
	});

	it("passes an adapted script through verbatim and drops the length budget", async () => {
		const script = "NARRATOR\nHigh above the sleepy hills.";
		const { system, prompt } = await buildScriptPrompt(metadata(), {
			kind: "adapt",
			script,
		});

		expect(prompt).toBe(script);
		expect(system).toContain("script-to-XML converter");
		expect(system).not.toContain("# Length");
	});

	it("adapts verbatim even when the project has a template", async () => {
		const script = "a line the user wrote";
		const { system, prompt } = await buildScriptPrompt(
			metadata({ templateId: template.id }),
			{ kind: "adapt", script },
		);

		expect(prompt).toBe(script);
		expect(system).not.toContain(getTemplatePrompt(template.id).system);
	});

	it("carries the project's art style, narrator and characters", async () => {
		const { system } = await buildScriptPrompt(
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

	it("carries a described appearance for a character with an uploaded avatar", async () => {
		const { system } = await buildScriptPrompt(
			metadata({
				characters: {
					Mira: { appearance: "a freckled girl", avatarUploaded: true },
				},
			}),
			{ kind: "brief", brief: "a brief" },
		);

		expect(system).toContain("- appearance: a freckled girl");
	});

	it("names the declared language, and defers to the input when it is auto", async () => {
		const declared = await buildScriptPrompt(metadata({ language: "es" }), {
			kind: "brief",
			brief: "a brief",
		});
		expect(declared.system).toContain("es (ISO 639-1)");

		const auto = await buildScriptPrompt(metadata(), {
			kind: "brief",
			brief: "a brief",
		});
		expect(auto.system).toContain("the language of the user's own topic");
	});
});
