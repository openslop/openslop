import { describe, expect, it, vi } from "vitest";
import type { AgentToolContext } from "../tools/context";
import { executeToolCall } from "../tools/registry";

const context = (over: Partial<AgentToolContext> = {}): AgentToolContext => ({
	readScript: () => "<narration>hi</narration>",
	clearScript: () => {},
	editScript: () => ({ applied: 0, failures: [] }),
	writeScript: async () => {},
	...over,
});

describe("executeToolCall", () => {
	it("hands back the script as the reading the model asked for", async () => {
		const outcome = await executeToolCall(
			{ toolName: "read_script", input: {} },
			context(),
		);

		expect(outcome).toEqual({
			ok: true,
			output: "```osml\n<narration>hi</narration>\n```",
		});
	});

	it("says the canvas is empty rather than handing back nothing", async () => {
		const outcome = await executeToolCall(
			{ toolName: "read_script", input: {} },
			context({ readScript: () => "  " }),
		);

		expect(outcome).toEqual({ ok: true, output: "The canvas is empty." });
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
});
