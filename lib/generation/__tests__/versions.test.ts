import { describe, expect, it } from "vitest";
import type { AssetResult } from "@/lib/connectors/types";
import type { GenerationInputs } from "../inputs";
import { VersionLog, type ElementVersion } from "../versions";

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
const LATER = "2026-02-02T00:00:00.000Z";

const version = (
	prompt: string,
	createdAt = AT,
	url = `${prompt}.png`,
): ElementVersion => ({
	elementId: "a",
	createdAt,
	connectorType: "image",
	inputs: inputs(prompt),
	result: result(url),
	pinned: false,
});

describe("VersionLog", () => {
	it("keeps one version per input set, overwriting what those inputs made before", () => {
		const log = new VersionLog();
		log.record(version("a"));
		const again = version("a", AT, "redone.png");
		log.record(again);

		expect(log.get("a")).toEqual([again]);
	});

	it("keeps versions from different inputs side by side, oldest first", () => {
		const log = new VersionLog();
		log.record(version("a"));
		log.record(version("b", LATER));

		expect(log.get("a")).toEqual([version("a"), version("b", LATER)]);
	});

	it("files an upload beside the version it was made to replace", () => {
		const log = new VersionLog();
		const uploaded = { ...version("a", LATER, "upload.png"), pinned: true };
		log.record(version("a"));
		log.record(uploaded);

		expect(log.get("a")).toEqual([version("a"), uploaded]);
	});

	it("orders hydrated versions by their timestamps", () => {
		const log = new VersionLog();
		log.hydrate("a", [version("late", LATER), version("early")]);
		expect(log.get("a").map((v) => v.inputs.prompt)).toEqual(["early", "late"]);
		expect(log.isHydrated("a")).toBe(true);
	});

	it("reports an element as unhydrated until its stored versions arrive", () => {
		const log = new VersionLog();
		expect(log.isHydrated("a")).toBe(false);
		expect(log.get("a")).toEqual([]);
	});

	it("keeps versions recorded while the read was in flight, in date order", () => {
		const log = new VersionLog();
		const fresh = version("same", AT, "fresh.png");
		log.record(version("new", LATER));
		log.record(fresh);
		log.hydrate("a", [
			version("same"),
			version("old", "2025-12-01T00:00:00.000Z"),
		]);

		expect(log.get("a")).toEqual([
			version("old", "2025-12-01T00:00:00.000Z"),
			fresh,
			version("new", LATER),
		]);
	});
});
