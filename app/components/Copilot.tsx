"use client";

import {
	type ReactNode,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import {
	CornerDownLeft,
	ImagePlus,
	Loader2,
	Plus,
	Sparkles,
	Square,
	X,
} from "lucide-react";
import type { ComposerMode } from "@/lib/config/ConfigProvider";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import GlassDropdown, {
	type GlassDropdownOption,
} from "@/app/components/GlassDropdown";
import { TEMPLATES, getTemplateById } from "@/lib/templates/templates";
import OrbLoader from "./OrbLoader";

const LOADING_MESSAGES = [
	"Brewing creativity…",
	"Summoning the muses…",
	"Arguing with the AI writers' room…",
	"Polishing the plot twists…",
	"Convincing characters to cooperate…",
	"Sprinkling dramatic tension…",
	"Negotiating with the narrator…",
	"Adding a pinch of movie magic…",
];

const MODE_OPTIONS: GlassDropdownOption<ComposerMode>[] = [
	{ value: "story", label: "Describe a story" },
	{ value: "script", label: "Paste in a script" },
	{ value: "template", label: "Use a template" },
];

const TEMPLATE_OPTIONS: GlassDropdownOption<string>[] = TEMPLATES.map((t) => ({
	value: t.id,
	label: t.name,
}));

export interface CopilotHandle {
	fill: (prompt: string, images: string[]) => void;
}

interface CopilotProps {
	onSubmit: (value: string, referenceImages: string[]) => void;
	onStop?: () => void;
	multiline?: boolean;
	placeholder?: ReactNode;
	loading?: boolean;
	composerMode?: ComposerMode;
	onModeChange?: (mode: ComposerMode) => void;
	selectedTemplateId?: string | null;
	onTemplateChange?: (id: string) => void;
	ref?: React.Ref<CopilotHandle>;
}

function ActionButton({
	label,
	icon,
	onClick,
	disabled,
}: {
	label: string;
	icon: ReactNode;
	onClick: () => void;
	disabled?: boolean;
}) {
	return (
		<button
			aria-label={label}
			onClick={onClick}
			disabled={disabled}
			className="relative grain ml-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#1f1528]/60 text-violet-300 transition-[filter] hover:brightness-[1.3] disabled:opacity-30 disabled:pointer-events-none"
		>
			{icon}
		</button>
	);
}

function LoadingText() {
	const [index, setIndex] = useState(() =>
		Math.floor(Math.random() * LOADING_MESSAGES.length),
	);

	useEffect(() => {
		const interval = setInterval(() => {
			setIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
		}, 3000);
		return () => clearInterval(interval);
	}, []);

	return (
		<span className="font-body pointer-events-none block select-none truncate text-sm text-white/40 shimmer">
			{LOADING_MESSAGES[index]}
		</span>
	);
}

function ImageThumbnail({
	url,
	onRemove,
}: {
	url: string;
	onRemove: () => void;
}) {
	const [loaded, setLoaded] = useState(false);

	return (
		<div className="group/thumb relative h-14 w-14 shrink-0">
			<div className="h-full w-full overflow-hidden rounded-lg">
				{!loaded && (
					<div className="absolute inset-0 rounded-lg shimmer-surface" />
				)}
				<img
					src={url}
					alt="Reference"
					className={`h-full w-full object-cover transition-opacity ${loaded ? "opacity-100" : "opacity-0"}`}
					onLoad={() => setLoaded(true)}
				/>
			</div>
			<button
				type="button"
				aria-label="Remove image"
				onClick={onRemove}
				className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-black/20 backdrop-blur-xl shadow-md shadow-black/8 opacity-0 transition-all hover:bg-black/40 group-hover/thumb:opacity-100"
			>
				<X className="h-3.5 w-3.5 text-white/70 transition-colors hover:text-white" />
			</button>
		</div>
	);
}

function UploadingSkeleton() {
	return <div className="h-14 w-14 shrink-0 rounded-lg shimmer-surface" />;
}

function AttachMenu({
	onUpload,
	uploading,
	setUploading,
}: {
	onUpload: (url: string) => void;
	uploading: boolean;
	setUploading: (v: boolean) => void;
}) {
	const inputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setUploading(true);
		const formData = new FormData();
		formData.append("file", file);

		try {
			const res = await fetch("/api/upload/image", {
				method: "POST",
				body: formData,
			});
			const data = await res.json();
			if (res.ok && data.url) {
				onUpload(data.url);
			}
		} finally {
			setUploading(false);
			if (inputRef.current) inputRef.current.value = "";
		}
	};

	return (
		<>
			<input
				ref={inputRef}
				type="file"
				accept="image/*"
				className="hidden"
				onChange={handleFileChange}
			/>
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						aria-label="Attach"
						disabled={uploading}
						className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white/70 disabled:pointer-events-none"
					>
						{uploading ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Plus className="h-4 w-4" />
						)}
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					side="bottom"
					align="start"
					className="min-w-36 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-md shadow-black/8 p-0.5"
				>
					<DropdownMenuItem
						onClick={() => inputRef.current?.click()}
						className="cursor-pointer rounded-lg px-2 py-1.5 text-[11px] text-white/70 hover:text-white focus:text-white focus:bg-white/10"
					>
						<ImagePlus
							className="mr-1.5 h-3.5 text-white w-3.5"
							strokeWidth={1.5}
						/>
						Upload Image
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
}

function TemplatePill({
	templateId,
	onRemove,
}: {
	templateId: string;
	onRemove: () => void;
}) {
	const template = getTemplateById(templateId);
	if (!template) return null;

	return (
		<span
			className="font-body relative grain inline-flex self-start shrink-0 items-center gap-1 overflow-hidden rounded-full py-0.5 pl-1 pr-2 text-sm leading-5 text-white/80 whitespace-nowrap sm:mt-px sm:self-auto"
			style={{ backgroundColor: template.color }}
		>
			<button
				type="button"
				aria-label="Remove template"
				onClick={onRemove}
				className="flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:bg-black/20"
			>
				<X className="h-3 w-3" />
			</button>
			{template.pillText}
		</span>
	);
}

export default function Copilot({
	onSubmit,
	onStop,
	multiline,
	placeholder,
	loading,
	composerMode,
	onModeChange,
	selectedTemplateId,
	onTemplateChange,
	ref,
}: CopilotProps) {
	const [value, setValue] = useState("");
	const [referenceImages, setReferenceImages] = useState<string[]>([]);
	const [uploading, setUploading] = useState(false);
	const showPill =
		composerMode === "template" &&
		selectedTemplateId !== null &&
		selectedTemplateId !== undefined;

	useImperativeHandle(ref, () => ({
		fill(prompt: string, images: string[]) {
			setValue(prompt);
			setReferenceImages(images);
		},
	}));

	const hasText = value.trim().length > 0;

	const handleSubmit = () => {
		if (!hasText) return;
		onSubmit(value, referenceImages);
		setValue("");
		setReferenceImages([]);
	};

	const handleUpload = (url: string) => {
		setReferenceImages((prev) => [...prev, url]);
	};

	const removeImage = (index: number) => {
		setReferenceImages((prev) => prev.filter((_, i) => i !== index));
	};

	const placeholderOverlay =
		typeof placeholder !== "string" ? placeholder : undefined;
	const placeholderText =
		typeof placeholder === "string" ? placeholder : undefined;

	return (
		<div className="w-full rounded-xl border border-violet-500/30 bg-white/5 shadow-[0_0_40px_rgba(55,30,100,0.5)]">
			{multiline ? (
				<div className="px-4 py-3">
					{(referenceImages.length > 0 || uploading) && (
						<div className="flex flex-wrap gap-2 pb-2">
							{referenceImages.map((url, i) => (
								<ImageThumbnail
									key={url}
									url={url}
									onRemove={() => removeImage(i)}
								/>
							))}
							{uploading && <UploadingSkeleton />}
						</div>
					)}
					<div className="flex flex-col gap-1 sm:flex-row sm:items-baseline">
						{showPill && selectedTemplateId && onModeChange && (
							<TemplatePill
								templateId={selectedTemplateId}
								onRemove={() => onModeChange("story")}
							/>
						)}
						<div className="min-w-0 flex-1 grid [&>*]:[grid-area:1/1]">
							<textarea
								rows={2}
								aria-label="Enter your prompt"
								value={value}
								onChange={(e) => setValue(e.target.value)}
								onKeyDown={(e) => {
									if ((e.metaKey || e.ctrlKey) && e.key === "Enter")
										handleSubmit();
								}}
								placeholder={placeholderText}
								style={{ fieldSizing: "content" }}
								className="font-body w-full resize-none bg-transparent text-sm leading-5 text-white/80 caret-violet-400 placeholder:text-white/30 outline-none focus-visible:ring-2 focus-visible:ring-violet-400/30 focus-visible:rounded-sm"
							/>
							{!hasText && !showPill && placeholderOverlay && (
								<div className="font-body pointer-events-none overflow-hidden text-sm">
									{placeholderOverlay}
								</div>
							)}
						</div>
					</div>
					<div className="flex items-center justify-between pt-2">
						<div className="flex items-center gap-2">
							<AttachMenu
								onUpload={handleUpload}
								uploading={uploading}
								setUploading={setUploading}
							/>
							{onModeChange && composerMode && (
								<GlassDropdown
									value={composerMode}
									onChange={onModeChange}
									options={MODE_OPTIONS}
									ariaLabel="Composer mode"
									side="bottom"
								/>
							)}
							{composerMode === "template" &&
								onTemplateChange &&
								selectedTemplateId && (
									<GlassDropdown
										value={selectedTemplateId}
										onChange={onTemplateChange}
										options={TEMPLATE_OPTIONS}
										ariaLabel="Select template"
										side="bottom"
										className="relative grain overflow-hidden"
										style={{
											backgroundColor:
												getTemplateById(selectedTemplateId)?.color,
										}}
									/>
								)}
						</div>
						<ActionButton
							label="Submit"
							icon={<CornerDownLeft className="h-4 w-4" strokeWidth={2.5} />}
							onClick={handleSubmit}
							disabled={!hasText}
						/>
					</div>
				</div>
			) : (
				<div className="relative flex items-center px-4 py-3">
					{loading ? (
						<OrbLoader />
					) : (
						<Sparkles className="mr-3 h-5 w-5 shrink-0 text-violet-400/60" />
					)}
					<div className="relative min-w-0 flex-1">
						{loading ? (
							<LoadingText />
						) : (
							<>
								{!hasText && placeholderOverlay && (
									<div className="font-body pointer-events-none absolute inset-0 flex items-center overflow-hidden text-sm">
										{placeholderOverlay}
									</div>
								)}
								<input
									type="text"
									aria-label="Describe your video"
									value={value}
									onChange={(e) => setValue(e.target.value)}
									onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
									placeholder={placeholderText}
									className="font-body w-full bg-transparent text-sm text-white/80 caret-violet-400 placeholder:text-white/30 outline-none focus-visible:ring-2 focus-visible:ring-violet-400/30 focus-visible:rounded-sm"
								/>
							</>
						)}
					</div>
					{loading ? (
						<ActionButton
							label="Stop generation"
							icon={<Square className="h-3 w-3 fill-current" />}
							onClick={() => onStop?.()}
						/>
					) : (
						<ActionButton
							label="Submit prompt"
							icon={<CornerDownLeft className="h-4 w-4" strokeWidth={2.5} />}
							onClick={handleSubmit}
							disabled={!hasText}
						/>
					)}
				</div>
			)}
		</div>
	);
}
