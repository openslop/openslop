import { describe, expect, it } from "vitest";
import { isOtherDeployment } from "../deployment-id";

describe("isOtherDeployment", () => {
	it.each([
		["dpl-1", "dpl-2", true],
		["dpl-1", "dpl-1", false],
		[null, "dpl-2", false],
		["dpl-1", null, false],
		["", "dpl-2", false],
		[undefined, undefined, false],
	])("own %o, other %o: %s", (own, other, expected) => {
		expect(isOtherDeployment(own, other)).toBe(expected);
	});
});
