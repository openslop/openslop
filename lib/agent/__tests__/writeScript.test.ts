import { describe, expect, it } from "vitest";
import { writeScriptTool } from "../tools/writeScript";

describe("writeScriptTool", () => {
	it("clears the canvas before streaming, so the new script does not stack", async () => {
		const order: string[] = [];

		await writeScriptTool.execute(
			{ brief: "a new story" },
			{
				clearScript: () => order.push("clear"),
				editScript: () => ({ applied: 0, failures: [] }),
				writeScript: async () => void order.push("write"),
			},
		);

		expect(order).toEqual(["clear", "write"]);
	});
});
