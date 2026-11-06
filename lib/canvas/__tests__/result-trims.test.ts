import { describe, expect, it } from "vitest";
import {
	RESULT_TRIMS_KEY,
	bareResultTrim,
	readResultTrims,
	syncResultTrimAttrs,
	writeActiveResultTrim,
} from "../result-trims";
import type { SplitAttributes } from "../types";

const el = (layout: Record<string, string> = {}): SplitAttributes => ({
	layoutAttributes: layout,
});

describe("readResultTrims", () => {
	it("returns an empty map when missing or invalid", () => {
		expect(readResultTrims(el())).toEqual({});
		expect(readResultTrims(el({ [RESULT_TRIMS_KEY]: "nope" }))).toEqual({});
		expect(readResultTrims(el({ [RESULT_TRIMS_KEY]: "[]" }))).toEqual({});
	});

	it("reads a stored map", () => {
		expect(
			readResultTrims(
				el({
					[RESULT_TRIMS_KEY]: JSON.stringify({
						a: { trimStart: "1", trimDuration: "3" },
					}),
				}),
			),
		).toEqual({ a: { trimStart: "1", trimDuration: "3" } });
	});
});

describe("writeActiveResultTrim", () => {
	it("stores the trim under the result identity and mirrors it onto bare attrs", () => {
		expect(
			writeActiveResultTrim(el(), "v1", {
				trimStart: "1",
				trimDuration: "3",
			}),
		).toEqual({
			[RESULT_TRIMS_KEY]: JSON.stringify({
				v1: { trimStart: "1", trimDuration: "3" },
			}),
			trimStart: "1",
			trimDuration: "3",
		});
	});

	it("clears one identity and the bare attrs on reset", () => {
		const element = el({
			[RESULT_TRIMS_KEY]: JSON.stringify({
				v1: { trimStart: "1", trimDuration: "3" },
				v2: { trimStart: "2", trimDuration: "4" },
			}),
			trimStart: "1",
			trimDuration: "3",
		});
		expect(writeActiveResultTrim(element, "v1", null)).toEqual({
			[RESULT_TRIMS_KEY]: JSON.stringify({
				v2: { trimStart: "2", trimDuration: "4" },
			}),
			trimStart: null,
			trimDuration: null,
		});
	});
});

describe("syncResultTrimAttrs", () => {
	it("adopts a legacy bare trim onto the first active result", () => {
		const element = el({ trimStart: "1", trimDuration: "3" });
		expect(syncResultTrimAttrs(element, null, "v1")).toEqual({
			[RESULT_TRIMS_KEY]: JSON.stringify({
				v1: { trimStart: "1", trimDuration: "3" },
			}),
			trimStart: "1",
			trimDuration: "3",
		});
	});

	it("clears the bare trim when a new result has none", () => {
		const element = el({
			[RESULT_TRIMS_KEY]: JSON.stringify({
				v1: { trimStart: "1", trimDuration: "3" },
			}),
			trimStart: "1",
			trimDuration: "3",
		});
		expect(syncResultTrimAttrs(element, "v1", "v2")).toEqual({
			trimStart: null,
			trimDuration: null,
		});
	});

	it("restores a prior result's trim", () => {
		const element = el({
			[RESULT_TRIMS_KEY]: JSON.stringify({
				v1: { trimStart: "1", trimDuration: "3" },
			}),
		});
		expect(syncResultTrimAttrs(element, "v2", "v1")).toEqual({
			trimStart: "1",
			trimDuration: "3",
		});
	});

	it("stashes the bare trim onto the result being left before projecting the next", () => {
		const element = el({
			[RESULT_TRIMS_KEY]: JSON.stringify({
				v1: { trimStart: "1", trimDuration: "3" },
			}),
			trimStart: "5",
			trimDuration: "2",
		});
		expect(syncResultTrimAttrs(element, "v1", "v2")).toEqual({
			[RESULT_TRIMS_KEY]: JSON.stringify({
				v1: { trimStart: "5", trimDuration: "2" },
			}),
			trimStart: null,
			trimDuration: null,
		});
	});

	it("is a no-op when the identity did not change", () => {
		expect(syncResultTrimAttrs(el({ trimStart: "1" }), "v1", "v1")).toBeNull();
	});

	it("reads bare trim helpers", () => {
		expect(bareResultTrim(el())).toBeNull();
		expect(bareResultTrim(el({ trimStart: "1" }))).toEqual({
			trimStart: "1",
		});
	});
});
