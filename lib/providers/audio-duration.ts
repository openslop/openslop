export async function audioDurationSec(bytes: ArrayBuffer): Promise<number> {
	const { ADTS, BufferSource, FLAC, Input, MP3, MP4, OGG, WAVE } =
		await import("mediabunny");
	const input = new Input({
		source: new BufferSource(bytes),
		formats: [MP3, WAVE, OGG, MP4, FLAC, ADTS],
	});
	try {
		return (
			(await input.getDurationFromMetadata()) ?? (await input.computeDuration())
		);
	} finally {
		input.dispose();
	}
}
