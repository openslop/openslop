"use client";

import {
	type MouseEvent,
	type Ref,
	useCallback,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toastError } from "@/lib/toastError";
import { clamp, cn } from "@/lib/utils";
import {
	AUDIO_SAMPLE_COUNT,
	SOUNDWAVE_MASK_STYLE,
	soundwaveMaskStyle,
	toBarHeights,
} from "./soundwave";
import { usePeaks } from "./usePeaks";

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
	const progressRef = useRef<HTMLDivElement>(null);
	const decode = usePeaks(src);
	const [audioSettledFor, setAudioSettledFor] = useState<string | null>(null);
	const loading = decode.status === "loading" || audioSettledFor !== src;

	const peaks = decode.status === "ready" ? decode.peaks : null;
	const maskStyle = useMemo(
		() =>
			peaks
				? soundwaveMaskStyle(toBarHeights(peaks, AUDIO_SAMPLE_COUNT))
				: SOUNDWAVE_MASK_STYLE,
		[peaks],
	);

	const setProgress = useCallback((progress: number) => {
		const el = progressRef.current;
		if (el)
			el.style.clipPath = `inset(0 ${(1 - clamp(progress, 0, 1)) * 100}% 0 0)`;
	}, []);

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
				className={cn("relative cursor-pointer", className)}
				onClick={handleClick}
			>
				<div
					className="absolute inset-0 bg-muted-foreground"
					style={maskStyle}
				/>
				<div
					ref={progressRef}
					className="absolute inset-0 bg-foreground"
					style={{ ...maskStyle, clipPath: "inset(0 100% 0 0)" }}
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
					setProgress(0);
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
