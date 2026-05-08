"use client";

import Image from "next/image";
import { ChevronRight } from "lucide-react";
import {
	TEMPLATES,
	type Template,
	type TemplateShowcase,
} from "@/lib/templates/templates";

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

type ShowcasedTemplate = Template & { showcase: TemplateShowcase };

export default function TemplateGallery({
	onSelect,
}: {
	onSelect: (templateId: string, examplePrompt: string) => void;
}) {
	const showcased = TEMPLATES.filter((t): t is ShowcasedTemplate =>
		Boolean(t.showcase),
	);

	return (
		<div className="mt-6 w-full">
			<p className="font-body mb-3 text-xs text-white/40">Need inspiration?</p>
			<div className="flex flex-wrap justify-center gap-3">
				{showcased.map((template) => (
					<button
						key={template.id}
						type="button"
						onClick={() =>
							onSelect(template.id, template.showcase.examplePrompt)
						}
						className="group flex w-full flex-row overflow-hidden rounded-xl border border-white/10 bg-white/5 text-left transition-all hover:border-violet-500/30 hover:shadow-[0_0_20px_rgba(55,30,100,0.3)] sm:w-[calc(50%-0.375rem)]"
					>
						<CardImage
							src={template.showcase.image}
							alt={template.showcase.title}
						/>
						<div className="flex min-w-0 flex-1 flex-col justify-center p-3">
							<span className="flex items-center gap-1">
								<span className="font-body truncate text-sm font-semibold text-white/90">
									{template.showcase.title}
								</span>
								<ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/40 transition-transform group-hover:translate-x-0.5" />
							</span>
							<span className="font-body mt-1 line-clamp-2 text-xs text-white/40">
								{template.showcase.description}
							</span>
							<span
								className="relative grain mt-1.5 inline-block self-start overflow-hidden rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white/90"
								style={{ backgroundColor: template.color }}
							>
								{template.name}
							</span>
						</div>
					</button>
				))}
			</div>
		</div>
	);
}
