import { describe, expect, it, vi } from "vitest";
import { PendingUploads } from "../pending-uploads";

describe("PendingUploads", () => {
	it("blocks an element only while its own upload is in flight", () => {
		const uploads = new PendingUploads();
		const release = uploads.begin({ element: "a" });

		expect(uploads.blocks("a")).toBe(true);
		expect(uploads.blocks("b")).toBe(false);

		release();
		expect(uploads.blocks("a")).toBe(false);
	});

	it("blocks every element while a project upload is in flight", () => {
		const uploads = new PendingUploads();
		const release = uploads.begin("project");

		expect(uploads.blocks("a")).toBe(true);
		expect(uploads.blocks("b")).toBe(true);

		release();
		expect(uploads.blocks("a")).toBe(false);
	});

	it("keeps blocking until every upload for the element has landed", () => {
		const uploads = new PendingUploads();
		const first = uploads.begin({ element: "a" });
		const second = uploads.begin({ element: "a" });

		first();
		expect(uploads.blocks("a")).toBe(true);

		second();
		expect(uploads.blocks("a")).toBe(false);
	});

	it("notifies subscribers when an upload starts and when it lands", () => {
		const uploads = new PendingUploads();
		const listener = vi.fn();
		uploads.subscribe(listener);

		const release = uploads.begin("project");
		release();

		expect(listener).toHaveBeenCalledTimes(2);
	});
});
