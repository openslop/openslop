import { describe, expect, it } from "vitest";
import type { AssetResult } from "@/lib/connectors/types";
import { inputsFor } from "./_graph";
import {
	activeVersionIndex,
	VersionLog,
	type ElementVersion,
} from "../versions";

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
	elementType: "image",
	inputs: inputsFor(prompt),
	result: result(url),
	pinned: false,
});

describe("VersionLog", () => {
	it("keeps each take the same inputs made, newest last", () => {
		const log = new VersionLog();
		log.record(version("a"));
		const again = version("a", LATER, "redone.png");
		log.record(again);

		expect(log.get("a")).toEqual([version("a"), again]);
	});

	it("keeps one version per result, overwriting the same result recorded again", () => {
		const log = new VersionLog();
		log.record(version("a"));
		log.record(version("a"));

		expect(log.get("a")).toEqual([version("a")]);
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
		log.record(version("new", LATER));
		log.record(version("same"));
		log.hydrate("a", [
			version("same"),
			version("old", "2025-12-01T00:00:00.000Z"),
		]);

		expect(log.get("a")).toEqual([
			version("old", "2025-12-01T00:00:00.000Z"),
			version("same"),
			version("new", LATER),
		]);
	});
});

describe("activeVersionIndex", () => {
	const versions = [version("a"), version("b")];

	it("finds the version whose inputs made the result on screen", () => {
		const snapshot = {
			result: result("b.png"),
			resultInputs: inputsFor("b"),
			pinned: false,
		};
		expect(activeVersionIndex(versions, snapshot)).toBe(1);
	});

	it("tells takes from the same inputs apart by their result", () => {
		const retaken = [version("a"), version("a", LATER, "redone.png")];
		const snapshot = {
			result: result("redone.png"),
			resultInputs: inputsFor("a"),
			pinned: false,
		};
		expect(activeVersionIndex(retaken, snapshot)).toBe(1);
	});

	it("highlights nothing when a failed regeneration left stale inputs behind", () => {
		const snapshot = {
			result: null,
			resultInputs: inputsFor("b"),
			pinned: false,
		};
		expect(activeVersionIndex(versions, snapshot)).toBe(-1);
	});
});
