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
import { getProjectStore } from "../store";
import type { ProjectStoreSnapshot } from "../storeSnapshot";

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
		const input = buildProjectSave(snapshot("Moon Rabbit"), "<osml/>", {});
		expect(input.name).toBe("Moon Rabbit");
		expect(input.script).toBe("<osml/>");
		expect(input.thumbnail_url).toBeNull();
	});

	it("falls back to Untitled when the title is blank", () => {
		expect(buildProjectSave(snapshot("  "), "", {}).name).toBe("Untitled");
	});

	it("picks the thumbnail from the generation snapshot", () => {
		const input = buildProjectSave(snapshot("x"), "", {
			a: imageSnapshot("https://cdn/a.png"),
		});
		expect(input.thumbnail_url).toBe("https://cdn/a.png");
	});
});

describe("createAutosaver", () => {
	let projectId: string;
	let onSaved: Mock<() => void>;
	let onError: Mock<(error: unknown) => void>;

	const build = () => {
		const autosaver = createAutosaver({
			projectId,
			getGeneration: () => ({}),
			onSaved,
			onError,
		});
		autosaver.setScriptSource(() => "<osml/>");
		return autosaver;
	};

	beforeEach(() => {
		vi.useFakeTimers();
		vi.spyOn(console, "error").mockImplementation(() => {});
		saveProject.mockReset().mockResolvedValue(undefined);
		onSaved = vi.fn<() => void>();
		onError = vi.fn<(error: unknown) => void>();
		projectId = `p-${saveProject.mock.calls.length}-${Math.random()}`;
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	const hydrate = () => {
		const store = getProjectStore(projectId);
		store.getState().updateMetadata({ title: "Moon Rabbit" });
		store.getState().markHydrated();
	};

	it("coalesces a burst of changes into one save", async () => {
		hydrate();
		const autosaver = build();
		autosaver.schedule();
		autosaver.schedule();
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

	it("reports a save with no script source instead of writing an empty one", async () => {
		hydrate();
		const autosaver = createAutosaver({
			projectId,
			getGeneration: () => ({}),
			onSaved,
			onError,
		});
		autosaver.schedule();
		await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);

		expect(saveProject).not.toHaveBeenCalled();
		expect(onError).toHaveBeenCalledTimes(1);
	});

	it("reports a failed save instead of throwing", async () => {
		hydrate();
		const boom = new Error("offline");
		saveProject.mockRejectedValue(boom);
		const autosaver = build();
		autosaver.schedule();
		await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);

		expect(onError).toHaveBeenCalledWith(boom);
		expect(onSaved).not.toHaveBeenCalled();
	});
});
