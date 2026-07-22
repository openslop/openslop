// Constant-bitrate audio only: audioDurationSec assumes a fixed bitrate.
export type AudioFormat = {
	sampleRate: number;
	bitrateKbps: number;
};

export function audioDurationSec(
	format: AudioFormat,
	data: ArrayBuffer,
): number {
	return (data.byteLength * 8) / (format.bitrateKbps * 1000);
}
