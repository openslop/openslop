import { describe, expect, it } from "vitest";
import { ELEMENT_TYPES } from "@/lib/canvas/types";
import { DEFAULT_CONNECTOR_REGISTRY } from "../registry";

describe("DEFAULT_CONNECTOR_REGISTRY", () => {
	it("holds an entry for every generated type, and none for metadata", () => {
		expect(Object.keys(DEFAULT_CONNECTOR_REGISTRY).sort()).toEqual(
			[...Object.keys(ELEMENT_TYPES), "cast"].sort(),
		);
	});
});
