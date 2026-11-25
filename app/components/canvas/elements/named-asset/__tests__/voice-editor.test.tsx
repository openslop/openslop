// @vitest-environment happy-dom

import { act, useSyncExternalStore, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { findAsset } from "@/lib/canvas/assets";
import { useAsset } from "@/lib/canvas/use-assets";
import { DEFAULT_MODELS } from "@/lib/connectors/models";
import { asset } from "@/lib/canvas/__tests__/_assets";
import { flatAttributes } from "@/lib/canvas/element-attributes";
import type { ModelRef, VoiceInfo } from "@/lib/connectors/types";
import { GenerationQueue } from "@/lib/generation/queue";
import { jobNode } from "@/lib/generation/__tests__/_graph";
import { click, mountOnCanvas } from "@/app/components/canvas/__tests__/_mount";

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

const OTHER: ModelRef = { provider: "cartesia", model: "Sonic 3.6" };
const ARIA: VoiceInfo = {
	id: "aria",
	name: "Aria",
	language: "en",
	description: "Warm narrator",
};
let picker: { filters: unknown; model: ModelRef; selectedVoiceId?: string };
vi.mock("../voice-picker", () => ({
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

let queue: GenerationQueue;
vi.mock("@/lib/generation/generation-queue-provider", () => ({
	useGenerationQueue: () => queue,
}));
vi.mock("@/app/components/canvas/elements/element-generation-context", () => ({
	ElementGenerationProvider: ({ children }: { children: ReactNode }) =>
		children,
	useElementGeneration: () => {
		const snapshot = useSyncExternalStore(queue.subscribe, () =>
			queue.getElementSnapshot(editing),
		);
		return { result: snapshot.result };
	},
}));

let editing: string;

const { VoiceEditor } = await import("../voice-editor");

function VoiceOf({ name }: { name: string }) {
	const voice = useAsset("asset_voice", name);
	return voice ? <VoiceEditor element={voice} /> : null;
}

let canvas: ReturnType<typeof mountOnCanvas>;
beforeEach(() => {
	queue = new GenerationQueue();
});
afterEach(() => canvas.unmount());

const voiceOn = (name: string) => {
	const element = findAsset(canvas.editor.children, "asset_voice", name);
	return element && flatAttributes(element);
};

const voice = (name: string, attrs: Record<string, string> = {}) =>
	asset("asset_voice", { name, attrs });

describe("VoiceEditor", () => {
	it("writes a trait onto the voice and searches by it", async () => {
		const narrator = voice("Narrator", { age: "child" });
		editing = narrator.id;
		canvas = mountOnCanvas([narrator]);
		canvas.render(<VoiceOf name={"Narrator"} />);

		await pick("feminine");

		expect(canvas.editor.children).toHaveLength(1);
		expect(voiceOn("Narrator")).toEqual({
			name: "Narrator",
			...DEFAULT_MODELS.voice,
			age: "child",
			gender: "feminine",
		});
		expect(picker.filters).toEqual({ gender: "feminine", age: "child" });
	});

	it("shows the voice its traits found", () => {
		const narrator = voice("Narrator");
		editing = narrator.id;
		queue.commitResult(jobNode(narrator.id), {
			voiceId: "v-found",
			durationSec: 2,
		});
		canvas = mountOnCanvas([narrator]);
		canvas.render(<VoiceOf name={"Narrator"} />);

		expect(picker.selectedVoiceId).toBe("v-found");
	});

	it("writes a picked voice to that speaker alone, over the one found", async () => {
		const mia = voice("Mia");
		editing = mia.id;
		queue.commitResult(jobNode(mia.id), { voiceId: "v-found", durationSec: 2 });
		canvas = mountOnCanvas([voice("Narrator"), mia]);
		canvas.render(<VoiceOf name="Mia" />);

		await click('[data-pick="voice"]');

		expect(voiceOn("Mia")).toEqual({
			name: "Mia",
			...DEFAULT_MODELS.voice,
			pickedVoiceId: "aria",
		});
		expect(voiceOn("Narrator")).toEqual({
			name: "Narrator",
			...DEFAULT_MODELS.voice,
		});
		expect(picker.selectedVoiceId).toBe("aria");
	});

	it("drops a picked voice when the voice moves to another model", async () => {
		const narrator = voice("Narrator");
		editing = narrator.id;
		canvas = mountOnCanvas([narrator]);
		canvas.render(<VoiceOf name={"Narrator"} />);
		await click('[data-pick="voice"]');

		await click('[data-pick="model"]');

		expect(voiceOn("Narrator")).toEqual({ name: "Narrator", ...OTHER });
		expect(picker.selectedVoiceId).toBeUndefined();
	});
});
