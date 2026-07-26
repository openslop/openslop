import { useState } from "react";
import loaderStyles from "./placeholderBalls.module.css";

interface PlaceholderBall {
	color: string;
	size: string;
	duration: string;
	x: string;
	y: string;
}

const PLACEHOLDER_BALLS: PlaceholderBall[] = [
	{ color: "#cab3d6", size: "14px", duration: "4.2s", x: "40px", y: "-100px" },
	{ color: "#f5aa64", size: "16px", duration: "5.8s", x: "-50px", y: "280px" },
	{ color: "#f58c02", size: "10px", duration: "7.3s", x: "90px", y: "220px" },
	{ color: "#94c9e9", size: "18px", duration: "6.4s", x: "-75px", y: "-70px" },
	{ color: "#eeaeca", size: "20px", duration: "10s", x: "25px", y: "120px" },
	{ color: "#f57802", size: "12px", duration: "3.7s", x: "-40px", y: "190px" },
	{ color: "#cab3d6", size: "11px", duration: "2.6s", x: "75px", y: "-150px" },
	{ color: "#f5aa64", size: "17px", duration: "6.9s", x: "-25px", y: "140px" },
	{ color: "#f55702", size: "13px", duration: "5.3s", x: "60px", y: "-220px" },
	{ color: "#94c9e9", size: "19px", duration: "7.7s", x: "-90px", y: "240px" },
	{ color: "#5eaebf", size: "16px", duration: "6.3s", x: "85px", y: "-180px" },
];

function useStaticRotations() {
	const [rotations] = useState(() =>
		PLACEHOLDER_BALLS.map(() => Math.floor(Math.random() * 360)),
	);
	return rotations;
}

function PlaceholderBalls({
	generating,
	staticRotations,
}: {
	generating: boolean;
	staticRotations: number[];
}) {
	return (
		<>
			{PLACEHOLDER_BALLS.map((ball, i) => (
				<span
					key={i}
					className={
						generating
							? loaderStyles.ball
							: `${loaderStyles.ball} ${loaderStyles.ballStatic}`
					}
					style={
						{
							"--color": ball.color,
							"--i": ball.size,
							"--d": ball.duration,
							"--x": ball.x,
							"--y": ball.y,
							...(!generating && {
								"--rotation": `${staticRotations[i]}deg`,
							}),
						} as React.CSSProperties
					}
				/>
			))}
		</>
	);
}

export function PlaceholderBallsLoader({
	generating,
}: {
	generating: boolean;
}) {
	const staticRotations = useStaticRotations();
	return (
		<div className={loaderStyles.clip} aria-hidden="true">
			<div className={loaderStyles.containerLoader}>
				<PlaceholderBalls
					generating={generating}
					staticRotations={staticRotations}
				/>
			</div>
		</div>
	);
}
