import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	GenerationQueue,
	type ElementSnapshot,
	type GenerationJob,
} from "@/lib/generation/queue";
import { getGenerationInputs } from "@/lib/generation/getGenerationInputs";
import { clearProjectStore, getProjectStore } from "../store";
import {
	buildCharacterAvatarJob,
	characterAvatarElement,
	characterAvatarElementId,
	ensureCharacterAvatars,
} from "../ensureCharacterAvatars";

// A queue pre-seeded with an avatar snapshot whose result was produced by
// `seededAppearance` — mimics a project loaded with an already-generated avatar.
function warmQueue(name: string, seededAppearance: string): GenerationQueue {
	const metadata = getProjectStore(PROJECT_ID).getState().metadata;
	const resultInputs = getGenerationInputs(
		characterAvatarElement(name, seededAppearance),
		metadata,
	);
	const snapshot: ElementSnapshot = {
		status: "idle",
		seconds: 0,
		result: null,
		error: null,
		resultInputs,
		connectorType: "image",
	};
	return new GenerationQueue({
		batchSize: 3,
		initialState: { [characterAvatarElementId(name)]: snapshot },
	});
}

const PROJECT_ID = "test-project";

const registry = {
	image: {
		openslop: {
			defaultModel: "test-model",
			models: ["test-model"],
			isDefault: true,
		},
	},
	animated_image: {
		openslop: {
			defaultModel: "test-model",
			models: ["test-model"],
			isDefault: true,
		},
	},
	llm: {
		openslop: { defaultModel: "m", models: ["m"], isDefault: true },
	},
	tts: {
		openslop: { defaultModel: "m", models: ["m"], isDefault: true },
	},
	video: {
		openslop: { defaultModel: "m", models: ["m"], isDefault: true },
	},
	sfx: {
		openslop: { defaultModel: "m", models: ["m"], isDefault: true },
	},
	music: {
		openslop: { defaultModel: "m", models: ["m"], isDefault: true },
	},
};

describe("ensureCharacterAvatars", () => {
	let queue: GenerationQueue;
	let enqueueSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		clearProjectStore(PROJECT_ID);
		queue = new GenerationQueue({ batchSize: 3 });
		enqueueSpy = vi.spyOn(queue, "enqueueAll").mockImplementation(() => {});
	});

	const lastJobs = (): GenerationJob[] =>
		enqueueSpy.mock.calls.at(-1)?.[0] as GenerationJob[];

	it("enqueues a job per character missing avatarUrl", () => {
		getProjectStore(PROJECT_ID)
			.getState()
			.updateMetadata({
				characters: {
					Alice: { appearance: "A young girl with red hair" },
					Bob: { appearance: "A tall man" },
				},
			});

		ensureCharacterAvatars(queue, PROJECT_ID, registry);

		expect(enqueueSpy).toHaveBeenCalledOnce();
		const jobs = lastJobs();
		expect(jobs.map((j) => j.elementId)).toEqual([
			characterAvatarElementId("Alice"),
			characterAvatarElementId("Bob"),
		]);
		for (const job of jobs) {
			expect(job.connectorType).toBe("image");
			expect(job.provider).toBe("openslop");
		}
	});

	it("composes per-job plugins as [character-avatar, art-style, reference-images]", () => {
		getProjectStore(PROJECT_ID)
			.getState()
			.updateMetadata({ characters: { Alice: { appearance: "A girl" } } });

		ensureCharacterAvatars(queue, PROJECT_ID, registry);

		const [job] = lastJobs();
		expect(job.config.plugins?.map((p) => p.name)).toEqual([
			"character-avatar",
			"art-style",
			"reference-images",
		]);
	});

	it("skips characters that already have an avatarUrl", () => {
		getProjectStore(PROJECT_ID)
			.getState()
			.updateMetadata({
				characters: {
					Bob: {
						appearance: "A tall man",
						avatarUrl: "https://existing.com/bob.png",
					},
				},
			});

		ensureCharacterAvatars(queue, PROJECT_ID, registry);

		expect(lastJobs()).toEqual([]);
	});

	it("skips characters with empty appearance", () => {
		getProjectStore(PROJECT_ID)
			.getState()
			.updateMetadata({ characters: { Empty: { appearance: "" } } });

		ensureCharacterAvatars(queue, PROJECT_ID, registry);

		expect(lastJobs()).toEqual([]);
	});

	it("skips an avatar whose appearance is unchanged (warm snapshot, not stale)", () => {
		getProjectStore(PROJECT_ID)
			.getState()
			.updateMetadata({
				characters: {
					Alice: {
						appearance: "A girl in red",
						avatarUrl: "https://existing.com/alice.png",
					},
				},
			});
		const warm = warmQueue("Alice", "A girl in red");
		const spy = vi.spyOn(warm, "enqueueAll").mockImplementation(() => {});

		ensureCharacterAvatars(warm, PROJECT_ID, registry);

		expect(spy.mock.calls.at(-1)?.[0]).toEqual([]);
	});

	it("regenerates an avatar whose appearance changed since it was generated", () => {
		getProjectStore(PROJECT_ID)
			.getState()
			.updateMetadata({
				characters: {
					Alice: {
						appearance: "A girl in blue, now with short hair",
						avatarUrl: "https://existing.com/alice.png",
					},
				},
			});
		// The seeded snapshot was produced by the OLD appearance.
		const warm = warmQueue("Alice", "A girl in red");
		const spy = vi.spyOn(warm, "enqueueAll").mockImplementation(() => {});

		ensureCharacterAvatars(warm, PROJECT_ID, registry);

		const jobs = spy.mock.calls.at(-1)?.[0] as GenerationJob[];
		expect(jobs.map((j) => j.elementId)).toEqual([
			characterAvatarElementId("Alice"),
		]);
	});

	it("buildCharacterAvatarJob produces a job for any character (used for regenerate)", () => {
		getProjectStore(PROJECT_ID)
			.getState()
			.updateMetadata({ characters: { Alice: { appearance: "A girl" } } });

		const job = buildCharacterAvatarJob(PROJECT_ID, "Alice", registry);
		expect(job.elementId).toBe(characterAvatarElementId("Alice"));
		expect(job.connectorType).toBe("image");
		expect(job.element).toEqual({
			id: characterAvatarElementId("Alice"),
			type: "image",
			customAttributes: { kind: "avatar", appearance: "A girl" },
			children: [
				{
					id: `${characterAvatarElementId("Alice")}-t`,
					type: "image",
					text: "Alice",
				},
			],
		});
		expect(job.config.plugins?.map((p) => p.name)).toEqual([
			"character-avatar",
			"art-style",
			"reference-images",
		]);
	});
});
