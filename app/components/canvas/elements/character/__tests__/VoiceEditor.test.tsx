// @vitest-environment happy-dom

import { act, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { findAsset, NARRATOR, NO_AVATAR } from "@/lib/canvas/assets";
import { useAsset } from "@/lib/canvas/useAssets";
import { DEFAULT_MODELS } from "@/lib/connectors/models";
import { asset } from "@/lib/canvas/__tests__/_assets";
import { flatAttributes } from "@/lib/canvas/elementAttributes";
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

function CharacterVoice({ name }: { name: string }) {
	const character = useAsset("asset_character", name);
	return character ? <VoiceEditor character={character} /> : null;
}

let canvas: ReturnType<typeof mountOnCanvas>;
afterEach(() => canvas.unmount());

const characterOn = (name: string) => {
	const element = findAsset(canvas.editor.children, "asset_character", name);
	return element && flatAttributes(element);
};

const DEFAULT_VOICE = {
	voiceProvider: DEFAULT_MODELS.tts.provider,
	voiceModel: DEFAULT_MODELS.tts.model,
};

const narrator = (attrs: Record<string, string> = {}) =>
	asset("asset_character", {
		name: NARRATOR,
		attrs: { ...NO_AVATAR, ...attrs },
	});

describe("VoiceEditor", () => {
	it("writes a trait onto the character and searches by it", async () => {
		canvas = mountOnCanvas([narrator({ age: "child" })]);
		canvas.render(<CharacterVoice name={NARRATOR} />);

		await pick("feminine");

		expect(canvas.editor.children).toHaveLength(1);
		expect(characterOn(NARRATOR)).toEqual({
			name: NARRATOR,
			...NO_AVATAR,
			...DEFAULT_MODELS.image,
			...DEFAULT_VOICE,
			age: "child",
			gender: "feminine",
		});
		expect(picker.filters).toEqual({ gender: "feminine", age: "child" });
	});

	it("writes a picked voice to that character alone", async () => {
		canvas = mountOnCanvas([
			narrator(),
			asset("asset_character", { name: "Mia" }),
		]);
		canvas.render(<CharacterVoice name="Mia" />);

		await click('[data-pick="voice"]');

		expect(characterOn("Mia")).toEqual({
			name: "Mia",
			...DEFAULT_MODELS.image,
			voiceProvider: picker.model.provider,
			voiceModel: picker.model.model,
			voiceId: "aria",
		});
		expect(characterOn(NARRATOR)).toEqual({
			name: NARRATOR,
			...NO_AVATAR,
			...DEFAULT_MODELS.image,
			...DEFAULT_VOICE,
		});
		expect(picker.selectedVoiceId).toBe("aria");
	});

	it("leaves a picked voice behind when the voice moves to another model", async () => {
		canvas = mountOnCanvas([narrator()]);
		canvas.render(<CharacterVoice name={NARRATOR} />);
		await click('[data-pick="voice"]');

		await click('[data-pick="model"]');

		expect(characterOn(NARRATOR)).toEqual({
			name: NARRATOR,
			...NO_AVATAR,
			...DEFAULT_MODELS.image,
			voiceProvider: OTHER.provider,
			voiceModel: OTHER.model,
		});
		expect(picker.selectedVoiceId).toBeUndefined();
	});
});
