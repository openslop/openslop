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
import type { CaptionStyle } from "@/lib/video/captionStyle";
import { toFrames } from "@/lib/video/frames";
import {
	AUDIO_FADE_SEC,
	TRANSITION_DURATION_SEC,
	VIDEO_PREMOUNT_SEC,
} from "@/lib/video/transitions";
import { getPresentation } from "@/lib/video/transitionPresentations";
import { audioVolume } from "@/lib/video/audioVolume";
import { volumeToGain } from "@/lib/video/elementAttributes";
import { ELEMENT_TYPES } from "@/lib/canvas/types";
import { Captions } from "../components/Captions";
import { MotionLayer } from "../components/MotionLayer";

const coverStyle: React.CSSProperties = {
	width: "100%",
	height: "100%",
	objectFit: "cover",
};

const blackBg: React.CSSProperties = { backgroundColor: "black" };

function AudioSequence({
	element,
	captionStyle,
}: {
	element: ResolvedElement;
	captionStyle: CaptionStyle;
}) {
	const { durationInFrames, fps } = useVideoConfig();
	const gain = volumeToGain(element.volume);
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
					<Captions
						timestamps={element.captionTimestamps}
						style={captionStyle}
					/>
				</Sequence>
			)}
		</>
	);
}

function SequenceContent({
	element,
	captionStyle,
}: {
	element: ResolvedElement;
	captionStyle: CaptionStyle;
}) {
	switch (element.layer) {
		case "visual":
			return (
				<MotionLayer effect={element.motion}>
					{ELEMENT_TYPES[element.type].outputKind === "image" ? (
						<Img src={element.url} crossOrigin="anonymous" style={coverStyle} />
					) : (
						<OffthreadVideo
							src={element.url}
							style={coverStyle}
							volume={volumeToGain(element.volume)}
						/>
					)}
				</MotionLayer>
			);
		case "audio":
			return <AudioSequence element={element} captionStyle={captionStyle} />;
		default:
			return null;
	}
}

function SeriesEntry({
	seq,
	captionStyle,
}: {
	seq: SeqType;
	captionStyle: CaptionStyle;
}) {
	if (!seq.element) {
		return <AbsoluteFill style={blackBg} />;
	}
	return <SequenceContent element={seq.element} captionStyle={captionStyle} />;
}

export const VideoComposition: React.FC<VideoLayout> = ({
	series,
	sequences,
	fps,
	width,
	height,
	transitionType,
	transitionDurationSec,
	captionStyle,
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
						<SeriesEntry seq={seq} captionStyle={captionStyle} />
					</TransitionSeries.Sequence>
				</Fragment>
			)),
		[captionStyle, fps, presentation, series, transitionTiming],
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
							<SequenceContent
								element={seq.element}
								captionStyle={captionStyle}
							/>
						</Sequence>
					) : null,
				),
			),
		[captionStyle, fps, sequences],
	);

	return (
		<AbsoluteFill style={blackBg}>
			<TransitionSeries>{transitionSeriesNodes}</TransitionSeries>
			{layeredSequenceNodes}
		</AbsoluteFill>
	);
};
