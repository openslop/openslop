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

const version = (prompt: string, url = `${prompt}.png`) => ({
	elementId: "a",
	connectorType: "image" as const,
	inputs: inputs(prompt),
	result: result(url),
	pinned: false,
});

const stored = (prompt: string, createdAt: string) => ({
	...version(prompt),
	createdAt,
});

describe("VersionLog", () => {
	it("keeps one version per input set, overwriting what those inputs made before", () => {
		const log = new VersionLog();
		log.record(version("a"), AT);
		const again = log.record(
			version("a", "redone.png"),
			"2026-02-02T00:00:00.000Z",
		);

		expect(log.get("a")).toEqual([again]);
		expect(again.createdAt).toBe(AT);
		expect(again.result).toEqual(result("redone.png"));
	});

	it("keeps versions from different inputs side by side, oldest first", () => {
		const log = new VersionLog();
		const first = log.record(version("a"), AT);
		const second = log.record(version("b"), AT);

		expect(log.get("a")).toEqual([first, second]);
	});

	it("files an upload beside the version it was made to replace", () => {
		const log = new VersionLog();
		const generated = log.record(version("a"), AT);
		const uploaded = log.record(
			{ ...version("a", "upload.png"), pinned: true },
			"2026-02-02T00:00:00.000Z",
		);

		expect(log.get("a")).toEqual([generated, uploaded]);
	});

	it("orders hydrated versions by their timestamps", () => {
		const log = new VersionLog();
		log.hydrate("a", [
			stored("late", "2026-01-02T00:00:00.000Z"),
			stored("early", "2026-01-01T00:00:00.000Z"),
		]);
		expect(log.get("a").map((v) => v.inputs.prompt)).toEqual(["early", "late"]);
		expect(log.isHydrated("a")).toBe(true);
	});

	it("reports an element as unhydrated until its stored versions arrive", () => {
		const log = new VersionLog();
		expect(log.isHydrated("a")).toBe(false);
		expect(log.get("a")).toEqual([]);
	});

	it("keeps versions recorded while the read was in flight", () => {
		const log = new VersionLog();
		const fresh = log.record(version("new"), "2026-01-03T00:00:00.000Z");
		const old = stored("old", "2026-01-01T00:00:00.000Z");
		log.hydrate("a", [old]);

		expect(log.get("a")).toEqual([old, fresh]);
	});

	it("lets a version recorded mid-read supersede the stored one it remade", () => {
		const log = new VersionLog();
		const fresh = log.record(version("same", "fresh.png"), AT);
		log.hydrate("a", [stored("same", "2026-01-01T00:00:00.000Z")]);

		expect(log.get("a")).toEqual([fresh]);
	});
});
