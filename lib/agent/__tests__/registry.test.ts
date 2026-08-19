import { describe, expect, it, vi } from "vitest";
import type { AgentToolContext } from "../tools/context";
import { executeToolCall } from "../tools/registry";
import { MetadataSchema } from "@/lib/project/types";

const metadata = MetadataSchema.parse({
	title: "Little Red",
	style: "claymation",
	characters: { Red: { appearance: "a girl in a red cloak", age: "child" } },
});

const context = (over: Partial<AgentToolContext> = {}): AgentToolContext => ({
	readScript: () => "<narration>hi</narration>",
	countSpokenWords: () => 1,
	generateText: async () => "an outline",
	referenceImages: () => [],
	avatarUrl: () => undefined,
	readMetadata: () => metadata,
	editScript: () => ({ applied: 0, failures: [] }),
	writeScript: async () => {},
	adaptScript: async () => {},
	applyTemplate: () => {},
	setMetadata: () => {},
	setCharacter: (name) => ({ name, created: !(name in metadata.characters) }),
	...over,
});

describe("executeToolCall", () => {
	it("hands back the script and the settings around it", async () => {
		const outcome = await executeToolCall(
			{ toolName: "read_script", input: {} },
			context(),
		);

		expect(outcome.ok && outcome.output).toContain("<narration>hi</narration>");
		expect(outcome.ok && outcome.output).toContain(
			"- Red: a girl in a red cloak (voice: child)",
		);
	});

	it("says the canvas is empty rather than handing back nothing", async () => {
		const outcome = await executeToolCall(
			{ toolName: "read_script", input: {} },
			context({ readScript: () => "  " }),
		);

		expect(outcome.ok && outcome.output).toContain("The canvas is empty.");
	});

	it("reports what an edit could not apply, so the model can fix the call", async () => {
		const outcome = await executeToolCall(
			{ toolName: "edit_script", input: { ops: [{ op: "remove", id: "n1" }] } },
			context({
				editScript: () => ({ applied: 0, failures: ["no element n1"] }),
			}),
		);

		expect(outcome).toMatchObject({ ok: true });
		expect(outcome.ok && outcome.output).toContain("no element n1");
	});

	it("reports a throwing tool rather than losing the turn to it", async () => {
		const outcome = await executeToolCall(
			{ toolName: "write_script", input: { brief: "a new story" } },
			context({
				writeScript: vi.fn(async () => {
					throw new Error("the stream died");
				}),
			}),
		);

		expect(outcome).toEqual({ ok: false, errorText: "the stream died" });
	});

	it("reports a call it cannot read rather than running the wrong tool", async () => {
		const outcome = await executeToolCall(
			{ toolName: "edit_script", input: { brief: "not ops" } },
			context(),
		);

		expect(outcome.ok).toBe(false);
	});

	it("changes only the settings it was given", async () => {
		const patches: unknown[] = [];
		const outcome = await executeToolCall(
			{ toolName: "set_metadata", input: { title: "Moon Cat" } },
			context({ setMetadata: (patch) => void patches.push(patch) }),
		);

		expect(patches).toEqual([{ title: "Moon Cat" }]);
		expect(outcome).toEqual({ ok: true, output: "Set the title." });
	});

	it("refuses a call that names no setting, rather than writing nothing", async () => {
		const patches: unknown[] = [];
		const outcome = await executeToolCall(
			{ toolName: "set_metadata", input: {} },
			context({ setMetadata: (patch) => void patches.push(patch) }),
		);

		expect(patches).toEqual([]);
		expect(outcome.ok).toBe(false);
	});

	it("maps the narrator's traits onto the voice the project reads in", async () => {
		const patches: unknown[] = [];
		await executeToolCall(
			{ toolName: "set_narrator", input: { age: "child" } },
			context({ setMetadata: (patch) => void patches.push(patch) }),
		);

		expect(patches).toEqual([{ narration: { age: "child" } }]);
	});

	it("says a character is new, so the model knows its avatar is not drawn", async () => {
		const outcome = await executeToolCall(
			{
				toolName: "set_character",
				input: { name: "Wolf", appearance: "a grey wolf" },
			},
			context(),
		);

		expect(outcome.ok && outcome.output).toContain("Added Wolf");
	});

	it("changes a character the project already knows", async () => {
		const edits: unknown[] = [];
		const outcome = await executeToolCall(
			{
				toolName: "set_character",
				input: { name: "Red", pitch: "high" },
			},
			context({
				setCharacter: (name, patch) => {
					edits.push([name, patch]);
					return { name, created: false };
				},
			}),
		);

		expect(edits).toEqual([["Red", { pitch: "high" }]]);
		expect(outcome).toEqual({ ok: true, output: "Changed Red." });
	});

	it("answers with the name the project settled on, not the one it was asked with", async () => {
		const outcome = await executeToolCall(
			{ toolName: "set_character", input: { name: "big bad wolf" } },
			context({
				setCharacter: () => ({ name: "Big Bad Wolf", created: true }),
			}),
		);

		expect(outcome.ok && outcome.output).toContain("Added Big Bad Wolf");
	});

	it("puts the user's own script on the canvas untouched", async () => {
		const script = "NARRATOR\nHigh above the sleepy hills.";
		const adapted: string[] = [];

		const outcome = await executeToolCall(
			{ toolName: "adapt_script", input: { script } },
			context({
				adaptScript: async (text) => {
					adapted.push(text);
				},
			}),
		);

		expect(adapted).toEqual([script]);
		expect(outcome.ok).toBe(true);
	});

	it("says a setting change does not reshape what is already on the canvas", async () => {
		const outcome = await executeToolCall(
			{ toolName: "set_video_settings", input: { length: "5-10m" } },
			context(),
		);

		expect(outcome.ok && outcome.output).toContain("5-10m");
		expect(outcome.ok && outcome.output).toContain("next script");
	});

	it("rejects a setting call that changes nothing", async () => {
		const outcome = await executeToolCall(
			{ toolName: "set_video_settings", input: {} },
			context(),
		);

		expect(outcome.ok).toBe(false);
	});

	it("refuses a template over a script rather than resetting the project", async () => {
		const outcome = await executeToolCall(
			{ toolName: "apply_template", input: { template_id: "pov-life" } },
			context({
				applyTemplate: () => {
					throw new Error("should not run");
				},
			}),
		);

		expect(outcome.ok).toBe(false);
		expect(!outcome.ok && outcome.errorText).toContain("resets the project");
	});

	it("adopts a template onto an empty canvas", async () => {
		const outcome = await executeToolCall(
			{ toolName: "apply_template", input: { template_id: "pov-life" } },
			context({ readScript: () => "" }),
		);

		expect(outcome.ok && outcome.output).toContain("POV Life");
	});

	it("rejects a template nothing can apply", async () => {
		const outcome = await executeToolCall(
			{ toolName: "apply_template", input: { template_id: "not-a-template" } },
			context({ readScript: () => "" }),
		);

		expect(outcome.ok).toBe(false);
	});

	it("reports the count against the project's word budget", async () => {
		const outcome = await executeToolCall(
			{ toolName: "count_words", input: {} },
			context({ countSpokenWords: () => 700 }),
		);

		// The fixture metadata targets 3-5m: 540 to 900 words.
		expect(outcome.ok && outcome.output).toContain("700 spoken words");
		expect(outcome.ok && outcome.output).toContain("within the target range");
	});

	it("says how far off the count is, so the model knows how much to cut or add", async () => {
		const over = await executeToolCall(
			{ toolName: "count_words", input: {} },
			context({ countSpokenWords: () => 1000 }),
		);
		expect(over.ok && over.output).toContain("over by 100 words");

		const under = await executeToolCall(
			{ toolName: "count_words", input: {} },
			context({ countSpokenWords: () => 500 }),
		);
		expect(under.ok && under.output).toContain("under by 40 words");
	});

	it("hands over the reference images for the model to look at", async () => {
		const outcome = await executeToolCall(
			{ toolName: "view_reference_images", input: {} },
			context({ referenceImages: () => ["https://example.com/a.jpg"] }),
		);

		expect(outcome.ok && outcome.output).toEqual({
			urls: ["https://example.com/a.jpg"],
		});
	});

	it("says there is nothing to look at rather than handing over an empty set", async () => {
		const outcome = await executeToolCall(
			{ toolName: "view_reference_images", input: {} },
			context(),
		);

		expect(outcome.ok).toBe(false);
		expect(!outcome.ok && outcome.errorText).toContain("No reference images");
	});

	it("hands over a character's avatar by name", async () => {
		const outcome = await executeToolCall(
			{ toolName: "view_avatar", input: { name: "Mira" } },
			context({ avatarUrl: () => "https://example.com/mira.png" }),
		);

		expect(outcome.ok && outcome.output).toEqual({
			name: "Mira",
			url: "https://example.com/mira.png",
		});
	});

	it("says an avatar does not exist yet rather than inventing one", async () => {
		const outcome = await executeToolCall(
			{ toolName: "view_avatar", input: { name: "Mira" } },
			context(),
		);

		expect(outcome.ok).toBe(false);
		expect(!outcome.ok && outcome.errorText).toContain("no avatar image yet");
	});

	it("outlines a brief through one focused generation", async () => {
		const prompts: string[] = [];
		const outcome = await executeToolCall(
			{ toolName: "outline_story", input: { brief: "a rabbit on the moon" } },
			context({
				generateText: async (prompt) => {
					prompts.push(prompt);
					return "1. A rabbit finds a lantern.";
				},
			}),
		);

		expect(outcome.ok && outcome.output).toBe("1. A rabbit finds a lantern.");
		expect(prompts[0]).toContain("a rabbit on the moon");
		expect(prompts[0]).toContain("conflict, twists, and a resolution");
	});
});
