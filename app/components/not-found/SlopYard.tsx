"use client";

import {
	useRef,
	type CSSProperties,
	type PointerEvent,
	type ReactNode,
} from "react";
import styles from "./SlopYard.module.css";
import {
	RegeneratedTwin,
	Skyline,
	Sloppy,
	SlopYardForeground,
	Yard,
} from "./slopYardArt";

function Layer({ depth, children }: { depth: number; children: ReactNode }) {
	return (
		<g className={styles.layer} style={{ "--depth": depth } as CSSProperties}>
			{children}
		</g>
	);
}

const SCENE_LABEL =
	"Sloppy, the OpenSlop robot, standing in a yard of failed generations and proudly holding up a broken render";

export default function SlopYard() {
	const ref = useRef<HTMLDivElement>(null);

	function aim(event: PointerEvent<HTMLDivElement>) {
		const el = ref.current;
		if (!el) return;
		const box = el.getBoundingClientRect();
		el.style.setProperty(
			"--px",
			`${(event.clientX - box.left) / box.width - 0.5}`,
		);
		el.style.setProperty(
			"--py",
			`${(event.clientY - box.top) / box.height - 0.5}`,
		);
	}

	function recenter() {
		ref.current?.style.setProperty("--px", "0");
		ref.current?.style.setProperty("--py", "0");
	}

	return (
		<div
			ref={ref}
			role="img"
			aria-label={SCENE_LABEL}
			onPointerMove={aim}
			onPointerLeave={recenter}
			className={`${styles.scene} w-full select-none`}
		>
			<svg
				viewBox="0 0 800 500"
				className="w-full text-foreground"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden
			>
				<Layer depth={4}>
					<Skyline spinClass={styles.spin} />
				</Layer>
				<Layer depth={9}>
					<Yard spinClass={styles.spin} />
				</Layer>
				<Layer depth={14}>
					<RegeneratedTwin />
				</Layer>
				<Layer depth={22}>
					<Sloppy blinkClass={styles.blink} scanClass={styles.scan} />
				</Layer>
				<Layer depth={34}>
					<SlopYardForeground />
				</Layer>
			</svg>
		</div>
	);
}
