export const streamToBuffer = (
	stream: ReadableStream<Uint8Array>,
): Promise<ArrayBuffer> => new Response(stream).arrayBuffer();
