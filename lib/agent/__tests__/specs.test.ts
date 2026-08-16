import { describe, expect, it } from "vitest";
import { AGENT_TOOL_SPECS, type AgentToolName } from "../tools/specs";

describe("AgentToolName", () => {
	it("is the names the specs declare, not any string", () => {
		// @ts-expect-error widening this back to string is what the registry's
		// exhaustiveness and isAgentToolName both rest on.
		const unknown: AgentToolName = "not-a-tool";

		expect(unknown).toBe("not-a-tool");
	});

	it("covers every spec that is offered to the model", () => {
		const names: AgentToolName[] = AGENT_TOOL_SPECS.map((spec) => spec.name);

		expect(names).toEqual(["edit_script", "write_script"]);
	});
});
