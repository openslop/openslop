import React, { Fragment, useMemo } from "react";
import { Audio } from "@remotion/media";
import {
	AbsoluteFill,
	Freeze,
	Loop,
	OffthreadVideo,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
} from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import type { RenderLayout, ResolvedElement } from "@/lib/render/types";
import { layoutCaptions } from "@/lib/render/caption-rule";
import { toFrames } from "@/lib/render/frames";
import { totalDuration } from "@/lib/render/sequences";
import {
	LAYER_PREMOUNT_SEC,
	FOREGROUND_PREMOUNT_SEC,
} from "@/lib/render/transitions";
import { audioFadeSec } from "@/lib/render/audio-fade";
import { getPresentation } from "@/lib/render/transition-presentations";
import { audioVolume } from "@/lib/render/audio-volume";
import { volumeToGain } from "@/lib/canvas/element-attributes";
import { CONTENT_TYPES } from "@/lib/canvas/types";
import { Captions } from "../components/captions";
import { FilmGrain } from "../components/film-grain";
import { FrameImage } from "../components/frame-image";
import { MotionLayer } from "../components/motion-layer";
import { RgbSplit } from "../components/rgb-split";

const coverStyle: React.CSSProperties = {
	width: "100%",
	height: "100%",
	objectFit: "cover",
};

const blackBg: React.CSSProperties = { backgroundColor: "black" };

const fallbackHtml5AudioProps = { crossOrigin: "anonymous" } as const;

function AudioSequence({ element }: { element: ResolvedElement }) {
	const { durationInFrames, fps } = useVideoConfig();
	const gain = volumeToGain(element.volume);
	const fadeFrames = toFrames(audioFadeSec(element), fps);
	const volume = useMemo(
		() => audioVolume(gain, durationInFrames, fadeFrames),
		[gain, durationInFrames, fadeFrames],
	);
	return (
		<Audio
			src={element.url}
			trimBefore={toFrames(element.trimStartSec, fps)}
			volume={volume}
			fallbackHtml5AudioProps={fallbackHtml5AudioProps}
		/>
	);
}

/** A looping video restarts at its out-point; a single pass freezes on its last frame, silent, for the rest of the scene. */
function VideoElementPlayer({ element }: { element: ResolvedElement }) {
	const { fps } = useVideoConfig();
	const frame = useCurrentFrame();
	const playFrames = Math.max(1, toFrames(element.trimDurationSec, fps));
	const frozen = !element.loop && frame >= playFrames;
	const video = (
		<OffthreadVideo
			src={element.url}
			trimBefore={toFrames(element.trimStartSec, fps)}
			style={coverStyle}
			volume={volumeToGain(element.volume)}
			muted={frozen}
		/>
	);
	if (element.loop)
		return (
			<Loop durationInFrames={playFrames} layout="none">
				{video}
			</Loop>
		);
	return (
		<Freeze frame={playFrames - 1} active={frozen}>
			{video}
		</Freeze>
	);
}

function SequenceContent({ element }: { element: ResolvedElement }) {
	switch (element.layer) {
		case "visual":
			return (
				<MotionLayer effect={element.motion}>
					{CONTENT_TYPES[element.type].outputKind === "image" ? (
						<FrameImage src={element.url} style={coverStyle} />
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
	captions,
	captionStyle,
	filmGrain,
	rgbSplit,
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
			series.map(({ element, ...slot }, index) => (
				<Fragment key={element.id}>
					{index > 0 && transitionFrames > 0 && (
						<TransitionSeries.Transition
							presentation={presentation}
							timing={transitionTiming}
						/>
					)}
					<TransitionSeries.Sequence
						durationInFrames={toFrames(totalDuration(slot), fps)}
						premountFor={toFrames(FOREGROUND_PREMOUNT_SEC, fps)}
					>
						<SequenceContent element={element} />
					</TransitionSeries.Sequence>
				</Fragment>
			)),
		[fps, presentation, series, transitionFrames, transitionTiming],
	);
	const layeredSequenceNodes = useMemo(
		() =>
			Object.entries(sequences).flatMap(([type, sequencesOfType]) =>
				(sequencesOfType ?? []).map(({ element, start, ...slot }, index) => (
					<Sequence
						key={`${type}-${element.id}-${index}`}
						from={toFrames(start, fps)}
						durationInFrames={toFrames(totalDuration(slot), fps)}
						premountFor={toFrames(LAYER_PREMOUNT_SEC, fps)}
					>
						<SequenceContent element={element} />
					</Sequence>
				)),
			),
		[fps, sequences],
	);

	const captionLines = useMemo(
		() => layoutCaptions({ series, sequences, captions, captionStyle }),
		[series, sequences, captions, captionStyle],
	);

	return (
		<AbsoluteFill style={blackBg}>
			<RgbSplit enabled={rgbSplit}>
				<TransitionSeries>{transitionSeriesNodes}</TransitionSeries>
				{layeredSequenceNodes}
				<Captions captions={captionLines} style={captionStyle} />
			</RgbSplit>
			{filmGrain && <FilmGrain />}
		</AbsoluteFill>
	);
};
