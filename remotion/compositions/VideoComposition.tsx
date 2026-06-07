import React, { Fragment, useMemo } from "react";
import {
	AbsoluteFill,
	Html5Audio,
	Img,
	OffthreadVideo,
	Sequence,
	useVideoConfig,
} from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import type {
	VideoLayout,
	Sequence as SeqType,
	ResolvedElement,
} from "@/lib/video/types";
import {
	AUDIO_FADE_SEC,
	TRANSITION_DURATION_SEC,
	VIDEO_PREMOUNT_SEC,
	getPresentation,
} from "@/lib/video/transitions";
import { audioVolume } from "@/lib/video/audioVolume";
import { Captions } from "../components/Captions";
import { MotionLayer } from "../components/MotionLayer";

const coverStyle: React.CSSProperties = {
	width: "100%",
	height: "100%",
	objectFit: "cover",
};

const blackBg: React.CSSProperties = { backgroundColor: "black" };

function toFrames(sec: number, fps: number): number {
	return Math.round(sec * fps);
}

function AudioSequence({ element }: { element: ResolvedElement }) {
	const { durationInFrames, fps } = useVideoConfig();
	const gain = element.volume / 10;
	const hasFadeEnvelope = element.role === "background";
	const fadeFrames = hasFadeEnvelope ? toFrames(AUDIO_FADE_SEC, fps) : 0;
	const volume = useMemo(
		() => audioVolume(gain, durationInFrames, fadeFrames),
		[gain, durationInFrames, fadeFrames],
	);
	return (
		<>
			<Html5Audio src={element.url} crossOrigin="anonymous" volume={volume} />
			{element.captionTimestamps && (
				<Sequence
					durationInFrames={Math.max(
						1,
						durationInFrames - toFrames(TRANSITION_DURATION_SEC, fps),
					)}
				>
					<Captions timestamps={element.captionTimestamps} />
				</Sequence>
			)}
		</>
	);
}

function SequenceContent({ element }: { element: ResolvedElement }) {
	switch (element.layer) {
		case "visual":
			return (
				<MotionLayer effect={element.motion}>
					{element.type === "image" ? (
						<Img src={element.url} crossOrigin="anonymous" style={coverStyle} />
					) : (
						<OffthreadVideo
							src={element.url}
							style={coverStyle}
							volume={element.volume / 10}
						/>
					)}
				</MotionLayer>
			);
		case "audio":
			return <AudioSequence element={element} />;
		default:
			return null;
	}
}

function SeriesEntry({ seq }: { seq: SeqType }) {
	if (!seq.element) {
		return <AbsoluteFill style={blackBg} />;
	}
	return <SequenceContent element={seq.element} />;
}

export const VideoComposition: React.FC<VideoLayout> = ({
	series,
	sequences,
	fps,
	width,
	height,
	transitionType,
	transitionDurationSec,
}) => {
	const transitionFrames = toFrames(transitionDurationSec, fps);
	const transitionTiming = useMemo(
		() => linearTiming({ durationInFrames: transitionFrames }),
		[transitionFrames],
	);
	const presentation = useMemo(
		() => getPresentation(transitionType, { width, height }),
		[transitionType, width, height],
	);
	const transitionSeriesNodes = useMemo(
		() =>
			series.map((seq, i) => (
				<Fragment key={seq.element?.id ?? `empty-${i}`}>
					{i > 0 && (
						<TransitionSeries.Transition
							presentation={presentation}
							timing={transitionTiming}
						/>
					)}
					<TransitionSeries.Sequence
						durationInFrames={toFrames(seq.duration, fps)}
						premountFor={toFrames(VIDEO_PREMOUNT_SEC, fps)}
					>
						<SeriesEntry seq={seq} />
					</TransitionSeries.Sequence>
				</Fragment>
			)),
		[fps, presentation, series, transitionTiming],
	);
	const layeredSequenceNodes = useMemo(
		() =>
			Object.entries(sequences).flatMap(([type, seqs]) =>
				(seqs ?? []).map((seq, i) =>
					seq.element ? (
						<Sequence
							key={`${type}-${seq.element.id}-${i}`}
							from={toFrames(seq.start, fps)}
							durationInFrames={toFrames(seq.duration, fps)}
							premountFor={fps}
						>
							<SequenceContent element={seq.element} />
						</Sequence>
					) : null,
				),
			),
		[fps, sequences],
	);

	return (
		<AbsoluteFill style={blackBg}>
			<TransitionSeries>{transitionSeriesNodes}</TransitionSeries>
			{layeredSequenceNodes}
		</AbsoluteFill>
	);
};
