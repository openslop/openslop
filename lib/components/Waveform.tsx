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
import { toastError } from "@/lib/toastError";
import { clamp, cn } from "@/lib/utils";
import { loadPeaks } from "./peaks";
import { useNearViewport } from "./useNearViewport";
import {
	AUDIO_SAMPLE_COUNT,
	buildSoundwaveMask,
	SOUNDWAVE_MASK_STYLE,
	toBarHeights,
} from "./soundwave";

export interface WaveformProps {
	src: string;
	className?: string;
	onPlay?: () => void;
	onPause?: () => void;
	onTimeUpdate?: (time: number, duration: number) => void;
	onFinish?: () => void;
}

/** A play cut short by a pause is normal use, not a failure worth surfacing. */
function startPlayback(audio: HTMLAudioElement): void {
	audio.play().catch((error: unknown) => {
		if (error instanceof DOMException && error.name === "AbortError") return;
		toastError(error, "Could not play audio");
	});
}

export interface WaveformHandle {
	play(): void;
	pause(): void;
	toggle(): void;
	seek(progress: number): void;
}

export function Waveform({
	src,
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
	const { ref: trackRef, near } = useNearViewport<HTMLDivElement>();
	const [peaksSettledFor, setPeaksSettledFor] = useState<string | null>(null);
	const [audioSettledFor, setAudioSettledFor] = useState<string | null>(null);
	const loading = peaksSettledFor !== src || audioSettledFor !== src;

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
		peaksRef.current = [];
		if (!near) return;

		let cancelled = false;
		loadPeaks(src)
			.then((peaks) => {
				if (cancelled) return;
				peaksRef.current = peaks;
				paint();
			})
			.catch((e) => console.error("Failed to decode audio:", e))
			.finally(() => {
				if (!cancelled) setPeaksSettledFor(src);
			});
		return () => {
			cancelled = true;
		};
	}, [src, paint, near]);

	useImperativeHandle(
		ref,
		() => ({
			play() {
				const a = audioRef.current;
				if (a) startPlayback(a);
			},
			pause() {
				audioRef.current?.pause();
			},
			toggle() {
				const a = audioRef.current;
				if (a) {
					if (a.paused) startPlayback(a);
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
				ref={trackRef}
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
