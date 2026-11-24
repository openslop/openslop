// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { Transforms } from "slate";
import { element } from "@/lib/canvas/__tests__/_assets";
import type { GeneratedElement } from "@/lib/canvas/types";
import { mountOnCanvas } from "@/app/components/canvas/__tests__/_mount";
import { usePreviousPictures } from "../use-previous-pictures";

const previewFrames = vi.hoisted(() =>
	vi.fn(async () => ({
		first: new Blob(["first"]),
		middle: new Blob(["middle"]),
		last: new Blob(["last"]),
	})),
);
vi.mock("@/lib/connectors/video/capture-frames", () => ({ previewFrames }));

vi.mock("@/lib/generation/generation-queue-provider", () => ({
	useQueueSelector: <T,>(
		select: (queue: {
			getElementSnapshot: () => { result: { videoUrl: string } };
		}) => T,
	) =>
		select({
			getElementSnapshot: () => ({ result: { videoUrl: "https://vid/a.mp4" } }),
		}),
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let canvas: ReturnType<typeof mountOnCanvas>;

afterEach(() => canvas.unmount());

function Probe({ video }: { video: GeneratedElement }) {
	usePreviousPictures(video, ["last"]);
	return null;
}

async function mount(previousAttrs: Record<string, string>) {
	const video = element("v2", "video", "", { startFrame: "previous" });
	canvas = mountOnCanvas([
		{
			id: "scene-1",
			type: "scene",
			children: [element("v1", "video", "", previousAttrs), video],
		},
	]);
	await act(async () => canvas.render(<Probe video={video} />));
}

describe("usePreviousPictures", () => {
	it("previews the frames of the part of the previous video that plays", async () => {
		previewFrames.mockClear();
		await mount({ trimStart: "1", trimEnd: "3.5" });
		expect(previewFrames).toHaveBeenLastCalledWith("https://vid/a.mp4", {
			startSec: 1,
			endSec: 3.5,
		});
	});

	it("previews the frames again when the previous video is trimmed", async () => {
		previewFrames.mockClear();
		await mount({});
		expect(previewFrames).toHaveBeenLastCalledWith(
			"https://vid/a.mp4",
			undefined,
		);

		await act(async () =>
			Transforms.setNodes(
				canvas.editor,
				{ layoutAttributes: { trimEnd: "2" } },
				{ at: [0, 0] },
			),
		);
		expect(previewFrames).toHaveBeenLastCalledWith("https://vid/a.mp4", {
			startSec: 0,
			endSec: 2,
		});
	});
});
