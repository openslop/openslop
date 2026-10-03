// @vitest-environment happy-dom

import { act, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { findAsset } from "@/lib/canvas/assets";
import { asset } from "@/lib/canvas/__tests__/_assets";
import { flatAttributes } from "@/lib/canvas/elementAttributes";
import { DEFAULT_MODELS } from "@/lib/connectors/models";
import type { ModelRef, VoiceInfo } from "@/lib/connectors/types";
import { click, mountOnCanvas } from "../../../__tests__/_mount";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

vi.mock("@/components/ui/dropdown-menu", () => {
	const Pass = ({ children }: { children: ReactNode }) => <>{children}</>;
	return {
		DropdownMenu: Pass,
		DropdownMenuTrigger: Pass,
		DropdownMenuContent: Pass,
		DropdownMenuItem: ({
			onSelect,
			children,
		}: {
			onSelect: (event: { preventDefault: () => void }) => void;
			children: ReactNode;
		}) => (
			<button role="menuitem" onClick={() => onSelect({ preventDefault() {} })}>
				{children}
			</button>
		),
	};
});

const pick = (option: string) =>
	act(async () => {
		const item = [
			...document.body.querySelectorAll<HTMLElement>('[role="menuitem"]'),
		].find((each) => each.textContent === option);
		if (!item) throw new Error(`no option ${option}`);
		item.click();
	});

vi.mock("@/lib/connectors/useDefaultModels", () => ({
	useDefaultModels: () => ({}),
}));

const OTHER: ModelRef = { provider: "cartesia", model: "Sonic 3.6" };
const ARIA: VoiceInfo = {
	id: "aria",
	name: "Aria",
	language: "en",
	description: "Warm narrator",
};
let picker: { filters: unknown; model: ModelRef; selectedVoiceId?: string };
vi.mock("../VoicePicker", () => ({
	VoicePicker: (props: {
		filters: unknown;
		model: ModelRef;
		selectedVoiceId?: string;
		onSelect: (voice: VoiceInfo) => void;
		onModelChange: (model: ModelRef) => void;
	}) => {
		picker = props;
		return (
			<>
				<button data-pick="voice" onClick={() => props.onSelect(ARIA)} />
				<button data-pick="model" onClick={() => props.onModelChange(OTHER)} />
			</>
		);
	},
}));

const { VoiceEditor } = await import("../VoiceEditor");

let canvas: ReturnType<typeof mountOnCanvas>;
afterEach(() => canvas.unmount());

const voiceOn = (name?: string) => {
	const element = findAsset(canvas.editor.children, "voice", name);
	return element && flatAttributes(element);
};

const voice = (name?: string, attrs: Record<string, string> = {}) =>
	asset("voice", { name, attrs });

describe("VoiceEditor", () => {
	it("renders nothing for a voice that is not on the canvas", () => {
		canvas = mountOnCanvas();

		canvas.render(<VoiceEditor name="Mia" />);

		expect(document.body.querySelector("section")).toBeNull();
		expect(canvas.editor.children).toEqual([]);
	});

	it("writes a trait onto the voice element already there and searches by it", async () => {
		canvas = mountOnCanvas([voice(undefined, { age: "child" })]);
		canvas.render(<VoiceEditor />);

		await pick("feminine");

		expect(canvas.editor.children).toHaveLength(1);
		expect(voiceOn()).toEqual({
			...DEFAULT_MODELS.tts,
			age: "child",
			gender: "feminine",
		});
		expect(picker.filters).toEqual({ gender: "feminine", age: "child" });
	});

	it("writes a character's picked voice to that character's voice element", async () => {
		canvas = mountOnCanvas([voice(), voice("Mia")]);
		canvas.render(<VoiceEditor name="Mia" />);

		await click('[data-pick="voice"]');

		expect(voiceOn("Mia")).toEqual({
			name: "Mia",
			...picker.model,
			voiceId: "aria",
		});
		expect(voiceOn()).toEqual(DEFAULT_MODELS.tts);
		expect(picker.selectedVoiceId).toBe("aria");
	});

	it("leaves a picked voice behind when the voice moves to another model", async () => {
		canvas = mountOnCanvas([voice()]);
		canvas.render(<VoiceEditor />);
		await click('[data-pick="voice"]');

		await click('[data-pick="model"]');

		expect(voiceOn()).toEqual(OTHER);
		expect(picker.selectedVoiceId).toBeUndefined();
	});
});
