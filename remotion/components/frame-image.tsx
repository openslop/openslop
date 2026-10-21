import { AnimatedImage, Img, useRemotionEnvironment } from "remotion";

/** Chrome plays an animated `<img>` on wall-clock time, so an export decodes each frame instead. */
export function FrameImage({
	src,
	style,
}: {
	src: string;
	style: React.CSSProperties;
}) {
	const { isRendering } = useRemotionEnvironment();
	return isRendering ? (
		<AnimatedImage src={src} fit="cover" style={style} />
	) : (
		<Img src={src} crossOrigin="anonymous" style={style} />
	);
}
