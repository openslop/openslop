export type PcmFormat = {
	/** The WAVE format code of the sample encoding, e.g. 1 integer, 3 float. */
	audioFormat: number;
	bitsPerSample: number;
	sampleRate: number;
	channels: number;
};

const blockAlign = ({ channels, bitsPerSample }: PcmFormat) =>
	channels * (bitsPerSample / 8);

const byteRate = (format: PcmFormat) => format.sampleRate * blockAlign(format);

export function pcmDurationSec(byteLength: number, format: PcmFormat): number {
	return byteLength / byteRate(format);
}

const HEADER_BYTES = 44;

export function wavFromPcm(pcm: Buffer, format: PcmFormat): Buffer {
	const header = Buffer.alloc(HEADER_BYTES);

	header.write("RIFF", 0);
	header.writeUInt32LE(HEADER_BYTES - 8 + pcm.length, 4);
	header.write("WAVE", 8);
	header.write("fmt ", 12);
	header.writeUInt32LE(16, 16);
	header.writeUInt16LE(format.audioFormat, 20);
	header.writeUInt16LE(format.channels, 22);
	header.writeUInt32LE(format.sampleRate, 24);
	header.writeUInt32LE(byteRate(format), 28);
	header.writeUInt16LE(blockAlign(format), 32);
	header.writeUInt16LE(format.bitsPerSample, 34);
	header.write("data", 36);
	header.writeUInt32LE(pcm.length, 40);

	return Buffer.concat([header, pcm]);
}
