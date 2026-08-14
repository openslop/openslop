"use client";

import {
	type MouseEvent,
	type Ref,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { clamp, cn } from "@/lib/utils";
import { loadPeaks } from "./peaks";
import {
	AUDIO_SAMPLE_COUNT,
	buildSoundwaveMask,
	SOUNDWAVE_MASK_STYLE,
	toBarHeights,
} from "./soundwave";

export interface WaveformProps {
	src: string;
	peaksCache?: Map<string, number[]>;
	className?: string;
	onPlay?: () => void;
	onPause?: () => void;
	onTimeUpdate?: (time: number, duration: number) => void;
	onFinish?: () => void;
}

export interface WaveformHandle {
	play(): void;
	pause(): void;
	toggle(): void;
	seek(progress: number): void;
}

export function Waveform({
	src,
	peaksCache,
	className,
	ref,
	onPlay,
	onPause,
	onTimeUpdate,
	onFinish,
}: WaveformProps & { ref?: Ref<WaveformHandle> }) {
	const audioRef = useRef<HTMLAudioElement>(null);
	const barsRef = useRef<HTMLDivElement>(null);
	const progressRef = useRef<HTMLDivElement>(null);
	const peaksRef = useRef<number[]>([]);
	const [loadedSrc, setLoadedSrc] = useState<string | null>(() =>
		peaksCache?.has(src) ? src : null,
	);
	const [audioSettledFor, setAudioSettledFor] = useState<string | null>(null);
	const loading = loadedSrc !== src || audioSettledFor !== src;

	// Adjust state during render when src changes to a cached value
	// (React-supported pattern for deriving state from props)
	if (loadedSrc !== src && peaksCache?.has(src)) {
		setLoadedSrc(src);
	}

	const setProgress = useCallback((progress: number) => {
		const el = progressRef.current;
		if (el)
			el.style.clipPath = `inset(0 ${(1 - clamp(progress, 0, 1)) * 100}% 0 0)`;
	}, []);

	const paint = useCallback(() => {
		const peaks = peaksRef.current;
		if (!peaks.length) return;
		const mask = buildSoundwaveMask(toBarHeights(peaks, AUDIO_SAMPLE_COUNT));
		for (const el of [barsRef.current, progressRef.current]) {
			if (!el) continue;
			el.style.setProperty("mask-image", mask);
			el.style.setProperty("-webkit-mask-image", mask);
		}
		setProgress(0);
	}, [setProgress]);

	useEffect(() => {
		const cached = peaksCache?.get(src);
		if (cached) {
			peaksRef.current = cached;
			paint();
			return;
		}
		peaksRef.current = [];

		let cancelled = false;
		loadPeaks(src)
			.then((peaks) => {
				if (cancelled) return;
				peaksCache?.set(src, peaks);
				peaksRef.current = peaks;
				paint();
			})
			.catch((e) => console.error("Failed to decode audio:", e))
			.finally(() => {
				if (!cancelled) setLoadedSrc(src);
			});
		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps -- peaksCache is a stable ref, not a direct dep
	}, [src]);

	useImperativeHandle(
		ref,
		() => ({
			play() {
				audioRef.current?.play();
			},
			pause() {
				audioRef.current?.pause();
			},
			toggle() {
				const a = audioRef.current;
				if (a) {
					if (a.paused) a.play();
					else a.pause();
				}
			},
			seek(progress: number) {
				const a = audioRef.current;
				if (a?.duration) {
					a.currentTime = clamp(progress, 0, 1) * a.duration;
					setProgress(progress);
				}
			},
		}),
		[setProgress],
	);

	const handleClick = (e: MouseEvent<HTMLDivElement>) => {
		const a = audioRef.current;
		if (!a?.duration) return;
		const rect = e.currentTarget.getBoundingClientRect();
		const progress = (e.clientX - rect.left) / rect.width;
		a.currentTime = clamp(progress, 0, 1) * a.duration;
		setProgress(progress);
	};

	return (
		<>
			<div
				className={cn("relative cursor-pointer", className)}
				onClick={handleClick}
			>
				<div
					ref={barsRef}
					className="absolute inset-0 bg-muted-foreground"
					style={SOUNDWAVE_MASK_STYLE}
				/>
				<div
					ref={progressRef}
					className="absolute inset-0 bg-foreground"
					style={{ ...SOUNDWAVE_MASK_STYLE, clipPath: "inset(0 100% 0 0)" }}
				/>
				{loading && (
					<Skeleton className="absolute inset-0 animate-none shimmer-surface" />
				)}
			</div>
			<audio
				ref={audioRef}
				src={src}
				crossOrigin="anonymous"
				preload="metadata"
				hidden
				onTimeUpdate={() => {
					const a = audioRef.current;
					if (!a) return;
					setProgress(a.duration ? a.currentTime / a.duration : 0);
					onTimeUpdate?.(a.currentTime, a.duration || 0);
				}}
				onLoadedMetadata={() => {
					const a = audioRef.current;
					if (!a) return;
					if (Number.isFinite(a.duration) && a.duration > 0) {
						setAudioSettledFor(src);
					}
					onTimeUpdate?.(0, a.duration || 0);
				}}
				onError={() => setAudioSettledFor(src)}
				onPlay={onPlay}
				onPause={onPause}
				onEnded={onFinish}
			/>
		</>
	);
}
