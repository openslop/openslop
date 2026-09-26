const SAMPLE_RATE = 8000;

/** A mono 16-bit PCM WAV of silence. */
export function wav(seconds: number): ArrayBuffer {
	const samples = Math.round(seconds * SAMPLE_RATE);
	const data = samples * 2;
	const buffer = new ArrayBuffer(44 + data);
	const view = new DataView(buffer);
	const ascii = (at: number, text: string) =>
		[...text].forEach((c, i) => view.setUint8(at + i, c.charCodeAt(0)));
	ascii(0, "RIFF");
	view.setUint32(4, 36 + data, true);
	ascii(8, "WAVE");
	ascii(12, "fmt ");
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);
	view.setUint16(22, 1, true);
	view.setUint32(24, SAMPLE_RATE, true);
	view.setUint32(28, SAMPLE_RATE * 2, true);
	view.setUint16(32, 2, true);
	view.setUint16(34, 16, true);
	ascii(36, "data");
	view.setUint32(40, data, true);
	return buffer;
}
