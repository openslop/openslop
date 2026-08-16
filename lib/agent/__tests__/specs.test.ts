import { describe, expect, it } from "vitest";
import { AGENT_TOOL_SPECS, type AgentToolName } from "../tools/specs";

describe("AGENT_TOOL_SPECS", () => {
	it("covers every spec that is offered to the model", () => {
		const names: AgentToolName[] = AGENT_TOOL_SPECS.map((spec) => spec.name);

		expect(names).toEqual(["edit_script", "write_script"]);
	});
});
