import { describe, expect, it, vi } from "vitest";
import type { AssetResult } from "@/lib/connectors/types";
import { ElementHistory, type VersionStorage } from "../history";
import type { GenerationInputs } from "../inputs";
import type { ElementVersion } from "../versions";

const inputs = (prompt: string): GenerationInputs => ({
	prompt,
	attributes: {},
	dependencies: {},
});

const result = (imageUrl: string): AssetResult => ({
	imageUrl,
	durationSec: 0,
});

const version = (prompt: string, url = `${prompt}.png`) => ({
	elementId: "a",
	connectorType: "image" as const,
	inputs: inputs(prompt),
	result: result(url),
	pinned: false,
});

const stored: ElementVersion = {
	...version("kept"),
	createdAt: "2026-01-01T00:00:00.000Z",
};

const storageOf = (
	read: VersionStorage["read"] = () => Promise.resolve([]),
): [VersionStorage, ReturnType<typeof vi.fn>] => {
	const write = vi.fn();
	return [{ read, write }, write];
};

describe("ElementHistory", () => {
	it("files a committed version and stores it", () => {
		const [storage, write] = storageOf();
		const history = new ElementHistory(storage);

		history.record(version("a"));

		expect(history.get("a")).toHaveLength(1);
		expect(write).toHaveBeenCalledWith(
			expect.objectContaining({ elementId: "a", result: result("a.png") }),
		);
	});

	it("overwrites the version an unchanged regeneration remade", () => {
		const [storage, write] = storageOf();
		const history = new ElementHistory(storage);

		history.record(version("a"));
		history.record(version("a", "redone.png"));

		expect(history.get("a")).toHaveLength(1);
		expect(history.get("a")[0]?.result).toEqual(result("redone.png"));
		expect(write.mock.calls[1]?.[0].createdAt).toBe(
			write.mock.calls[0]?.[0].createdAt,
		);
	});

	it("reads an element's stored versions once, on demand", async () => {
		const read = vi.fn().mockResolvedValue([stored]);
		const [storage] = storageOf(read);
		const history = new ElementHistory(storage);

		expect(history.isLoaded("a")).toBe(false);
		await Promise.all([history.load("a"), history.load("a")]);
		await history.load("a");

		expect(read).toHaveBeenCalledTimes(1);
		expect(history.isLoaded("a")).toBe(true);
		expect(history.get("a")).toEqual([stored]);
	});

	it("reports a failed read and retries it on the next call", async () => {
		const read = vi
			.fn()
			.mockRejectedValueOnce(new Error("offline"))
			.mockResolvedValue([stored]);
		const [storage] = storageOf(read);
		const history = new ElementHistory(storage);

		await expect(history.load("a")).rejects.toThrow("offline");
		expect(history.isFailed("a")).toBe(true);

		await history.load("a");
		expect(history.isFailed("a")).toBe(false);
		expect(history.get("a")).toEqual([stored]);
	});

	it("notifies subscribers when a version arrives", () => {
		const [storage] = storageOf();
		const history = new ElementHistory(storage);
		const listener = vi.fn();
		history.subscribe(listener);

		history.record(version("a"));
		expect(listener).toHaveBeenCalledTimes(1);
	});
});
