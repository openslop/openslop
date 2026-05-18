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
import { AUDIO_FADE_SEC, getPresentation } from "@/lib/video/transitions";
import { audioVolume } from "@/lib/video/audioVolume";
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
		<Html5Audio
			src={element.url}
			crossOrigin="anonymous"
			pauseWhenBuffering
			volume={volume}
		/>
	);
}

function SequenceContent({
	element,
	durationInFrames,
}: {
	element: ResolvedElement;
	durationInFrames: number;
}) {
	switch (element.layer) {
		case "visual":
			return (
				<MotionLayer
					effect={element.motion}
					durationInFrames={durationInFrames}
				>
					{element.type === "image" ? (
						<Img src={element.url} crossOrigin="anonymous" style={coverStyle} />
					) : (
						<OffthreadVideo
							src={element.url}
							style={coverStyle}
							pauseWhenBuffering
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

function SeriesEntry({
	seq,
	durationInFrames,
}: {
	seq: SeqType;
	durationInFrames: number;
}) {
	if (!seq.element) {
		return <AbsoluteFill style={blackBg} />;
	}
	return (
		<SequenceContent
			element={seq.element}
			durationInFrames={durationInFrames}
		/>
	);
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
			series.map((seq, i) => {
				const seqFrames = toFrames(seq.duration, fps);
				return (
					<Fragment key={seq.element?.id ?? `empty-${i}`}>
						{i > 0 && (
							<TransitionSeries.Transition
								presentation={presentation}
								timing={transitionTiming}
							/>
						)}
						<TransitionSeries.Sequence durationInFrames={seqFrames}>
							<SeriesEntry seq={seq} durationInFrames={seqFrames} />
						</TransitionSeries.Sequence>
					</Fragment>
				);
			}),
		[fps, presentation, series, transitionTiming],
	);
	const layeredSequenceNodes = useMemo(
		() =>
			Object.entries(sequences).flatMap(([type, seqs]) =>
				(seqs ?? []).map((seq, i) => {
					if (!seq.element) return null;
					const seqFrames = toFrames(seq.duration, fps);
					return (
						<Sequence
							key={`${type}-${seq.element.id}-${i}`}
							from={toFrames(seq.start, fps)}
							durationInFrames={seqFrames}
							premountFor={fps}
						>
							<SequenceContent
								element={seq.element}
								durationInFrames={seqFrames}
							/>
						</Sequence>
					);
				}),
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
