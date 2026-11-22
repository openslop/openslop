import { describe, expect, it } from "vitest";
import { INPUT_LANGUAGE } from "../language";
import { osmlSpec } from "../osml";

describe("osmlSpec", () => {
	it("pins the script to the project language when one is declared", () => {
		const declared = osmlSpec("fr (ISO 639-1)");
		expect(declared).toContain("The script language is fr (ISO 639-1)");
		expect(declared).not.toContain("the language of the user's own topic");
		expect(osmlSpec(INPUT_LANGUAGE)).toContain(
			"the language of the user's own topic",
		);
	});
});
