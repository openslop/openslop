import { describe, expect, it } from "vitest";
import { AUTO_LANGUAGE } from "../language";
import { ProjectSettingsSchema } from "../types";
import { DEFAULT_VIDEO_FORMAT } from "../videoFormat";
import { DEFAULT_VIDEO_LENGTH } from "../videoLength";

const DEFAULTS = {
	language: AUTO_LANGUAGE,
	length: DEFAULT_VIDEO_LENGTH,
	format: DEFAULT_VIDEO_FORMAT,
	template: undefined,
};

const STORED = {
	language: "es",
	length: "10-15m",
	format: "faceless",
	template: "pov-life",
};

describe("ProjectSettingsSchema", () => {
	it.each([
		["fills every setting left out", {}, DEFAULTS],
		["keeps every setting held", STORED, STORED],
		[
			"falls back per setting on an unknown value",
			{
				language: "klingon",
				length: "forever",
				format: "Film",
				template: "",
				image: "openslop/Slop Image v1",
			},
			DEFAULTS,
		],
	])("%s", (_, stored, parsed) => {
		expect(ProjectSettingsSchema.parse(stored)).toEqual(parsed);
	});
});
