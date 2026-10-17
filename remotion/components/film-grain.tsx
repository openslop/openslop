import {
	AbsoluteFill,
	Img,
	random,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from "remotion";

/** A CC0 scan of evenly exposed Kodak Tri-X 400, high-passed around middle grey. */
const PLATE = staticFile("effects/tri-x-400-grain.jpg");
const PLATE_PX = 2048;

const layer: React.CSSProperties = {
	mixBlendMode: "overlay",
	opacity: 0.2,
	overflow: "hidden",
	pointerEvents: "none",
};

export function FilmGrain() {
	const frame = useCurrentFrame();
	const { width, height } = useVideoConfig();
	const x = Math.floor(random(`grain-x-${frame}`) * (PLATE_PX - width));
	const y = Math.floor(random(`grain-y-${frame}`) * (PLATE_PX - height));
	return (
		<AbsoluteFill style={layer}>
			<Img
				src={PLATE}
				style={{
					position: "absolute",
					width: PLATE_PX,
					height: PLATE_PX,
					maxWidth: "none",
					transform: `translate(${-x}px, ${-y}px)`,
				}}
			/>
		</AbsoluteFill>
	);
}
