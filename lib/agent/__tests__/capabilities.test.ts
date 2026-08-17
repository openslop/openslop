import { describe, expect, it } from "vitest";
import { AGENT_LIMITS, limitsPrompt } from "../capabilities";
import { SLOPPY_TOOLS } from "../tools/specs";

describe("AGENT_LIMITS", () => {
	it("retires a limit once the tool that supersedes it ships", () => {
		const tools = new Set<string>(Object.keys(SLOPPY_TOOLS));
		const stale = AGENT_LIMITS.filter((limit) => tools.has(limit.supersededBy));

		expect(stale.map((limit) => limit.supersededBy)).toEqual([]);
	});
});

describe("limitsPrompt", () => {
	it("tells Sloppy what it cannot do and where the user can", () => {
		const prompt = limitsPrompt();

		for (const limit of AGENT_LIMITS) {
			expect(prompt).toContain(limit.cannot);
			expect(prompt).toContain(limit.instead);
		}
	});
});
