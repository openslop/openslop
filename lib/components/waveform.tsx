"use client";

import {
	type KeyboardEvent,
	type MouseEvent,
	type Ref,
	useCallback,
	useEffect,
	useEffectEvent,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toastError } from "@/lib/toast-error";
import { clamp, cn } from "@/lib/utils";
import { seekKeyStep, sliderKeyTarget } from "./slider-keys";
import {
	AUDIO_SAMPLE_COUNT,
	soundwaveMaskStyle,
	toBarHeights,
} from "./soundwave";
import { useMediaSettled } from "./use-media-settled";
import { usePeaks } from "./use-peaks";

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
	const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
	const [progress, setProgress] = useState(0);
	const decode = usePeaks(src);
	const audioSettled = useMediaSettled(audio);
	const loading = decode.status === "loading" || !audioSettled;

	const maskStyle = useMemo(
		() =>
			soundwaveMaskStyle(
				toBarHeights(
					decode.status === "ready" ? decode.peaks : [],
					AUDIO_SAMPLE_COUNT,
				),
			),
		[decode],
	);

	const handle = useMemo<WaveformHandle>(
		() => ({
			play() {
				const audio = audioRef.current;
				if (audio) startPlayback(audio);
			},
			pause() {
				audioRef.current?.pause();
			},
			toggle() {
				const audio = audioRef.current;
				if (!audio) return;
				if (audio.paused) startPlayback(audio);
				else audio.pause();
			},
			seek(progress: number) {
				const audio = audioRef.current;
				if (!audio?.duration) return;
				const ratio = clamp(progress, 0, 1);
				audio.currentTime = ratio * audio.duration;
				setProgress(ratio);
			},
		}),
		[],
	);
	useImperativeHandle(ref, () => handle, [handle]);

	const attachAudio = useCallback((element: HTMLAudioElement | null) => {
		audioRef.current = element;
		setAudio(element);
	}, []);

	const reportLoaded = useEffectEvent((duration: number) => {
		onTimeUpdate?.(0, duration);
	});
	useEffect(() => {
		if (audio && audioSettled) reportLoaded(audio.duration || 0);
	}, [audio, audioSettled]);

	const handleClick = (event: MouseEvent<HTMLDivElement>) => {
		const rect = event.currentTarget.getBoundingClientRect();
		handle.seek((event.clientX - rect.left) / rect.width);
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		const duration = audioRef.current?.duration;
		if (!duration) return;
		const target = sliderKeyTarget(event.key, progress, seekKeyStep(duration));
		if (target === null) return;
		event.preventDefault();
		handle.seek(target);
	};

	return (
		<>
			<div
				role="slider"
				tabIndex={loading ? -1 : 0}
				aria-label="Seek"
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={Math.round(progress * 100)}
				aria-disabled={loading || undefined}
				className={cn(
					"relative cursor-pointer rounded-md focus-ring",
					className,
				)}
				onClick={handleClick}
				onKeyDown={loading ? undefined : handleKeyDown}
			>
				<div
					className="absolute inset-0 bg-muted-foreground"
					style={maskStyle}
				/>
				<div
					className="absolute inset-0 bg-foreground"
					style={{
						...maskStyle,
						clipPath: `inset(0 ${(1 - progress) * 100}% 0 0)`,
					}}
				/>
				{loading && <Skeleton className="absolute inset-0" />}
			</div>
			<audio
				ref={attachAudio}
				src={src}
				crossOrigin="anonymous"
				preload="metadata"
				hidden
				onTimeUpdate={(event) => {
					const audio = event.currentTarget;
					setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
					onTimeUpdate?.(audio.currentTime, audio.duration || 0);
				}}
				onPlay={onPlay}
				onPause={onPause}
				onEnded={onFinish}
			/>
		</>
	);
}
