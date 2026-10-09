import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type Mock,
	vi,
} from "vitest";
import type { ElementSnapshot } from "@/lib/generation/snapshots";
import { AUTOSAVE_DEBOUNCE_MS, createAutosaver } from "../autosave";
import type { SavedProject } from "../savedProject";
import {
	createProjectStore,
	extractStoreSnapshot,
	type ProjectData,
	type ProjectStore,
} from "../store";

const saveProject = vi.hoisted(() => vi.fn());
vi.mock("../api", () => ({ saveProject }));

const imageSnapshot = (imageUrl: string): ElementSnapshot => ({
	status: "idle",
	seconds: 0,
	result: { durationSec: 0, imageUrl },
	error: null,
	resultInputs: null,
	connectorType: "image",
	pinned: false,
});

const content = (
	store: ProjectData,
	script: string,
	generation: SavedProject["generation"] = {},
): SavedProject => ({ script, store, generation });

describe("createAutosaver", () => {
	let projectId: string;
	let store: ProjectStore;
	let onSaved: Mock<() => void>;
	let onError: Mock<(error: unknown) => void>;
	let name: string;
	let thumbnailUrl: string | null;
	const details = () => ({ name, thumbnail_url: thumbnailUrl });

	const build = (
		read = () => content(extractStoreSnapshot(store), "<osml/>"),
	) =>
		createAutosaver({
			projectId,
			document: { read, details },
			onSaved,
			onError,
		});

	beforeEach(() => {
		vi.useFakeTimers();
		vi.spyOn(console, "error").mockImplementation(() => {});
		saveProject.mockReset().mockResolvedValue(undefined);
		onSaved = vi.fn<() => void>();
		onError = vi.fn<(error: unknown) => void>();
		projectId = `p-${saveProject.mock.calls.length}-${Math.random()}`;
		store = createProjectStore();
		edits = 0;
		name = "Moon Rabbit";
		thumbnailUrl = null;
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	let edits = 0;
	const edit = () => {
		edits += 1;
		store
			.getState()
			.updateVideoSettings({ captionStyle: { fontSize: 40 + edits * 2 } });
	};

	it("coalesces a burst of changes into one save", async () => {
		const autosaver = build();
		edit();
		autosaver.schedule();
		edit();
		autosaver.schedule();
		edit();
		autosaver.schedule();

		expect(saveProject).not.toHaveBeenCalled();
		await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);

		expect(saveProject).toHaveBeenCalledTimes(1);
		expect(saveProject).toHaveBeenCalledWith(
			projectId,
			expect.objectContaining({ name: "Moon Rabbit", script: "<osml/>" }),
		);
		expect(onSaved).toHaveBeenCalledTimes(1);
	});

	it("flush runs a pending save immediately", async () => {
		const autosaver = build();
		edit();
		autosaver.schedule();
		autosaver.flush();
		await vi.advanceTimersByTimeAsync(0);

		expect(saveProject).toHaveBeenCalledTimes(1);
	});

	it("does not save the document it was built from", async () => {
		const autosaver = build();

		autosaver.schedule();
		await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);

		expect(saveProject).not.toHaveBeenCalled();
	});

	it("saves the first real edit after an unchanged open", async () => {
		const autosaver = build();
		store.getState().updateVideoSettings({
			aspectRatio: store.getState().videoSettings.aspectRatio,
		});
		autosaver.schedule();
		await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);
		expect(saveProject).not.toHaveBeenCalled();

		edit();
		autosaver.schedule();
		await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);

		expect(saveProject).toHaveBeenCalledTimes(1);
		expect(onSaved).toHaveBeenCalledTimes(1);
	});

	it("skips a repeat of a payload it just saved", async () => {
		const autosaver = build();
		edit();
		autosaver.schedule();
		await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);
		expect(saveProject).toHaveBeenCalledTimes(1);

		store
			.getState()
			.updateVideoSettings({ captionStyle: { fontSize: 40 + edits * 2 } });
		autosaver.schedule();
		await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);

		expect(saveProject).toHaveBeenCalledTimes(1);
	});

	it("still saves when only the generation snapshot changed", async () => {
		let generation: SavedProject["generation"] = {};
		const autosaver = build(() =>
			content(extractStoreSnapshot(store), "<osml/>", generation),
		);

		generation = { a: imageSnapshot("https://cdn/a.png") };
		autosaver.schedule();
		await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);

		expect(saveProject).toHaveBeenCalledTimes(1);
		expect(saveProject).toHaveBeenCalledWith(
			projectId,
			expect.objectContaining({ generation }),
		);
	});

	it("saves the thumbnail the document shows as the debounce fires", async () => {
		const autosaver = build();

		thumbnailUrl = "https://cdn/a.png";
		autosaver.schedule();
		await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);

		expect(saveProject).toHaveBeenCalledTimes(1);
		expect(saveProject).toHaveBeenCalledWith(
			projectId,
			expect.objectContaining({ thumbnail_url: "https://cdn/a.png" }),
		);
	});

	it("holds saves while suspended and takes them again on resume", async () => {
		const autosaver = build();
		autosaver.suspend();

		edit();
		autosaver.schedule();
		await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);
		expect(saveProject).not.toHaveBeenCalled();

		autosaver.resume();
		await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);

		expect(saveProject).toHaveBeenCalledTimes(1);
	});

	it("stays quiet on resume when nothing was held", async () => {
		const autosaver = build();
		edit();
		autosaver.schedule();
		await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);
		expect(saveProject).toHaveBeenCalledTimes(1);

		autosaver.suspend();
		autosaver.resume();
		await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);

		expect(saveProject).toHaveBeenCalledTimes(1);
	});

	it("persists a pending edit before suspending", async () => {
		const autosaver = build();
		edit();
		autosaver.schedule();

		autosaver.suspend();
		await vi.advanceTimersByTimeAsync(0);

		expect(saveProject).toHaveBeenCalledTimes(1);
	});

	it("saves the document as it stood when suspend was called", async () => {
		let script = "live";
		let release = () => {};
		saveProject.mockImplementationOnce(
			() => new Promise<void>((resolve) => (release = () => resolve())),
		);
		const autosaver = build(() => content(extractStoreSnapshot(store), script));

		edit();
		autosaver.schedule();
		await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);

		// A second edit queues behind the in-flight save, then a preview swaps
		// the script out from under it.
		edit();
		autosaver.schedule();
		autosaver.suspend();
		script = "an older version on screen";
		release();
		await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);

		expect(saveProject).toHaveBeenCalledTimes(2);
		expect(saveProject).toHaveBeenLastCalledWith(
			projectId,
			expect.objectContaining({ script: "live" }),
		);
	});

	it("reports every save to its subscribers until they unsubscribe", async () => {
		const autosaver = build();
		const seen: string[] = [];
		const stop = autosaver.onProjectSaved(({ script }) => seen.push(script));

		edit();
		autosaver.schedule();
		await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);
		expect(seen).toEqual(["<osml/>"]);

		stop();
		edit();
		autosaver.schedule();
		await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);

		expect(saveProject).toHaveBeenCalledTimes(2);
		expect(seen).toEqual(["<osml/>"]);
	});

	it("reports a failed save instead of throwing", async () => {
		const boom = new Error("offline");
		saveProject.mockRejectedValue(boom);
		const autosaver = build();
		edit();
		autosaver.schedule();
		await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);

		expect(onError).toHaveBeenCalledWith(boom);
		expect(onSaved).not.toHaveBeenCalled();
	});
});
