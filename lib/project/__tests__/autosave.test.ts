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
import {
	AUTOSAVE_DEBOUNCE_MS,
	buildProjectSave,
	createAutosaver,
} from "../autosave";
import type { ProjectContent } from "../projectDocument";
import { createProjectStore, type ProjectStore } from "../store";
import {
	extractStoreSnapshot,
	type ProjectStoreSnapshot,
} from "../storeSnapshot";

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
	store: ProjectStoreSnapshot,
	script: string,
	generation: ProjectContent["generation"] = {},
): ProjectContent => ({ script, store, generation });

const snapshot = (title: string): ProjectStoreSnapshot => ({
	metadata: {
		title,
		style: "",
		narration: {},
		characters: {},
	} as ProjectStoreSnapshot["metadata"],
	referenceImages: [],
});

describe("buildProjectSave", () => {
	it("names the project from its metadata title", () => {
		const input = buildProjectSave(content(snapshot("Moon Rabbit"), "<osml/>"));
		expect(input.name).toBe("Moon Rabbit");
		expect(input.script).toBe("<osml/>");
		expect(input.thumbnail_url).toBeNull();
	});

	it("falls back to Untitled when the title is blank", () => {
		expect(buildProjectSave(content(snapshot("  "), "")).name).toBe("Untitled");
	});

	it("picks the thumbnail from the generation snapshot", () => {
		const input = buildProjectSave(
			content(snapshot("x"), "", { a: imageSnapshot("https://cdn/a.png") }),
		);
		expect(input.thumbnail_url).toBe("https://cdn/a.png");
	});
});

describe("createAutosaver", () => {
	let projectId: string;
	let store: ProjectStore;
	let onSaved: Mock<() => void>;
	let onError: Mock<(error: unknown) => void>;

	const build = () =>
		createAutosaver({
			projectId,
			store,
			read: () => content(extractStoreSnapshot(store), "<osml/>"),
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
		refCount = 0;
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	const hydrate = () => {
		store.getState().updateMetadata({ title: "Moon Rabbit" });
		store.getState().markHydrated();
	};

	let refCount = 0;
	const edit = () => {
		refCount += 1;
		store
			.getState()
			.setReferenceImages(
				Array.from({ length: refCount }, (_, i) => `https://cdn/ref-${i}.png`),
			);
	};

	it("coalesces a burst of changes into one save", async () => {
		hydrate();
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
		hydrate();
		const autosaver = build();
		edit();
		autosaver.schedule();
		autosaver.flush();
		await vi.advanceTimersByTimeAsync(0);

		expect(saveProject).toHaveBeenCalledTimes(1);
	});

	it("skips the save until the store is hydrated", async () => {
		const autosaver = build();
		autosaver.schedule();
		await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);

		expect(saveProject).not.toHaveBeenCalled();
		expect(onSaved).not.toHaveBeenCalled();
	});

	it("does not save when the hydrated state is unchanged", async () => {
		hydrate();
		const autosaver = build();
		autosaver.markSaved();
		// The echo a real open produces: metadata written back with identical content.
		store.getState().updateMetadata({ title: "Moon Rabbit" });
		autosaver.schedule();
		await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);

		expect(saveProject).not.toHaveBeenCalled();
		expect(onSaved).not.toHaveBeenCalled();
	});

	it("does not save the document it was handed as already saved", async () => {
		hydrate();
		// Slate is filled in an effect, so the editor is empty until markSaved.
		let script = "";
		const autosaver = createAutosaver({
			projectId,
			store,
			read: () => content(extractStoreSnapshot(store), script),
			onSaved,
			onError,
		});

		autosaver.schedule();
		script = "<osml/>";
		autosaver.markSaved();
		await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);

		expect(saveProject).not.toHaveBeenCalled();
	});

	it("saves an edit made after the baseline was taken", async () => {
		hydrate();
		const autosaver = build();
		autosaver.markSaved();

		edit();
		autosaver.schedule();
		await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);

		expect(saveProject).toHaveBeenCalledTimes(1);
	});

	it("saves the first real edit after an unchanged open", async () => {
		hydrate();
		const autosaver = build();
		autosaver.markSaved();
		store.getState().updateMetadata({ title: "Moon Rabbit" });
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
		hydrate();
		const autosaver = build();
		edit();
		autosaver.schedule();
		await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);
		expect(saveProject).toHaveBeenCalledTimes(1);

		// Same content again: an idempotent write, not a change.
		store.getState().setReferenceImages([...store.getState().referenceImages]);
		autosaver.schedule();
		await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);

		expect(saveProject).toHaveBeenCalledTimes(1);
	});

	it("still saves when only the generation snapshot changed", async () => {
		hydrate();
		let generation: ProjectContent["generation"] = {};
		const autosaver = createAutosaver({
			projectId,
			store,
			read: () => content(extractStoreSnapshot(store), "<osml/>", generation),
			onSaved,
			onError,
		});

		generation = { a: imageSnapshot("https://cdn/a.png") };
		autosaver.schedule();
		await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);

		expect(saveProject).toHaveBeenCalledTimes(1);
		expect(saveProject).toHaveBeenCalledWith(
			projectId,
			expect.objectContaining({ thumbnail_url: "https://cdn/a.png" }),
		);
	});

	it("holds saves while suspended and takes them again on resume", async () => {
		hydrate();
		const autosaver = build();
		autosaver.markSaved();
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
		hydrate();
		const autosaver = build();
		autosaver.markSaved();
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
		hydrate();
		const autosaver = build();
		autosaver.markSaved();
		edit();
		autosaver.schedule();

		autosaver.suspend();
		await vi.advanceTimersByTimeAsync(0);

		expect(saveProject).toHaveBeenCalledTimes(1);
	});

	it("saves the document as it stood when suspend was called", async () => {
		hydrate();
		let script = "live";
		let release = () => {};
		saveProject.mockImplementationOnce(
			() => new Promise<void>((resolve) => (release = () => resolve())),
		);
		const autosaver = createAutosaver({
			projectId,
			store,
			read: () => content(extractStoreSnapshot(store), script),
			onSaved,
			onError,
		});
		autosaver.markSaved();

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
		hydrate();
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
		hydrate();
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
