import { vi } from "vitest";
import type {
	ModelRef,
	TTSConnector,
	VoiceSearchParams,
} from "@/lib/connectors/types";

export const tts = {
	searchVoices: vi.fn(),
	voicePreview: vi.fn(),
	createConnector: (_type: string, model: ModelRef): Partial<TTSConnector> => ({
		searchVoices: (params: VoiceSearchParams) =>
			tts.searchVoices(model, params),
		voicePreview: tts.voicePreview,
	}),
};

export function resetTts() {
	tts.searchVoices.mockReset();
	tts.searchVoices.mockResolvedValue([
		{ id: "v-found", name: "Found", description: "" },
	]);
	tts.voicePreview.mockReset();
}
