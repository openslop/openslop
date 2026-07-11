import { beforeEach, describe, expect, it } from "vitest";
import { deriveProjectName, setProjectTitle } from "../projectName";
import { clearProjectStore, getProjectStore } from "../store";
import type { Metadata } from "../types";

const base: Metadata = {
	title: "",
	style: "",
	narration: {},
	characters: {},
};

describe("deriveProjectName", () => {
	it("returns 'Untitled' for missing metadata", () => {
		expect(deriveProjectName(undefined)).toBe("Untitled");
	});

	it("returns 'Untitled' for empty or whitespace titles", () => {
		expect(deriveProjectName({ ...base, title: "" })).toBe("Untitled");
		expect(deriveProjectName({ ...base, title: "   " })).toBe("Untitled");
	});

	it("trims and returns valid titles", () => {
		expect(deriveProjectName({ ...base, title: "  My Slop  " })).toBe(
			"My Slop",
		);
	});
});

describe("setProjectTitle", () => {
	const PROJECT_ID = "project-title-test";
	beforeEach(() => clearProjectStore(PROJECT_ID));

	it("writes the title into metadata", () => {
		setProjectTitle(PROJECT_ID, "My Slop");
		expect(getProjectStore(PROJECT_ID).getState().metadata.title).toBe(
			"My Slop",
		);
	});

	it("leaves sibling metadata untouched", () => {
		getProjectStore(PROJECT_ID).getState().updateMetadata({ style: "noir" });
		setProjectTitle(PROJECT_ID, "My Slop");
		expect(getProjectStore(PROJECT_ID).getState().metadata.style).toBe("noir");
	});
});
