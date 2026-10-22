import { AnimatedImage, Img } from "remotion";

const canDecodeFrames = typeof ImageDecoder !== "undefined";

/** Decodes each frame so an animated image follows the playhead, falling back to `<Img>` where WebCodecs has no `ImageDecoder`. */
export function FrameImage({
	src,
	style,
}: {
	src: string;
	style: React.CSSProperties;
}) {
	return canDecodeFrames ? (
		<AnimatedImage src={src} fit="cover" style={style} />
	) : (
		<Img src={src} crossOrigin="anonymous" style={style} />
	);
}
