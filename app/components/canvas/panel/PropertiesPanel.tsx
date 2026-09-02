"use client";

import { SelectField } from "@/components/ui/select-field";
import {
	TRANSITION_TYPES,
	transitionLabel,
	type TransitionType,
} from "@/lib/video/transitions";
import {
	useUpdateVideoSettings,
	useVideoSetting,
} from "@/lib/video/useVideoSetting";
import { PanelCard, PanelField } from "./PanelCard";

const OPTIONS = TRANSITION_TYPES.map((value) => ({
	value,
	label: transitionLabel(value),
}));

export function PropertiesPanel() {
	const transitionType = useVideoSetting("transitionType");
	const updateVideoSettings = useUpdateVideoSettings();

	const setTransitionType = (value: TransitionType) =>
		updateVideoSettings({ transitionType: value });

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
