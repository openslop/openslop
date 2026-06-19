"use client";

import {
	type CSSProperties,
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
import { AUDIO_BAR_COUNT, buildSoundwaveMask } from "./soundwave";

export interface WaveformProps {
	src: string;
	peaksCache?: Map<string, number[]>;
	className?: string;
	onReady?: () => void;
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

const PEAK_COUNT = 200;
const MIN_BAR_HEIGHT = 6;

const MASK_STYLE: CSSProperties = {
	maskSize: "100% 100%",
	WebkitMaskSize: "100% 100%",
	maskRepeat: "no-repeat",
	WebkitMaskRepeat: "no-repeat",
};

let sharedAudioCtx: AudioContext | null = null;
const getAudioCtx = () => {
	if (!sharedAudioCtx) sharedAudioCtx = new AudioContext();
	return sharedAudioCtx;
};

/** Extract normalized peak amplitudes (0–1) from raw audio samples. */
export function extractPeaks(data: Float32Array, count: number): number[] {
	const step = Math.floor(data.length / count);
	if (step === 0) return [];
	const peaks: number[] = [];
	let max = 0;
	for (let i = 0; i < count; i++) {
		let peak = 0;
		const offset = i * step;
		for (let j = 0; j < step; j++) {
			const v = Math.abs(data[offset + j]);
			if (v > peak) peak = v;
		}
		peaks.push(peak);
		if (peak > max) max = peak;
	}
	return max > 0 ? peaks.map((p) => p / max) : peaks;
}

export function Waveform({
	src,
	peaksCache,
	className,
	ref,
	onReady,
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
	const [metadataReadyFor, setMetadataReadyFor] = useState<string | null>(null);
	const loading = loadedSrc !== src || metadataReadyFor !== src;

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
		const bars = Array.from({ length: AUDIO_BAR_COUNT }, (_, i) =>
			Math.max(
				MIN_BAR_HEIGHT,
				peaks[Math.floor((i * peaks.length) / AUDIO_BAR_COUNT)] * 100,
			),
		);
		const mask = buildSoundwaveMask(bars);
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
			onReady?.();
			return;
		}
		peaksRef.current = [];

		let cancelled = false;
		fetch(src, { mode: "cors" })
			.then((r) => r.arrayBuffer())
			.then((buf) => getAudioCtx().decodeAudioData(buf))
			.then((ab) => {
				if (cancelled) return;
				const peaks = extractPeaks(ab.getChannelData(0), PEAK_COUNT);
				peaksCache?.set(src, peaks);
				peaksRef.current = peaks;
				paint();
				setLoadedSrc(src);
				onReady?.();
			})
			.catch((e) => {
				console.error("Failed to decode audio:", e);
				if (!cancelled) setLoadedSrc(src);
			});
		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps -- onReady/peaksCache are stable refs, not direct deps
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
					style={MASK_STYLE}
				/>
				<div
					ref={progressRef}
					className="absolute inset-0 bg-foreground"
					style={{ ...MASK_STYLE, clipPath: "inset(0 100% 0 0)" }}
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
						setMetadataReadyFor(src);
					}
					onTimeUpdate?.(0, a.duration || 0);
				}}
				onPlay={onPlay}
				onPause={onPause}
				onEnded={onFinish}
			/>
		</>
	);
}
