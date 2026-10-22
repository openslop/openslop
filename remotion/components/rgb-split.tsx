import { useId, type ReactNode } from "react";
import { AbsoluteFill } from "remotion";

const SHIFT_PX = 1;

const RED = "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0";
const GREEN = "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0";
const BLUE = "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0";

/** Stays mounted when off so toggling it never remounts the video beneath. */
export function RgbSplit({
	enabled,
	children,
}: {
	enabled: boolean;
	children: ReactNode;
}) {
	const id = useId();
	return (
		<>
			{enabled && (
				<svg width={0} height={0} style={{ position: "absolute" }}>
					<filter id={id} colorInterpolationFilters="sRGB">
						<feColorMatrix in="SourceGraphic" values={RED} />
						<feOffset dx={-SHIFT_PX} result="red" />
						<feColorMatrix in="SourceGraphic" values={GREEN} result="green" />
						<feColorMatrix in="SourceGraphic" values={BLUE} />
						<feOffset dx={SHIFT_PX} result="blue" />
						<feBlend in="red" in2="green" mode="screen" />
						<feBlend in2="blue" mode="screen" />
					</filter>
				</svg>
			)}
			<AbsoluteFill style={enabled ? { filter: `url(#${id})` } : undefined}>
				{children}
			</AbsoluteFill>
		</>
	);
}
