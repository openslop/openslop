import { describe, expect, it, vi } from "vitest";
import { asset } from "@/lib/canvas/__tests__/_assets";
import { buildNode } from "@/lib/generation/generation-graph";
import { GenerationQueue } from "@/lib/generation/queue";
import { buildCtx } from "@/lib/generation/__tests__/_context";
import type { Upload } from "@/lib/upload/upload-files";

vi.mock("react", () => ({ useEffect: (effect: () => void) => effect() }));

const queue = new GenerationQueue();
vi.mock("@/lib/generation/generation-queue-provider", () => ({
	useGenerationQueue: () => queue,
}));

const added: Upload[] = [];
vi.mock("@/lib/project/use-project", () => ({
	useProject: () => (media: Upload[]) => added.push(...media),
}));

const { useSaveDraftTakes } = await import("../hooks/use-save-draft-takes");

describe("useSaveDraftTakes", () => {
	it("adds a media draft take to the media", () => {
		useSaveDraftTakes();
		const draft = asset("asset_media_image", { text: "A wizard" });
		const node = buildNode(draft, buildCtx([draft]));

		queue.commitResult(node, {
			imageUrl: "https://blob/wizard.png",
			durationSec: 0,
		});

		expect(added).toEqual([
			{
				kind: "image",
				name: "image",
				url: "https://blob/wizard.png",
			},
		]);
	});

	it("leaves results of anything but a draft out of the media", () => {
		added.length = 0;
		const avatar = asset("asset_avatar", { name: "Mia", text: "A girl" });
		queue.commitResult(buildNode(avatar, buildCtx([avatar])), {
			imageUrl: "https://blob/mia.png",
			durationSec: 0,
		});

		expect(added).toEqual([]);
	});
});
