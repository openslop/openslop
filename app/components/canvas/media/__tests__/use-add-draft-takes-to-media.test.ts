// @vitest-environment happy-dom

import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { asset } from "@/lib/canvas/__tests__/_assets";
import { buildNode } from "@/lib/generation/generation-graph";
import { GenerationQueue } from "@/lib/generation/queue";
import { buildCtx } from "@/lib/generation/__tests__/_context";
import type { Upload } from "@/lib/upload/upload-files";
import { useAddDraftTakesToMedia } from "../use-add-draft-takes-to-media";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const queue = new GenerationQueue();
vi.mock("@/lib/generation/generation-queue-provider", () => ({
	useGenerationQueue: () => queue,
}));

const added: Upload[] = [];
const addMedia = (media: Upload[]) => added.push(...media);
vi.mock("@/lib/project/use-project", () => ({
	useProject: () => addMedia,
}));

function Probe() {
	useAddDraftTakesToMedia();
	return null;
}

let root: Root;

beforeEach(() => {
	added.length = 0;
	root = createRoot(document.createElement("div"));
	act(() => root.render(createElement(Probe)));
});

afterEach(() => act(() => root.unmount()));

describe("useAddDraftTakesToMedia", () => {
	it("adds a media draft take to the media", () => {
		const draft = asset("asset_media_image", { text: "A wizard" });

		queue.commitResult(buildNode(draft, buildCtx([draft])), {
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

	it("records costUsd on the media item when the take cost money", () => {
		const draft = asset("asset_media_image", { text: "A wizard" });

		queue.commitResult(buildNode(draft, buildCtx([draft])), {
			imageUrl: "https://blob/wizard.png",
			durationSec: 0,
			costUsd: 0.05,
		});

		expect(added).toEqual([
			{
				kind: "image",
				name: "image",
				url: "https://blob/wizard.png",
				costUsd: 0.05,
			},
		]);
	});

	it("leaves results of anything but a draft out of the media", () => {
		const avatar = asset("asset_avatar", { name: "Mia", text: "A girl" });

		queue.commitResult(buildNode(avatar, buildCtx([avatar])), {
			imageUrl: "https://blob/mia.png",
			durationSec: 0,
		});

		expect(added).toEqual([]);
	});

	it("stops adding takes once unmounted", () => {
		act(() => root.unmount());
		const draft = asset("asset_media_image", { text: "A wizard" });

		queue.commitResult(buildNode(draft, buildCtx([draft])), {
			imageUrl: "https://blob/wizard.png",
			durationSec: 0,
		});

		expect(added).toEqual([]);
	});
});
