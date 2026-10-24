// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { Transforms } from "slate";
import { TooltipProvider } from "@/components/ui/tooltip";
import { mountOnCanvas } from "../../../__tests__/_mount";
import { AudioResultPreview } from "../audio-result-preview";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

vi.mock("@/lib/components/use-peaks", () => ({
	usePeaks: () => ({ status: "ready", peaks: [] }),
}));
vi.mock("../../element-generation-context", () => ({
	useElementGeneration: () => ({ node: { id: "el-1" } }),
}));

let canvas: ReturnType<typeof mountOnCanvas>;

beforeEach(() => {
	canvas = mountOnCanvas([
		{
			id: "el-1",
			type: "sound",
			layoutAttributes: { volume: "2" },
			children: [{ id: "el-1-t", type: "sound", text: "door slam" }],
		},
	]);
	canvas.render(
		<TooltipProvider>
			<AudioResultPreview
				status="idle"
				startedAt={null}
				error={null}
				onDiscard={() => {}}
				result={{ audioUrl: "https://audio/sfx.mp3", durationSec: 2 }}
			/>
		</TooltipProvider>,
	);
});

afterEach(() => canvas.unmount());

const audio = () => {
	const found = document.body.querySelector("audio");
	if (!found) throw new Error("no audio rendered");
	return found;
};

describe("AudioResultPreview", () => {
	it("plays the result at the element's volume, the gain the player applies", () => {
		expect(audio().volume).toBe(0.2);
	});

	it("applies a volume change to the audio already playing", async () => {
		const playing = audio();

		await act(async () =>
			Transforms.setNodes(
				canvas.editor,
				{ layoutAttributes: { volume: "9" } },
				{ at: [0] },
			),
		);

		expect(audio()).toBe(playing);
		expect(playing.volume).toBe(0.9);
	});
});
