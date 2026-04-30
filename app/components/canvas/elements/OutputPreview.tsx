import { useState } from "react";
import { X as XIcon, Wand2, RotateCcw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";
import { AudioPlayer } from "./AudioPlayer";
import { CharacterBadge } from "./CharacterBadge";
import { MediaWithSkeleton } from "./MediaWithSkeleton";
import type { CanvasElementType } from "../types";
import type { AssetResult } from "@/lib/connectors/types";
import { ELEMENT_CONFIGS } from "../config/elementConfigs";
import genStyles from "@/app/components/styles/gen-button.module.css";
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

export function SparklesIcon() {
	return (
		<svg
			className={genStyles.svg}
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
			/>
		</svg>
	);
}

interface GenerationState {
	generating: boolean;
	queued: boolean;
	seconds: number;
}

function GenerateButton({
	generating,
	queued,
	seconds,
	onClick,
	label = "Generate",
	icon = <SparklesIcon />,
	className = "",
}: GenerationState & {
	onClick: () => void;
	label?: string;
	icon?: React.ReactNode;
	className?: string;
}) {
	const active = generating || queued;
	return (
		<button
			type="button"
			className={`${genStyles.btn} ${active ? `${genStyles.generating} pointer-events-none` : "opacity-0 group-hover:opacity-100"} transition-opacity ${className}`}
			disabled={active}
			onClick={onClick}
		>
			{icon}
			<span className={active ? "shimmer" : ""}>
				{queued ? "Queued..." : generating ? `Generating ${seconds}s` : label}
			</span>
		</button>
	);
}

function RegenerateButton({
	generating,
	queued,
	seconds,
	onClick,
	className = "",
}: GenerationState & {
	onClick: () => void;
	className?: string;
}) {
	const active = generating || queued;
	const label = queued
		? "Queued..."
		: generating
			? `Generating ${seconds}s`
			: "Regenerate";

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					aria-label={label}
					className={cn(
						"relative w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 grain grain-light flex items-center justify-center transition-[opacity,background-color] overflow-hidden",
						className,
					)}
					disabled={active}
					onClick={onClick}
				>
					<RotateCcw
						className={cn("w-3 h-3 text-white", active && "animate-spin")}
					/>
				</button>
			</TooltipTrigger>
			<TooltipContent>{label}</TooltipContent>
		</Tooltip>
	);
}

function WandIcon() {
	return (
		<Wand2 className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white/40 stroke-1 drop-shadow-md" />
	);
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
	generating,
	queued,
	seconds,
	onRegenerate,
}: GenerationState & {
	onRegenerate: () => void;
}) {
	return (
		<RegenerateButton
			generating={generating}
			queued={queued}
			seconds={seconds}
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
	generating,
	queued,
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
			<RegenerateButton
				generating={generating}
				queued={queued}
				seconds={seconds}
				onClick={onRegenerate}
				className="shrink-0"
			/>
			<AudioPlayer key={src} src={src} waveColor={WAVE_COLORS[type]} />
			{stale && <StaleIndicator onClick={onRegenerate} />}
		</div>
	);
}

interface OutputPreviewProps {
	type: CanvasElementType;
	characterName?: string;
	generating: boolean;
	queued: boolean;
	seconds: number;
	result: AssetResult | null;
	error: string | null;
	stale: boolean;
	onGenerate: () => void;
	onDiscard: () => void;
}

function AudioPlaceholder({
	generating,
	queued,
	seconds,
	error,
	onGenerate,
	onDiscard,
}: Omit<OutputPreviewProps, "type" | "characterName" | "result" | "stale">) {
	const staticRotations = useStaticRotations();

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
					<div className={loaderStyles.containerLoader}>
						<PlaceholderBalls
							generating={generating}
							staticRotations={staticRotations}
						/>
					</div>
				</div>
			</div>
			<div className="absolute inset-0 grain grain-light border rounded-lg bg-white/[0.03] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]" />
			<div className="absolute inset-0 z-10 flex items-center justify-center">
				<WandIcon />
			</div>
			{error && <ErrorMessage message={error} />}
			<div className="absolute inset-0 z-10 flex items-center justify-start pl-2">
				<GenerateButton
					generating={generating}
					queued={queued}
					seconds={seconds}
					onClick={onGenerate}
				/>
			</div>
			{(generating || queued) && (
				<CancelButton
					onClick={onDiscard}
					className="top-1/2 -translate-y-1/2"
				/>
			)}
		</div>
	);
}

function MediaPlaceholder({
	generating,
	queued,
	seconds,
	error,
	onGenerate,
	onDiscard,
}: Omit<OutputPreviewProps, "type" | "result" | "stale">) {
	const staticRotations = useStaticRotations();

	return (
		<div className="group grain grain-light relative w-full aspect-video rounded-lg overflow-hidden border flex items-center justify-center backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]">
			<div className="z-10">
				<WandIcon />
			</div>
			{error && <ErrorMessage message={error} />}
			<div className="absolute top-2 left-2 z-10">
				<GenerateButton
					generating={generating}
					queued={queued}
					seconds={seconds}
					onClick={onGenerate}
				/>
			</div>
			{(generating || queued) && <CancelButton onClick={onDiscard} />}
			<div className={loaderStyles.containerLoader} aria-hidden="true">
				<PlaceholderBalls
					generating={generating}
					staticRotations={staticRotations}
				/>
			</div>
		</div>
	);
}

function MediaPreview({
	url,
	outputKind,
	borderColor,
	generating,
	queued,
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
				generating={generating}
				queued={queued}
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

export function OutputPreview({
	type,
	characterName,
	generating,
	queued,
	seconds,
	result,
	error,
	stale,
	onGenerate,
	onDiscard,
}: OutputPreviewProps) {
	const { outputKind } = ELEMENT_CONFIGS[type];

	if (outputKind === "audio") {
		if (result) {
			return (
				<AudioResult
					type={type}
					src={result.url}
					characterName={characterName}
					generating={generating}
					queued={queued}
					seconds={seconds}
					stale={stale}
					onRegenerate={onGenerate}
				/>
			);
		}
		return (
			<AudioPlaceholder
				generating={generating}
				queued={queued}
				seconds={seconds}
				error={error}
				onGenerate={onGenerate}
				onDiscard={onDiscard}
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
				generating={generating}
				queued={queued}
				seconds={seconds}
				stale={stale}
				onRegenerate={onGenerate}
			/>
		);
	}

	return (
		<MediaPlaceholder
			generating={generating}
			queued={queued}
			seconds={seconds}
			error={error}
			onGenerate={onGenerate}
			onDiscard={onDiscard}
		/>
	);
}
