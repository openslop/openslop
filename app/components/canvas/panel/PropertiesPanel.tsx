"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useConfig } from "@/lib/config/ConfigProvider";
import { TRANSITION_TYPES, type TransitionType } from "@/lib/video/transitions";
import {
	setTransitionType,
	useTransitionType,
} from "@/lib/video/useTransitionType";
import { PanelCard, PanelField } from "./PanelCard";

const LABELS: Record<TransitionType, string> = {
	none: "None",
	fade: "Fade",
	slide: "Slide",
	wipe: "Wipe",
	flip: "Flip",
	clockWipe: "Clock Wipe",
	iris: "Iris",
};

export function PropertiesPanel() {
	const { projectId } = useConfig();
	const transitionType = useTransitionType();

	return (
		<PanelCard title="Transition">
			<PanelField label="Transition">
				<Select
					value={transitionType}
					onValueChange={(value) =>
						setTransitionType(projectId, value as TransitionType)
					}
				>
					<SelectTrigger size="sm" aria-label="Transition">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{TRANSITION_TYPES.map((value) => (
							<SelectItem key={value} value={value} className="text-label">
								{LABELS[value]}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</PanelField>
		</PanelCard>
	);
}
