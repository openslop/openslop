import { describe, expect, it } from "vitest";
import {
	AUTO_LANGUAGE,
	LANGUAGE_CHOICES,
	declaredLanguage,
	languageLabel,
} from "@/lib/project/language";

describe("languageLabel", () => {
	it("names Auto and spells out ISO codes", () => {
		expect(languageLabel(AUTO_LANGUAGE)).toBe("Auto");
		expect(languageLabel("es")).toBe("Spanish");
	});
});

describe("LANGUAGE_CHOICES", () => {
	it("offers Auto first so the default reads as the default", () => {
		expect(LANGUAGE_CHOICES[0]).toBe(AUTO_LANGUAGE);
		expect(LANGUAGE_CHOICES).toContain("es");
	});
});

describe("declaredLanguage", () => {
	it("reads Auto as no declared language, leaving the choice to the input", () => {
		expect(declaredLanguage(AUTO_LANGUAGE)).toBeUndefined();
		expect(declaredLanguage(undefined)).toBeUndefined();
	});

	it("passes a chosen language through", () => {
		expect(declaredLanguage("es")).toBe("es");
	});
});
