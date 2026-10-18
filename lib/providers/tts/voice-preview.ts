import { AssetBundle } from "@/lib/api/asset-bundle";
import { vendorParams } from "@/lib/connectors/models";
import type { HostedVoicePreview, ModelRef } from "@/lib/connectors/types";
import {
	DEFAULT_TTS_LANGUAGE,
	type TTSLanguage,
} from "@/lib/connectors/tts/enums";
import { languageSchema } from "@/lib/project/types";
import { audioOf, hostedAudio, type AudioBytes } from "../hosted-audio";
import { PREVIEW_LINES } from "./preview-lines";
import type { TTSProvider } from "./base";

/**
 * Fetches a voice preview URL after verifying its origin matches the
 * provider's allow-list. The origin check covers protocol (HTTPS only),
 * hostname, and port — preventing the caller from coercing a plaintext
 * HTTP request that would leak any attached `Authorization` header.
 * `redirect: "manual"` so any cross-origin redirect is surfaced as a
 * non-`ok` response instead of replaying credentials.
 */
export function fetchAllowedVoicePreview(
	url: string,
	allowedHost: string,
	init?: RequestInit,
): Promise<Response> {
	const allowedOrigin = `https://${allowedHost}`;
	if (new URL(url).origin !== allowedOrigin) {
		throw new Error(`Voice preview origin not allowed: ${url}`);
	}
	return fetch(url, { ...init, redirect: "manual" });
}

/** The vendor's preview in our own store, or one the voice speaks in its own language when the vendor has none. */
export async function voicePreview(
	tts: TTSProvider,
	request: ModelRef & { voiceId: string },
): Promise<HostedVoicePreview> {
	const { voiceId } = request;
	const voice = await tts.getVoice(voiceId);
	if (!voice) throw new Error(`No voice "${voiceId}"`);
	const language = languageSchema.parse(voice.language);
	const audio = await hostedAudio(
		"voice",
		`${request.provider}/${voiceId}`,
		async () =>
			voice.previewUrl
				? audioOf(
						await tts.fetchVoicePreview(voice.previewUrl),
						"Voice preview fetch failed",
					)
				: spokenPreview(tts, request, language ?? DEFAULT_TTS_LANGUAGE),
	);
	return { ...audio, language };
}

async function spokenPreview(
	tts: TTSProvider,
	request: ModelRef & { voiceId: string },
	language: TTSLanguage,
): Promise<AudioBytes> {
	const { output: bundle } = await tts.generate(
		vendorParams("tts", {
			...request,
			prompt: PREVIEW_LINES[language],
		}),
	);
	return audioOf(
		await fetch(AssetBundle.fromResponse(bundle).resolve("audio")),
		"Voice preview generation failed",
	);
}
