import { describe, expect, it } from "vitest";
import { STANDARD_MAX_DURATION_SEC } from "@/lib/canvas/types";
import { INPUT_LANGUAGE } from "../language";
import { osmlSpec } from "../osml";

describe("osmlSpec", () => {
	it("pins the script to the project language when one is declared", () => {
		const declared = osmlSpec("fr (ISO 639-1)", STANDARD_MAX_DURATION_SEC);
		expect(declared).toContain("The script language is fr (ISO 639-1)");
		expect(declared).not.toContain("the language of the user's own topic");
		expect(osmlSpec(INPUT_LANGUAGE, STANDARD_MAX_DURATION_SEC)).toContain(
			"the language of the user's own topic",
		);
	});
});
