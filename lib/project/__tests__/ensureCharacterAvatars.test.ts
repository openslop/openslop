import { beforeEach, describe, expect, it, vi } from "vitest";
import { GenerationQueue, type GenerationJob } from "@/lib/generation/queue";
import { clearProjectStore, getProjectStore } from "../store";
import {
	buildCharacterAvatarJob,
	characterAvatarElementId,
	ensureCharacterAvatars,
} from "../ensureCharacterAvatars";

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
