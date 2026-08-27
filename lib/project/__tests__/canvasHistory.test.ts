import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Autosaver } from "../autosave";
import {
	CanvasHistory,
	FOLD_WINDOW_MS,
	type CanvasVersion,
	type CanvasVersionStorage,
} from "../canvasHistory";
import type { ProjectContent, ProjectDocument } from "../projectDocument";
import { MetadataSchema } from "../types";

/** A version is identified by its script here; the other fields ride along. */
const content = (script: string): ProjectContent => ({
	script,
	store: { metadata: MetadataSchema.parse({}), referenceImages: [] },
	generation: {},
});

function fakeStorage() {
	const rows = new Map<string, ProjectContent>();
	let next = 0;
	const version = (id: string): CanvasVersion => ({
		id,
		updatedAt: `updated-${id}`,
	});
	const storage: CanvasVersionStorage & { rows: typeof rows } = {
		rows,
		list: () =>
			Promise.resolve([...rows.keys()].reverse().map((id) => version(id))),
		read: (id) => {
			const row = rows.get(id);
			return row === undefined
				? Promise.reject(new Error(`No version ${id}`))
				: Promise.resolve(row);
		},
		create: (body) => {
			const id = `v${++next}`;
			rows.set(id, body);
			return Promise.resolve(version(id));
		},
		update: (id, body) => {
			rows.set(id, body);
			return Promise.resolve(version(id));
		},
	};
	return storage;
}

function fakeDocument() {
	let live = content("live");
	const document: ProjectDocument & { current: () => ProjectContent } = {
		current: () => live,
		read: () => live,
		write: (next) => {
			live = next;
		},
	};
	return document;
}

const fakeAutosaver = (): Autosaver => ({
	schedule: vi.fn(),
	flush: vi.fn(),
	markSaved: vi.fn(),
	suspend: vi.fn(),
	resume: vi.fn(),
	onProjectSaved: vi.fn(() => () => {}),
});

const ids = (history: CanvasHistory) =>
	history.getState().versions.map((version) => version.id);

describe("CanvasHistory", () => {
	let storage: ReturnType<typeof fakeStorage>;
	let document: ReturnType<typeof fakeDocument>;
	let autosaver: Autosaver;
	let history: CanvasHistory;

	beforeEach(() => {
		vi.useFakeTimers();
		storage = fakeStorage();
		document = fakeDocument();
		autosaver = fakeAutosaver();
		history = new CanvasHistory(storage, document, autosaver);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("record", () => {
		it("folds saves that land inside the window into one version", async () => {
			await history.record(content("a"));
			vi.advanceTimersByTime(FOLD_WINDOW_MS - 1);
			await history.record(content("b"));

			expect(storage.rows.size).toBe(1);
			expect(storage.rows.get("v1")).toEqual(content("b"));
			expect(ids(history)).toEqual(["v1"]);
		});

		it("starts a new version once the window has passed", async () => {
			await history.record(content("a"));
			vi.advanceTimersByTime(FOLD_WINDOW_MS);
			await history.record(content("b"));

			expect(storage.rows.size).toBe(2);
			expect(ids(history)).toEqual(["v2", "v1"]);
		});

		it("starts a new version for the first save of a session", async () => {
			storage.rows.set("old", content("old"));
			await history.load();
			await history.record(content("a"));

			expect(ids(history)).toEqual(["v1", "old"]);
		});
	});

	describe("preview", () => {
		it("shows the version and holds saving until it is left", async () => {
			await history.record(content("saved"));
			document.write(content("typed since"));

			await history.preview("v1");

			expect(document.current()).toEqual(content("saved"));
			expect(autosaver.suspend).toHaveBeenCalledTimes(1);
			expect(history.getState().previewId).toBe("v1");
		});

		it("puts back what the canvas held before the preview", async () => {
			await history.record(content("saved"));
			document.write(content("typed since"));

			await history.preview("v1");
			history.backToLatest();

			expect(document.current()).toEqual(content("typed since"));
			expect(history.getState().previewId).toBeNull();
			expect(autosaver.resume).toHaveBeenCalledTimes(1);
			expect(autosaver.schedule).not.toHaveBeenCalled();
		});

		it("keeps the pre-preview state while switching between versions", async () => {
			await history.record(content("first"));
			vi.advanceTimersByTime(FOLD_WINDOW_MS);
			await history.record(content("second"));
			document.write(content("typed since"));

			await history.preview("v1");
			await history.preview("v2");
			history.backToLatest();

			expect(document.current()).toEqual(content("typed since"));
		});
	});

	describe("restore", () => {
		it("keeps what is on screen and saves it forward", async () => {
			await history.record(content("old"));
			vi.advanceTimersByTime(FOLD_WINDOW_MS);
			await history.record(content("new"));

			await history.preview("v1");
			history.restore();

			expect(document.current()).toEqual(content("old"));
			expect(history.getState().previewId).toBeNull();
			expect(autosaver.schedule).toHaveBeenCalledTimes(1);
		});

		it("keeps edits made while previewing", async () => {
			await history.record(content("old"));
			vi.advanceTimersByTime(FOLD_WINDOW_MS);
			await history.record(content("new"));

			await history.preview("v1");
			document.write(content("old, edited"));
			history.restore();

			expect(document.current()).toEqual(content("old, edited"));
			expect(autosaver.schedule).toHaveBeenCalledTimes(1);
		});

		it("keeps the replaced state as its own version", async () => {
			await history.record(content("old"));
			vi.advanceTimersByTime(FOLD_WINDOW_MS);
			await history.record(content("new"));

			await history.preview("v1");
			history.restore();
			await history.record(content("old"));

			expect(storage.rows.get("v2")).toEqual(content("new"));
			expect(ids(history)).toEqual(["v3", "v2", "v1"]);
		});
	});

	describe("load", () => {
		it("reports a failed read and retries on the next load", async () => {
			vi.spyOn(console, "error").mockImplementation(() => {});
			const failing = vi
				.spyOn(storage, "list")
				.mockRejectedValueOnce(new Error("offline"));

			await history.load();
			expect(history.getState().status).toBe("failed");

			failing.mockRestore();
			await history.load();
			expect(history.getState().status).toBe("ready");
		});
	});
});
