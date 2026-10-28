type Mediabunny = typeof import("mediabunny");

/** PCM is rewritten losslessly to the sample; the rest is copied a frame at a time. */
export const audioContainers = (mb: Mediabunny) => [
	{ input: mb.MP3, output: mb.Mp3OutputFormat },
	{ input: mb.WAVE, output: mb.WavOutputFormat, forceTranscode: true },
	{ input: mb.OGG, output: mb.OggOutputFormat },
	{ input: mb.FLAC, output: mb.FlacOutputFormat },
	{ input: mb.ADTS, output: mb.AdtsOutputFormat },
	{ input: mb.MP4, output: mb.Mp4OutputFormat },
];

/** Audio bytes in any container we handle, open for reading. */
export const openAudio = (mb: Mediabunny, bytes: ArrayBuffer) =>
	new mb.Input({
		source: new mb.BufferSource(bytes),
		formats: audioContainers(mb).map(({ input }) => input),
	});
