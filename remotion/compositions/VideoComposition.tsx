import React, { Fragment, useMemo } from "react";
import {
	AbsoluteFill,
	Html5Audio,
	Img,
	interpolate,
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

const coverStyle: React.CSSProperties = {
	width: "100%",
	height: "100%",
	objectFit: "cover",
};

const blackBg: React.CSSProperties = { backgroundColor: "black" };

function toFrames(sec: number, fps: number): number {
	return Math.round(sec * fps);
}

function fadeVolume(durationInFrames: number, fadeFrames: number) {
	// Cap so the fade-in and fade-out windows don't overlap — interpolate()
	// requires a monotonically increasing input range and throws otherwise.
	const f = Math.min(fadeFrames, Math.floor(durationInFrames / 2));
	return (frame: number) =>
		interpolate(
			frame,
			[0, f, durationInFrames - f, durationInFrames],
			[0, 1, 1, 0],
			{ extrapolateLeft: "clamp", extrapolateRight: "clamp" },
		);
}

function AudioSequence({ element }: { element: ResolvedElement }) {
	const { durationInFrames, fps } = useVideoConfig();
	const fade = element.role === "background";
	return (
		<Html5Audio
			src={element.url}
			pauseWhenBuffering
			volume={
				fade ? fadeVolume(durationInFrames, toFrames(AUDIO_FADE_SEC, fps)) : 1
			}
		/>
	);
}

function SequenceContent({ element }: { element: ResolvedElement }) {
	switch (element.layer) {
		case "visual":
			return element.type === "image" ? (
				<Img src={element.url} style={coverStyle} />
			) : (
				<OffthreadVideo
					src={element.url}
					style={coverStyle}
					pauseWhenBuffering
				/>
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
	const sequenceEntries = useMemo(() => Object.entries(sequences), [sequences]);
	const transitionFrames = toFrames(transitionDurationSec, fps);
	const presentation = useMemo(
		() => getPresentation(transitionType, { width, height }),
		[transitionType, width, height],
	);

	return (
		<AbsoluteFill style={blackBg}>
			<TransitionSeries>
				{series.map((seq, i) => (
					<Fragment key={seq.element?.id ?? `empty-${i}`}>
						{i > 0 && (
							<TransitionSeries.Transition
								presentation={presentation}
								timing={linearTiming({ durationInFrames: transitionFrames })}
							/>
						)}
						<TransitionSeries.Sequence
							durationInFrames={toFrames(seq.duration, fps)}
						>
							<SeriesEntry seq={seq} />
						</TransitionSeries.Sequence>
					</Fragment>
				))}
			</TransitionSeries>

			{sequenceEntries.map(([type, seqs]) =>
				seqs?.map((seq, i) =>
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
			)}
		</AbsoluteFill>
	);
};
