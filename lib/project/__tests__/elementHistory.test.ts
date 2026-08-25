import { beforeEach, describe, expect, it, vi } from "vitest";

const { upsert } = vi.hoisted(() => ({ upsert: vi.fn() }));

vi.mock("@/lib/supabase/client", () => ({
	createClient: () => ({ from: () => ({ upsert }) }),
}));

import type { ElementVersion } from "@/lib/generation/versions";
import { parseElementVersions, saveElementVersion } from "../elementHistory";

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
	it("reads rows into versions the queue can hydrate from", () => {
		expect(parseElementVersions([row()])).toEqual([
			{
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

const makeVersion = (
	overrides: Partial<ElementVersion> = {},
): ElementVersion => ({
	elementId: "el-1",
	createdAt: "2026-01-01T00:00:00.000Z",
	connectorType: "image",
	inputs: { prompt: "a fox", attributes: {}, dependencies: {} },
	result: { durationSec: 0, imageUrl: "https://cdn/a.png" },
	pinned: false,
	...overrides,
});

const savedRow = async (
	projectId: string,
	version: ElementVersion,
): Promise<Record<string, unknown>> => {
	upsert.mockClear();
	await saveElementVersion(projectId, version);
	return upsert.mock.calls[0]?.[0] as Record<string, unknown>;
};

describe("saveElementVersion", () => {
	beforeEach(() => {
		upsert.mockResolvedValue({ error: null });
	});

	it("gives a version the same row whatever the client has read back", async () => {
		const first = await savedRow("p1", makeVersion());
		const remade = await savedRow(
			"p1",
			makeVersion({
				createdAt: "2026-02-02T00:00:00.000Z",
				result: { durationSec: 0, imageUrl: "https://cdn/redone.png" },
			}),
		);

		expect(remade.id).toBe(first.id);
		expect(String(first.id)).toMatch(
			/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/,
		);
	});

	it("leaves a remade version's date alone", async () => {
		expect(await savedRow("p1", makeVersion())).not.toHaveProperty(
			"created_at",
		);
	});

	it("gives an upload a row of its own", async () => {
		const generated = await savedRow("p1", makeVersion());
		const uploaded = await savedRow("p1", makeVersion({ pinned: true }));

		expect(uploaded.id).not.toBe(generated.id);
	});

	it("keeps projects apart when they share an element id", async () => {
		const mine = await savedRow("p1", makeVersion());
		const theirs = await savedRow("p2", makeVersion());

		expect(theirs.id).not.toBe(mine.id);
	});

	it("throws when the write fails", async () => {
		upsert.mockResolvedValue({ error: new Error("denied") });
		await expect(saveElementVersion("p1", makeVersion())).rejects.toThrow(
			"denied",
		);
	});
});
