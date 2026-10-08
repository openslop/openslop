"use client";

import { SelectField } from "@/components/ui/select-field";
import startCase from "lodash/startCase";
import { TRANSITION_TYPES } from "@/lib/render/transitions";
import { useProject } from "@/lib/project/useProject";
import { useVideoSetting } from "@/lib/project/useVideoSetting";
import { PanelCard, PanelField } from "./PanelCard";

const OPTIONS = TRANSITION_TYPES.map((value) => ({
	value,
	label: startCase(value),
}));

export function PropertiesPanel() {
	const transitionType = useVideoSetting("transitionType");
	const updateVideoSettings = useProject((state) => state.updateVideoSettings);

	return (
		<PanelCard title="Transition">
			<PanelField label="Transition">
				<SelectField
					value={transitionType}
					options={OPTIONS}
					onChange={(value) => updateVideoSettings({ transitionType: value })}
					ariaLabel="Transition"
				/>
			</PanelField>
		</PanelCard>
	);
}
