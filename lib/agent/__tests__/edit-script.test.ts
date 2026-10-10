import { describe, expect, it } from "vitest";
import { editScript } from "../tools/edit-script";

describe("edit_script", () => {
	it("offers attributes whose control lives inside another's, like a video's continuity", () => {
		expect(editScript.spec.description).toContain("continuity (false | true)");
	});
});
