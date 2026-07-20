"use client";

import { SelectField } from "@/components/ui/select-field";
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

const OPTIONS = TRANSITION_TYPES.map((value) => ({
	value,
	label: LABELS[value],
}));

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
				<SelectField
					value={transitionType}
					options={OPTIONS}
					onChange={setTransitionType}
					ariaLabel="Transition"
				/>
			</PanelField>
		</PanelCard>
	);
}
