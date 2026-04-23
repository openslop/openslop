import React, { useMemo } from "react";
import {
	AbsoluteFill,
	Html5Audio,
	Img,
	OffthreadVideo,
	Sequence,
	Series,
} from "remotion";
import type {
	VideoLayout,
	Sequence as SeqType,
	ResolvedElement,
} from "@/lib/video/types";
const coverStyle: React.CSSProperties = {
	width: "100%",
	height: "100%",
	objectFit: "cover",
};

const blackBg: React.CSSProperties = { backgroundColor: "black" };

function toFrames(sec: number, fps: number): number {
	return Math.round(sec * fps);
}

function SequenceContent({ element }: { element: ResolvedElement }) {
	switch (element.layer) {
		case "visual":
			return element.type === "image" ? (
				<Img src={element.url} style={coverStyle} pauseWhenLoading />
			) : (
				<OffthreadVideo
					src={element.url}
					style={coverStyle}
					pauseWhenBuffering
				/>
			);
		case "audio":
			return <Html5Audio src={element.url} pauseWhenBuffering />;
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
}) => {
	const sequenceEntries = useMemo(() => Object.entries(sequences), [sequences]);

	return (
		<AbsoluteFill style={blackBg}>
			<Series>
				{series.map((seq, i) => (
					<Series.Sequence
						key={seq.element?.id ?? `empty-${i}`}
						durationInFrames={toFrames(seq.duration, fps)}
					>
						<SeriesEntry seq={seq} />
					</Series.Sequence>
				))}
			</Series>

			{sequenceEntries.map(([type, seqs]) =>
				seqs?.map((seq, i) =>
					seq.element ? (
						<Sequence
							key={`${type}-${seq.element.id}-${i}`}
							from={toFrames(seq.start, fps)}
							durationInFrames={toFrames(seq.duration, fps)}
							layout="none"
						>
							<SequenceContent element={seq.element} />
						</Sequence>
					) : null,
				),
			)}
		</AbsoluteFill>
	);
};
