import type { ReactNode } from "react";
import { Slider } from "@/components/ui/slider";

/** A side-panel subsection */
export function PanelCard({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<section className="grain relative shrink-0 overflow-hidden rounded-xl bg-element-card shadow-elevation-1">
			<div className="relative z-10 flex flex-col gap-3 p-3 text-panel-fg">
				<h3 className="text-label font-semibold tracking-wider text-panel-label uppercase">
					{title}
				</h3>
				{children}
			</div>
		</section>
	);
}

/** A labeled control row inside a `PanelCard` */
export function PanelField({
	label,
	children,
}: {
	label: string;
	children: ReactNode;
}) {
	return (
		<div className="flex items-center justify-between gap-3">
			<span className="text-label font-medium text-panel-label">{label}</span>
			{children}
		</div>
	);
}

/** A labeled numeric slider row inside a `PanelCard` */
export function PanelSlider({
	label,
	value,
	min,
	max,
	step,
	onChange,
	format = String,
}: {
	label: string;
	value: number;
	min: number;
	max: number;
	step: number;
	onChange: (value: number) => void;
	format?: (value: number) => string;
}) {
	return (
		<div className="flex items-center gap-2">
			<span className="shrink-0 text-label font-medium text-panel-label">
				{label}
			</span>
			<Slider
				className="flex-1"
				aria-label={label}
				value={[value]}
				min={min}
				max={max}
				step={step}
				onValueChange={([next]) => onChange(next ?? value)}
			/>
			<span className="w-9 shrink-0 text-right font-mono text-label-xs text-muted-foreground tabular-nums">
				{format(value)}
			</span>
		</div>
	);
}
