import { describe, expect, it } from "vitest";
import { SLOPPY_TOOLS, agentToolCallSchema } from "../tools/specs";

describe("SLOPPY_TOOLS", () => {
	it("offers the model exactly the tools the editor can run", () => {
		expect(Object.keys(SLOPPY_TOOLS)).toEqual([
			"read_script",
			"edit_script",
			"write_script",
			"set_metadata",
			"set_narrator",
			"set_character",
		]);
	});

	it("declares no executor, so a step stops at the call for the editor to run", () => {
		for (const tool of Object.values(SLOPPY_TOOLS)) {
			expect(tool.execute).toBeUndefined();
		}
	});
});

describe("agentToolCallSchema", () => {
	it("can read a call to every tool the model is offered", () => {
		const readable = new Set(
			agentToolCallSchema.options.map((option) => option.shape.toolName.value),
		);

		expect([...readable].sort()).toEqual(Object.keys(SLOPPY_TOOLS).sort());
	});

	it("reads a call as the input its own tool takes", () => {
		const parsed = agentToolCallSchema.parse({
			toolName: "write_script",
			input: { brief: "a rabbit on the moon" },
		});

		expect(parsed).toEqual({
			toolName: "write_script",
			input: { brief: "a rabbit on the moon" },
		});
	});

	it("rejects a call carrying another tool's input", () => {
		const parsed = agentToolCallSchema.safeParse({
			toolName: "write_script",
			input: { ops: [] },
		});

		expect(parsed.success).toBe(false);
	});

	it("rejects a tool nothing can run", () => {
		expect(
			agentToolCallSchema.safeParse({ toolName: "render_video", input: {} })
				.success,
		).toBe(false);
	});
});
