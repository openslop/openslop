"use client";

import { useEffect, useRef } from "react";

// Smoothly translates a glow element toward the pointer. Honors reduced-motion
// by centering the glow instead of animating it.
function useCursorFollow() {
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			el.style.transform = "translate(calc(50vw - 50%), calc(50vh - 50%))";
			return;
		}

		let curX = window.innerWidth / 2;
		let curY = window.innerHeight / 3;
		let tx = curX;
		let ty = curY;
		let frame = 0;
		const onMove = (e: MouseEvent) => {
			tx = e.clientX;
			ty = e.clientY;
		};
		const animate = () => {
			curX += (tx - curX) / 16;
			curY += (ty - curY) / 16;
			el.style.transform = `translate(calc(${curX}px - 50%), calc(${curY}px - 50%))`;
			frame = requestAnimationFrame(animate);
		};
		window.addEventListener("mousemove", onMove, { passive: true });
		frame = requestAnimationFrame(animate);
		return () => {
			window.removeEventListener("mousemove", onMove);
			cancelAnimationFrame(frame);
		};
	}, []);
	return ref;
}

/**
 * Dark "studio at night" background (DESIGN.md): near-black with two restrained
 * violet corner glows, a faint cursor-following violet glow, and grain.
 */
export default function BackgroundGradientAnimation() {
	const glowRef = useCursorFollow();
	return (
		<div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-canvas">
			<div
				className="absolute inset-0"
				style={{
					backgroundImage:
						"radial-gradient(900px 520px at 82% -8%, color-mix(in srgb, var(--color-accent-violet) 12%, transparent), transparent 60%), radial-gradient(760px 520px at -8% 108%, color-mix(in srgb, var(--color-glow-violet) 22%, transparent), transparent 60%)",
				}}
			/>
			<div
				ref={glowRef}
				className="absolute left-0 top-0 h-[40rem] w-[40rem] rounded-full opacity-40 blur-3xl"
				style={{
					willChange: "transform",
					background:
						"radial-gradient(circle, color-mix(in srgb, var(--color-accent-violet) 10%, transparent) 0%, transparent 60%)",
				}}
			/>
			<div
				className="absolute inset-0 opacity-[0.15]"
				style={{
					backgroundImage: "url(/grain.png)",
					backgroundSize: "50px 50px",
				}}
			/>
		</div>
	);
}
