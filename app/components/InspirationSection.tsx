"use client";

import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { getTemplateById } from "@/lib/templates/templates";

interface Inspiration {
	image: string;
	title: string;
	description: string;
	prompt: string;
	referenceImages: string[];
	templateId?: string;
}

const INSPIRATIONS: Inspiration[] = [
	{
		image:
			"https://mqzeech9ugknls54.public.blob.vercel-storage.com/assets/upload/template/pov-life-stages-1",
		title: "POV Your Life as A...",
		description:
			"Long-form, second-person POV voiceover with cartoon illustrations that walk a viewer through ascending stages of a role, career, or world",
		prompt: "tech CEO",
		templateId: "pov-life",
		referenceImages: [
			"https://mqzeech9ugknls54.public.blob.vercel-storage.com/assets/upload/template/pov-life-stages-2",
			"https://mqzeech9ugknls54.public.blob.vercel-storage.com/assets/upload/template/pov-life-stages-3",
		],
	},
	{
		image:
			"https://mqzeech9ugknls54.public.blob.vercel-storage.com/assets/upload/template/sleep-story-1",
		title: "Get Sleepy with...",
		description:
			"Long-form, slow, soothing narration designed to lull listeners to sleep",
		prompt: "a cat who wanders around gardens at night",
		templateId: "sleep-story",
		referenceImages: [
			"https://mqzeech9ugknls54.public.blob.vercel-storage.com/assets/upload/template/sleep-story-1",
			"https://mqzeech9ugknls54.public.blob.vercel-storage.com/assets/upload/template/sleep-story-3",
			"https://mqzeech9ugknls54.public.blob.vercel-storage.com/assets/upload/template/sleep-story-4",
		],
	},
];

function CardImage({ src, alt }: { src: string; alt: string }) {
	return (
		<div className="relative w-20 shrink-0 sm:w-24">
			<Image
				src={src}
				alt={alt}
				fill
				sizes="(min-width: 640px) 96px, 80px"
				className="object-cover"
			/>
		</div>
	);
}

export default function InspirationSection({
	onSelect,
}: {
	onSelect: (prompt: string, images: string[], templateId?: string) => void;
}) {
	return (
		<div className="mt-6 w-full">
			<p className="font-body mb-3 text-xs text-white/40">Need inspiration?</p>
			<div className="flex flex-wrap justify-center gap-3">
				{INSPIRATIONS.map((item) => (
					<button
						key={item.title}
						type="button"
						onClick={() =>
							onSelect(item.prompt, item.referenceImages, item.templateId)
						}
						className="group flex w-full flex-row overflow-hidden rounded-xl border border-white/10 bg-white/5 text-left transition-all hover:border-violet-500/30 hover:shadow-[0_0_20px_rgba(55,30,100,0.3)] sm:w-[calc(50%-0.375rem)]"
					>
						<CardImage src={item.image} alt={item.title} />
						<div className="flex min-w-0 flex-1 flex-col justify-center p-3">
							<span className="flex items-center gap-1">
								<span className="font-body truncate text-sm font-semibold text-white/90">
									{item.title}
								</span>
								<ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/40 transition-transform group-hover:translate-x-0.5" />
							</span>
							<span className="font-body mt-1 line-clamp-2 text-xs text-white/40">
								{item.description}
							</span>
							{item.templateId &&
								(() => {
									const tmpl = getTemplateById(item.templateId);
									return tmpl ? (
										<span
											className="relative grain mt-1.5 inline-block self-start overflow-hidden rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white/90"
											style={{ backgroundColor: tmpl.color }}
										>
											{tmpl.name}
										</span>
									) : null;
								})()}
						</div>
					</button>
				))}
			</div>
		</div>
	);
}
