import { describe, expect, it, vi } from "vitest";
import type { AssetResult } from "@/lib/connectors/types";
import { ElementHistory, type ElementVersionStorage } from "../history";
import type { GenerationInputs } from "../inputs";
import type { CommittedVersion, ElementVersion } from "../versions";

const { toastError } = vi.hoisted(() => ({ toastError: vi.fn() }));
vi.mock("@/lib/toastError", () => ({ toastError }));

const inputs = (prompt: string): GenerationInputs => ({
	prompt,
	attributes: {},
	dependencies: {},
});

const result = (imageUrl: string): AssetResult => ({
	imageUrl,
	durationSec: 0,
});

const version = (prompt: string, url = `${prompt}.png`): CommittedVersion => ({
	elementId: "a",
	connectorType: "image",
	inputs: inputs(prompt),
	result: result(url),
	pinned: false,
});

const AT = "2026-01-01T00:00:00.000Z";
const stored: ElementVersion = { ...version("kept"), createdAt: AT };

/** Storage that dates every write like the database does: the first run's. */
const storageOf = (
	read: ElementVersionStorage["read"] = () => Promise.resolve([]),
): ElementVersionStorage => ({
	read,
	write: vi.fn((committed) => Promise.resolve({ ...committed, createdAt: AT })),
});

describe("ElementHistory", () => {
	it("files a version once storage has dated it", async () => {
		const storage = storageOf();
		const history = new ElementHistory(storage);
		const listener = vi.fn();
		history.subscribe(listener);

		await history.record(version("a"));

		expect(storage.write).toHaveBeenCalledWith(version("a"));
		expect(history.get("a")).toEqual([{ ...version("a"), createdAt: AT }]);
		expect(listener).toHaveBeenCalledTimes(1);
	});

	it("overwrites the version an unchanged regeneration remade", async () => {
		const history = new ElementHistory(storageOf());

		await history.record(version("a"));
		await history.record(version("a", "redone.png"));

		expect(history.get("a")).toEqual([
			{ ...version("a", "redone.png"), createdAt: AT },
		]);
	});

	it("surfaces a failed write and files nothing", async () => {
		const history = new ElementHistory({
			read: () => Promise.resolve([]),
			write: () => Promise.reject(new Error("denied")),
		});

		await history.record(version("a"));

		expect(history.get("a")).toEqual([]);
		expect(toastError).toHaveBeenCalledWith(
			expect.any(Error),
			"Saving this version failed",
		);
	});

	it("reads an element's stored versions once, on demand", async () => {
		const read = vi.fn().mockResolvedValue([stored]);
		const history = new ElementHistory(storageOf(read));

		expect(history.status("a")).toBe("loading");
		await Promise.all([history.load("a"), history.load("a")]);
		await history.load("a");

		expect(read).toHaveBeenCalledTimes(1);
		expect(history.status("a")).toBe("ready");
		expect(history.get("a")).toEqual([stored]);
	});

	it("reports a failed read and retries it on the next call", async () => {
		const read = vi
			.fn()
			.mockRejectedValueOnce(new Error("offline"))
			.mockResolvedValue([stored]);
		const history = new ElementHistory(storageOf(read));

		await expect(history.load("a")).rejects.toThrow("offline");
		expect(history.status("a")).toBe("failed");

		await history.load("a");
		expect(history.status("a")).toBe("ready");
		expect(history.get("a")).toEqual([stored]);
	});
});
