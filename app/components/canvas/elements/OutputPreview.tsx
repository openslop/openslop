import { memo, useState } from "react";
import { X as XIcon, AlertCircle } from "lucide-react";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";
import { AudioPlayer } from "./AudioPlayer";
import { CharacterBadge } from "./CharacterBadge";
import { MediaWithSkeleton } from "./MediaWithSkeleton";
import { GenerationIndicator } from "./GenerationIndicator";
import type { CanvasContentElement, CanvasElementType } from "../types";
import type { ElementSnapshot } from "@/lib/generation/queue";
import { ELEMENT_CONFIGS } from "../config/elementConfigs";
import { useGenerate } from "../hooks/useGenerate";
import loaderStyles from "./OutputPreview.module.css";

interface PlaceholderBall {
	color: string;
	size: string;
	duration: string;
	x: string;
	y: string;
}

const PLACEHOLDER_BALLS: PlaceholderBall[] = [
	{ color: "#cab3d6", size: "14px", duration: "4.2s", x: "40px", y: "-100px" },
	{ color: "#f5aa64", size: "16px", duration: "5.8s", x: "-50px", y: "280px" },
	{ color: "#f58c02", size: "10px", duration: "7.3s", x: "90px", y: "220px" },
	{ color: "#94c9e9", size: "18px", duration: "6.4s", x: "-75px", y: "-70px" },
	{ color: "#eeaeca", size: "20px", duration: "10s", x: "25px", y: "120px" },
	{ color: "#f57802", size: "12px", duration: "3.7s", x: "-40px", y: "190px" },
	{ color: "#cab3d6", size: "11px", duration: "2.6s", x: "75px", y: "-150px" },
	{ color: "#f5aa64", size: "17px", duration: "6.9s", x: "-25px", y: "140px" },
	{ color: "#f55702", size: "13px", duration: "5.3s", x: "60px", y: "-220px" },
	{ color: "#94c9e9", size: "19px", duration: "7.7s", x: "-90px", y: "240px" },
	{ color: "#5eaebf", size: "16px", duration: "6.3s", x: "85px", y: "-180px" },
];

type GenerationState = {
	status: ElementSnapshot["status"];
	seconds: number;
};

function deriveStatus(
	generating: boolean,
	queued: boolean,
): ElementSnapshot["status"] {
	if (queued) return "queued";
	if (generating) return "generating";
	return "idle";
}

function OverlayButton({
	onClick,
	label,
	className = "top-2",
	children,
}: {
	onClick: () => void;
	label: string;
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					aria-label={label}
					className={`absolute right-2 z-10 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity ${className}`}
					onClick={onClick}
				>
					{children}
				</button>
			</TooltipTrigger>
			<TooltipContent>{label}</TooltipContent>
		</Tooltip>
	);
}

function CancelButton({
	onClick,
	className = "top-2",
}: {
	onClick: () => void;
	className?: string;
}) {
	return (
		<OverlayButton
			onClick={onClick}
			label="Cancel generation"
			className={className}
		>
			<XIcon className="w-3 h-3 text-white" />
		</OverlayButton>
	);
}

export function StaleIndicator({ onClick }: { onClick: () => void }) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					className="absolute bottom-2 right-2 z-10 flex items-center gap-1 rounded-full bg-amber-500/80 px-2 py-1 text-[10px] font-medium text-white transition-opacity hover:bg-amber-500"
					onClick={onClick}
				>
					<AlertCircle className="w-3 h-3" />
					Stale
				</button>
			</TooltipTrigger>
			<TooltipContent>Prompt changed — click to regenerate</TooltipContent>
		</Tooltip>
	);
}

function ResultOverlay({
	status,
	seconds,
	onRegenerate,
}: GenerationState & {
	onRegenerate: () => void;
}) {
	return (
		<GenerationIndicator
			status={status}
			seconds={seconds}
			idleLabel="Regenerate"
			onClick={onRegenerate}
			className="absolute top-2 left-2 z-10"
		/>
	);
}

const AUDIO_BAR_COUNT = 60;
const BAR_W = 100 / AUDIO_BAR_COUNT;
const BAR_GAP = BAR_W * 0.3;

function buildSoundwaveMask(bars: number[]) {
	const rects = bars
		.map(
			(h, i) =>
				`<rect x="${i * BAR_W + BAR_GAP / 2}" y="${(100 - h) / 2}" width="${BAR_W - BAR_GAP}" height="${h}" rx="1" fill="white"/>`,
		)
		.join("");
	return `url("data:image/svg+xml,${encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">${rects}</svg>`,
	)}")`;
}

export function PlaceholderBalls({
	generating,
	staticRotations,
}: {
	generating: boolean;
	staticRotations: number[];
}) {
	return (
		<>
			{PLACEHOLDER_BALLS.map((ball, i) => (
				<span
					key={i}
					className={
						generating
							? loaderStyles.ball
							: `${loaderStyles.ball} ${loaderStyles.ballStatic}`
					}
					style={
						{
							"--color": ball.color,
							"--i": ball.size,
							"--d": ball.duration,
							"--x": ball.x,
							"--y": ball.y,
							...(!generating && {
								"--rotation": `${staticRotations[i]}deg`,
							}),
						} as React.CSSProperties
					}
				/>
			))}
		</>
	);
}

export function useStaticRotations() {
	const [rotations] = useState(() =>
		PLACEHOLDER_BALLS.map(() => Math.floor(Math.random() * 360)),
	);
	return rotations;
}

function PlaceholderBallsLoader({ generating }: { generating: boolean }) {
	const staticRotations = useStaticRotations();
	return (
		<div className={loaderStyles.containerLoader} aria-hidden="true">
			<PlaceholderBalls
				generating={generating}
				staticRotations={staticRotations}
			/>
		</div>
	);
}

function PlaceholderOverlay({
	status,
	seconds,
	error,
	onGenerate,
	onDiscard,
	cancelClassName,
}: PlaceholderProps & { cancelClassName?: string }) {
	return (
		<>
			{error && <ErrorMessage message={error} />}
			<div className="absolute top-2 left-2 z-10">
				<GenerationIndicator
					status={status}
					seconds={seconds}
					idleLabel="Generate"
					onClick={onGenerate}
				/>
			</div>
			{status !== "idle" && (
				<CancelButton onClick={onDiscard} className={cancelClassName} />
			)}
		</>
	);
}

function ErrorMessage({ message }: { message: string }) {
	return (
		<div className="absolute inset-2 z-20 flex items-center justify-center pointer-events-none">
			<div className="pointer-events-auto flex max-h-full min-w-0 max-w-full items-start gap-1.5 overflow-x-hidden overflow-y-auto rounded-lg bg-red-700 px-3 py-1.5 shadow-md">
				<AlertCircle className="mt-px h-3.5 w-3.5 shrink-0 text-white" />
				<p className="min-w-0 whitespace-pre-wrap break-words text-xs leading-snug text-white">
					{message}
				</p>
			</div>
		</div>
	);
}

function AudioResult({
	type,
	src,
	characterName,
	status,
	seconds,
	stale,
	onRegenerate,
}: GenerationState & {
	type: CanvasElementType;
	src: string;
	characterName?: string;
	stale: boolean;
	onRegenerate: () => void;
}) {
	return (
		<div className="group relative w-full min-h-16 rounded-lg overflow-hidden border border-white/10 bg-white/[0.03] flex flex-wrap items-center gap-x-2 gap-y-1.5 px-2 py-1.5">
			{type === "character" && <CharacterBadge name={characterName} />}
			<GenerationIndicator
				status={status}
				seconds={seconds}
				idleLabel="Regenerate"
				onClick={onRegenerate}
				className="shrink-0"
			/>
			<AudioPlayer key={src} src={src} waveColor={WAVE_COLORS[type]} />
			{stale && <StaleIndicator onClick={onRegenerate} />}
		</div>
	);
}

interface OutputPreviewProps {
	element: CanvasContentElement;
}

type PlaceholderProps = GenerationState & {
	error: string | null;
	onGenerate: () => void;
	onDiscard: () => void;
};

function AudioPlaceholder(props: PlaceholderProps) {
	const [mask] = useState(() => {
		const bars = Array.from(
			{ length: AUDIO_BAR_COUNT },
			() => 20 + Math.random() * 80,
		);
		return buildSoundwaveMask(bars);
	});

	return (
		<div className="group relative w-full h-16 rounded-lg overflow-hidden">
			<div className="absolute inset-0 blur-[6px]" aria-hidden="true">
				<div
					className="absolute inset-0"
					style={{
						maskImage: mask,
						WebkitMaskImage: mask,
						maskSize: "100% 100%",
						WebkitMaskSize: "100% 100%",
					}}
				>
					<div className="absolute inset-0 bg-white/20" />
					<PlaceholderBallsLoader generating={props.status === "generating"} />
				</div>
			</div>
			<div className="absolute inset-0 grain grain-light border rounded-lg bg-white/[0.03] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]" />
			<PlaceholderOverlay
				{...props}
				cancelClassName="top-1/2 -translate-y-1/2"
			/>
		</div>
	);
}

function MediaPlaceholder(props: PlaceholderProps) {
	return (
		<div className="group grain grain-light relative w-full aspect-video rounded-lg overflow-hidden border flex items-center justify-center backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]">
			<PlaceholderOverlay {...props} />
			<PlaceholderBallsLoader generating={props.status === "generating"} />
		</div>
	);
}

function MediaPreview({
	url,
	outputKind,
	borderColor,
	status,
	seconds,
	stale,
	onRegenerate,
}: GenerationState & {
	url: string;
	outputKind: "image" | "video";
	borderColor: string;
	stale: boolean;
	onRegenerate: () => void;
}) {
	return (
		<div
			className={`group relative w-full aspect-video rounded-lg overflow-hidden border ${borderColor}`}
		>
			<MediaWithSkeleton
				outputKind={outputKind}
				src={url}
				alt="Generated"
				videoInteractive
			/>
			<ResultOverlay
				status={status}
				seconds={seconds}
				onRegenerate={onRegenerate}
			/>
			{stale && <StaleIndicator onClick={onRegenerate} />}
		</div>
	);
}

const BORDER_COLORS: Record<CanvasElementType, string> = {
	character: "border-amber-500/30",
	image: "border-cyan-500/30",
	clip: "border-indigo-500/30",
	narration: "border-white/20",
	music: "border-violet-500/30",
	sound: "border-emerald-500/30",
};

const WAVE_COLORS: Record<CanvasElementType, string> = {
	character: "rgb(251, 191, 36)",
	narration: "rgb(128, 128, 128)",
	music: "rgb(167, 139, 250)",
	sound: "rgb(52, 211, 153)",
	image: "rgb(34, 211, 238)",
	clip: "rgb(129, 140, 248)",
};

function OutputPreviewComponent({ element }: OutputPreviewProps) {
	const type = element.type;
	const { outputKind } = ELEMENT_CONFIGS[type];
	const {
		generating,
		queued,
		seconds,
		result,
		error,
		stale,
		generate,
		discard,
	} = useGenerate(element);
	const status = deriveStatus(generating, queued);

	if (outputKind === "audio") {
		if (result) {
			return (
				<AudioResult
					type={type}
					src={result.url}
					characterName={element.customAttributes?.name}
					status={status}
					seconds={seconds}
					stale={stale}
					onRegenerate={generate}
				/>
			);
		}
		return (
			<AudioPlaceholder
				status={status}
				seconds={seconds}
				error={error}
				onGenerate={generate}
				onDiscard={discard}
			/>
		);
	}

	if (result) {
		return (
			<MediaPreview
				key={result.url}
				url={result.url}
				outputKind={outputKind}
				borderColor={BORDER_COLORS[type] ?? "border-white/20"}
				status={status}
				seconds={seconds}
				stale={stale}
				onRegenerate={generate}
			/>
		);
	}

	return (
		<MediaPlaceholder
			status={status}
			seconds={seconds}
			error={error}
			onGenerate={generate}
			onDiscard={discard}
		/>
	);
}

export const OutputPreview = memo(OutputPreviewComponent);
