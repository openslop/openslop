import { openAudio } from "./audio-containers";

export async function audioDurationSec(bytes: ArrayBuffer): Promise<number> {
	const input = openAudio(await import("mediabunny"), bytes);
	try {
		return (
			(await input.getDurationFromMetadata()) ?? (await input.computeDuration())
		);
	} finally {
		input.dispose();
	}
}
