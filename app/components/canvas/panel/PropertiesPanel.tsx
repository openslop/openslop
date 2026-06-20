"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useConfig } from "@/lib/config/ConfigProvider";
import { getProjectStore } from "@/lib/project/store";
import { TRANSITION_TYPES, type TransitionType } from "@/lib/video/transitions";
import { useTransitionType } from "@/lib/video/useTransitionType";
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

	const setTransitionType = (value: TransitionType) =>
		getProjectStore(projectId)
			.getState()
			.updateMetadata({ videoSettings: { transitionType: value } });

	return (
		<PanelCard title="Transition">
			<PanelField label="Transition">
				<Select
					value={transitionType}
					onValueChange={(value) => setTransitionType(value as TransitionType)}
				>
					<SelectTrigger size="sm" aria-label="Transition">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{TRANSITION_TYPES.map((value) => (
							<SelectItem key={value} value={value} className="text-xs">
								{LABELS[value]}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</PanelField>
		</PanelCard>
	);
}
