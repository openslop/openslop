"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useBackgroundTheme } from "@/lib/theme/backgroundTheme";

const emptySubscribe = () => () => {};

// Shared cursor-follow: smoothly translates an element toward the pointer.
function useCursorFollow() {
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

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
 * violet/purple corner glows, a faint cursor-following violet glow, and grain.
 */
function DarkStudioBackground() {
	const glowRef = useCursorFollow();
	return (
		<div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#0a0a0a]">
			<div
				className="absolute inset-0"
				style={{
					backgroundImage:
						"radial-gradient(900px 520px at 82% -8%, rgba(139,92,246,0.12), transparent 60%), radial-gradient(760px 520px at -8% 108%, rgba(55,30,100,0.22), transparent 60%)",
				}}
			/>
			<div
				ref={glowRef}
				className="absolute left-0 top-0 h-[40rem] w-[40rem] rounded-full opacity-40 blur-3xl"
				style={{
					willChange: "transform",
					background:
						"radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 60%)",
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

/**
 * The original bright purple-to-blue animated gradient with goo blobs, kept as
 * an opt-in background theme.
 */
function PurpleBackground() {
	const interactiveRef = useCursorFollow();
	return (
		<div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
			<div
				className="absolute inset-0"
				style={{
					background:
						"linear-gradient(135deg, rgb(108, 0, 162) 0%, rgb(0, 17, 82) 100%)",
				}}
			/>
			<svg className="hidden" aria-hidden="true">
				<filter id="blurMe">
					<feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
					<feColorMatrix
						in="blur"
						mode="matrix"
						values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
						result="goo"
					/>
					<feBlend in="SourceGraphic" in2="goo" />
				</filter>
			</svg>
			<div
				className="absolute inset-0"
				style={{ filter: "url(#blurMe) blur(40px)" }}
			>
				<div
					className="absolute h-[80%] w-[80%] top-[calc(50%-40%)] left-[calc(50%-40%)] animate-first opacity-70"
					style={{
						background:
							"radial-gradient(circle at center, rgb(75, 134, 206) 0%, transparent 50%)",
						mixBlendMode: "hard-light",
					}}
				/>
				<div
					className="absolute h-[90%] w-[90%] top-[calc(50%-45%)] left-[calc(50%-45%)] opacity-70"
					style={{
						background:
							"radial-gradient(circle at center, rgb(178, 74, 230) 0%, transparent 50%)",
						mixBlendMode: "hard-light",
					}}
				/>
				<div
					className="absolute h-[80%] w-[80%] top-[calc(50%-40%)] left-[calc(50%-40%)] animate-fourth opacity-70"
					style={{
						background:
							"radial-gradient(circle at center, rgb(155, 48, 128) 0%, transparent 50%)",
						mixBlendMode: "hard-light",
					}}
				/>
				<div
					ref={interactiveRef}
					className="absolute left-0 top-0 z-30 h-[100vmin] w-[100vmin] rounded-full opacity-50 blur-[60px]"
					style={{
						willChange: "transform",
						background:
							"radial-gradient(circle at center, rgba(40,152,244,0.9) 0%, transparent 75%)",
						mixBlendMode: "hard-light",
					}}
				/>
			</div>
		</div>
	);
}

export default function BackgroundGradientAnimation() {
	const theme = useBackgroundTheme((s) => s.theme);
	// Render the default (dark) during SSR and the first hydration pass to avoid
	// a mismatch, then honor the persisted preference. useSyncExternalStore
	// returns the server snapshot (false) until hydration completes.
	const hydrated = useSyncExternalStore(
		emptySubscribe,
		() => true,
		() => false,
	);

	return hydrated && theme === "purple" ? (
		<PurpleBackground />
	) : (
		<DarkStudioBackground />
	);
}
