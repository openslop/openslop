import { describe, expect, it } from "vitest";
import type { AssetResult } from "@/lib/connectors/types";
import type { GenerationInputs } from "../inputs";
import { VersionLog } from "../versions";

const inputs = (prompt: string): GenerationInputs => ({
	prompt,
	attributes: {},
	dependencies: {},
});

const result = (imageUrl: string): AssetResult => ({
	imageUrl,
	durationSec: 0,
});

const AT = "2026-01-01T00:00:00.000Z";

const take = (prompt: string, url = `${prompt}.png`) => ({
	elementId: "a",
	connectorType: "image" as const,
	inputs: inputs(prompt),
	result: result(url),
	pinned: false,
});

const stored = (prompt: string, createdAt: string, id: string) => ({
	...take(prompt),
	createdAt,
	id,
});

describe("VersionLog", () => {
	it("keeps one take per input set, overwriting what those inputs made before", () => {
		const log = new VersionLog();
		const first = log.record(take("a"), AT);
		const again = log.record(
			take("a", "redone.png"),
			"2026-02-02T00:00:00.000Z",
		);

		expect(log.get("a")).toEqual([again]);
		expect(again.id).toBe(first.id);
		expect(again.createdAt).toBe(AT);
		expect(again.result).toEqual(result("redone.png"));
	});

	it("keeps takes from different inputs side by side, oldest first", () => {
		const log = new VersionLog();
		const first = log.record(take("a"), AT);
		const second = log.record(take("b"), AT);

		expect(log.get("a").map((v) => v.id)).toEqual([first.id, second.id]);
		expect(first.id).not.toBe(second.id);
	});

	it("orders hydrated takes by their timestamps", () => {
		const log = new VersionLog();
		log.hydrate("a", [
			stored("late", "2026-01-02T00:00:00.000Z", "2"),
			stored("early", "2026-01-01T00:00:00.000Z", "1"),
		]);
		expect(log.get("a").map((v) => v.id)).toEqual(["1", "2"]);
		expect(log.isHydrated("a")).toBe(true);
	});

	it("reports an element as unhydrated until its stored takes arrive", () => {
		const log = new VersionLog();
		expect(log.isHydrated("a")).toBe(false);
		expect(log.get("a")).toEqual([]);
	});

	it("keeps takes recorded while the read was in flight", () => {
		const log = new VersionLog();
		const fresh = log.record(take("new"), "2026-01-03T00:00:00.000Z");
		log.hydrate("a", [stored("old", "2026-01-01T00:00:00.000Z", "1")]);

		expect(log.get("a").map((v) => v.id)).toEqual(["1", fresh.id]);
	});

	it("lets a take recorded mid-read supersede the stored one it remade", () => {
		const log = new VersionLog();
		const fresh = log.record(take("same", "fresh.png"), AT);
		log.hydrate("a", [stored("same", "2026-01-01T00:00:00.000Z", "stale")]);

		expect(log.get("a")).toEqual([fresh]);
	});
});
