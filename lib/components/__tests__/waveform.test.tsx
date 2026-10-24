// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Waveform } from "../waveform";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
// happy-dom leaves out the standard readyState constants.
Object.assign(HTMLMediaElement, { HAVE_NOTHING: 0, HAVE_METADATA: 1 });

vi.mock("../use-peaks", () => ({
	usePeaks: () => ({ status: "ready", peaks: [] }),
}));

const container = document.body.appendChild(document.createElement("div"));
let root: Root;

beforeEach(() => {
	root = createRoot(container);
});

afterEach(() => {
	act(() => root.unmount());
});

function render(volume?: number) {
	act(() =>
		root.render(<Waveform src="https://audio/a.mp3" volume={volume} />),
	);
	const slider = container.querySelector<HTMLElement>('[role="slider"]');
	const audio = container.querySelector("audio");
	if (!slider || !audio) throw new Error("no waveform rendered");
	return { slider, audio };
}

function load(audio: HTMLAudioElement, duration: number) {
	let currentTime = 0;
	Object.defineProperties(audio, {
		readyState: { value: HTMLMediaElement.HAVE_METADATA, configurable: true },
		duration: { value: duration, configurable: true },
		currentTime: {
			get: () => currentTime,
			set: (time: number) => {
				currentTime = time;
			},
			configurable: true,
		},
	});
	act(() => audio.dispatchEvent(new Event("loadedmetadata")));
}

const press = (slider: HTMLElement, key: string) => {
	const event = new KeyboardEvent("keydown", {
		key,
		bubbles: true,
		cancelable: true,
	});
	act(() => {
		slider.dispatchEvent(event);
	});
	return event;
};

describe("Waveform", () => {
	it("stays out of the tab order until the audio has loaded", () => {
		const { slider } = render();

		expect(slider.tabIndex).toBe(-1);
		expect(slider.getAttribute("aria-disabled")).toBe("true");
	});

	it("is a named slider in the tab order that reports its position once loaded", () => {
		const { slider, audio } = render();
		load(audio, 20);

		expect(slider.tabIndex).toBe(0);
		expect(slider.hasAttribute("aria-disabled")).toBe(false);
		expect(slider.getAttribute("aria-label")).toBe("Seek");
		expect(slider.getAttribute("aria-valuenow")).toBe("0");
	});

	it("seeks five seconds on an arrow key", () => {
		const { slider, audio } = render();
		load(audio, 20);

		expect(press(slider, "ArrowRight").defaultPrevented).toBe(true);
		expect(audio.currentTime).toBe(5);
		expect(slider.getAttribute("aria-valuenow")).toBe("25");
	});

	it("leaves a key it does not own to the browser", () => {
		const { slider, audio } = render();
		load(audio, 20);

		expect(press(slider, "Tab").defaultPrevented).toBe(false);
		expect(audio.currentTime).toBe(0);
	});

	it("follows playback as the audio reports time", () => {
		const { slider, audio } = render();
		load(audio, 20);

		audio.currentTime = 10;
		act(() => audio.dispatchEvent(new Event("timeupdate")));

		expect(slider.getAttribute("aria-valuenow")).toBe("50");
	});

	it("plays at the gain it is given", () => {
		const { audio } = render(0.3);

		expect(audio.volume).toBe(0.3);
	});

	it("follows a gain change while it plays", () => {
		const { audio } = render(0.3);
		const playing = audio;

		render(0.7);

		expect(container.querySelector("audio")).toBe(playing);
		expect(playing.volume).toBe(0.7);
	});

	it("plays at full gain when given none", () => {
		const { audio } = render();

		expect(audio.volume).toBe(1);
	});
});
