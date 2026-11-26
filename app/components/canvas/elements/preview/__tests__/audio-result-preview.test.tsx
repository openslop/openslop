// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";
import { mountOnCanvas } from "@/app/components/canvas/__tests__/_mount";
import { volumeToGain } from "@/lib/canvas/element-attributes";
import { AudioResultPreview } from "../audio-result-preview";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

vi.mock("@/lib/components/use-peaks", () => ({
	usePeaks: () => ({ status: "ready", peaks: [] }),
}));
let element: { layoutAttributes: { volume: string } };
vi.mock("@/app/components/canvas/elements/element-generation-context", () => ({
	useElementGeneration: () => ({ element }),
}));

let canvas: ReturnType<typeof mountOnCanvas>;

function renderPreview() {
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
}

beforeEach(() => {
	element = { layoutAttributes: { volume: "2" } };
	canvas = mountOnCanvas();
	renderPreview();
});

afterEach(() => canvas.unmount());

const audio = () => {
	const found = document.body.querySelector("audio");
	if (!found) throw new Error("no audio rendered");
	return found;
};

describe("AudioResultPreview", () => {
	it("plays the result at the element's volume, the gain the player applies", () => {
		expect(audio().volume).toBe(volumeToGain(2));
	});

	it("applies a volume change to the audio already playing", async () => {
		const playing = audio();

		element = { layoutAttributes: { volume: "9" } };
		renderPreview();

		expect(audio()).toBe(playing);
		expect(playing.volume).toBe(volumeToGain(9));
	});
});
