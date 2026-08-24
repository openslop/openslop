import { describe, expect, it } from "vitest";
import { parseElementVersions } from "../elementHistory";

const row = (overrides: Record<string, unknown> = {}) => ({
	id: "11111111-1111-1111-1111-111111111111",
	element_id: "el-1",
	created_at: "2026-01-01T00:00:00.000Z",
	connector_type: "image",
	inputs: { prompt: "a fox", attributes: { style: "ink" }, dependencies: {} },
	result: { durationSec: 0, imageUrl: "https://cdn/a.png" },
	pinned: false,
	...overrides,
});

describe("parseElementVersions", () => {
	it("reads rows into takes the queue can hydrate from", () => {
		expect(parseElementVersions([row()])).toEqual([
			{
				id: "11111111-1111-1111-1111-111111111111",
				elementId: "el-1",
				createdAt: "2026-01-01T00:00:00.000Z",
				connectorType: "image",
				inputs: {
					prompt: "a fox",
					attributes: { style: "ink" },
					dependencies: {},
				},
				result: { durationSec: 0, imageUrl: "https://cdn/a.png" },
				pinned: false,
			},
		]);
	});

	it("treats a project with no history as empty", () => {
		expect(parseElementVersions(null)).toEqual([]);
	});

	it("throws on a row it cannot trust", () => {
		expect(() =>
			parseElementVersions([row({ connector_type: "gif" })]),
		).toThrow();
		expect(() => parseElementVersions([row({ result: {} })])).toThrow();
	});
});
