export type AudioCodec = "mp3" | "pcm";

export type AudioFormat = {
	codec: AudioCodec;
	sampleRate: number;
	bitrateKbps: number;
};

export function audioDurationSec(
	format: AudioFormat,
	data: ArrayBuffer,
): number {
	return (data.byteLength * 8) / (format.bitrateKbps * 1000);
}
