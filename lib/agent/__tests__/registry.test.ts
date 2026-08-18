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
	readMetadata: () => metadata,
	clearScript: () => {},
	editScript: () => ({ applied: 0, failures: [] }),
	writeScript: async () => {},
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
		expect(outcome.ok && outcome.output).toContain("title: Little Red");
		expect(outcome.ok && outcome.output).toContain("art style: claymation");
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

	it("clears the canvas before streaming, so the new script does not stack", async () => {
		const order: string[] = [];

		await executeToolCall(
			{ toolName: "write_script", input: { brief: "a new story" } },
			context({
				clearScript: () => void order.push("clear"),
				writeScript: async () => void order.push("write"),
			}),
		);

		expect(order).toEqual(["clear", "write"]);
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
});
