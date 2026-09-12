import React, { Fragment, useMemo } from "react";
import {
	AbsoluteFill,
	Html5Audio,
	Img,
	Loop,
	OffthreadVideo,
	Sequence,
	useVideoConfig,
} from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import type { RenderLayout, ResolvedElement } from "@/lib/render/types";
import { toFrames } from "@/lib/render/frames";
import {
	TRANSITION_DURATION_SEC,
	LAYER_PREMOUNT_SEC,
	FOREGROUND_PREMOUNT_SEC,
} from "@/lib/render/transitions";
import { audioEnvelopeFrames, audioFadeSec } from "@/lib/render/audioFade";
import { getPresentation } from "@/lib/render/transitionPresentations";
import { audioVolume } from "@/lib/render/audioVolume";
import { volumeToGain } from "@/lib/canvas/elementAttributes";
import { ELEMENT_TYPES } from "@/lib/canvas/types";
import { CaptionStyleProvider, Captions } from "../components/Captions";
import { MotionLayer } from "../components/MotionLayer";

const coverStyle: React.CSSProperties = {
	width: "100%",
	height: "100%",
	objectFit: "cover",
};

const blackBg: React.CSSProperties = { backgroundColor: "black" };

function AudioSequence({ element }: { element: ResolvedElement }) {
	const { durationInFrames, fps } = useVideoConfig();
	const gain = volumeToGain(element.volume);
	const fadeFrames = toFrames(audioFadeSec(element), fps);
	const envelopeFrames = audioEnvelopeFrames(element, durationInFrames, fps);
	const volume = useMemo(
		() => audioVolume(gain, envelopeFrames, fadeFrames),
		[gain, envelopeFrames, fadeFrames],
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

/** A looping video restarts each time it ends; a single pass holds its last frame for the rest of the scene. */
function VideoElementPlayer({ element }: { element: ResolvedElement }) {
	const { fps } = useVideoConfig();
	const video = (
		<OffthreadVideo
			src={element.url}
			style={coverStyle}
			volume={volumeToGain(element.volume)}
		/>
	);
	if (!element.loop) return video;
	return (
		<Loop
			durationInFrames={Math.max(1, toFrames(element.durationSec, fps))}
			layout="none"
		>
			{video}
		</Loop>
	);
}

function SequenceContent({ element }: { element: ResolvedElement }) {
	switch (element.layer) {
		case "visual":
			return (
				<MotionLayer effect={element.motion}>
					{ELEMENT_TYPES[element.type].outputKind === "image" ? (
						<Img src={element.url} crossOrigin="anonymous" style={coverStyle} />
					) : (
						<VideoElementPlayer element={element} />
					)}
				</MotionLayer>
			);
		case "audio":
			return <AudioSequence element={element} />;
	}
}

export const VideoComposition: React.FC<RenderLayout> = ({
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
				<Fragment key={seq.element.id}>
					{i > 0 && (
						<TransitionSeries.Transition
							presentation={presentation}
							timing={transitionTiming}
						/>
					)}
					<TransitionSeries.Sequence
						durationInFrames={toFrames(seq.duration, fps)}
						premountFor={toFrames(FOREGROUND_PREMOUNT_SEC, fps)}
					>
						<SequenceContent element={seq.element} />
					</TransitionSeries.Sequence>
				</Fragment>
			)),
		[fps, presentation, series, transitionTiming],
	);
	const layeredSequenceNodes = useMemo(
		() =>
			Object.entries(sequences).flatMap(([type, seqs]) =>
				(seqs ?? []).map((seq, i) => (
					<Sequence
						key={`${type}-${seq.element.id}-${i}`}
						from={toFrames(seq.start, fps)}
						durationInFrames={toFrames(seq.duration, fps)}
						premountFor={toFrames(LAYER_PREMOUNT_SEC, fps)}
					>
						<SequenceContent element={seq.element} />
					</Sequence>
				)),
			),
		[fps, sequences],
	);

	return (
		<CaptionStyleProvider value={captionStyle}>
			<AbsoluteFill style={blackBg}>
				<TransitionSeries>{transitionSeriesNodes}</TransitionSeries>
				{layeredSequenceNodes}
			</AbsoluteFill>
		</CaptionStyleProvider>
	);
};
