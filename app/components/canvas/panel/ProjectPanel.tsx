"use client";

import noop from "lodash/noop";
import type { ReactNode } from "react";
import {
	FilmSlate,
	Hourglass,
	Template,
	Translate,
	type IconComponent,
} from "@/components/ui/icon";
import { SelectField } from "@/components/ui/select-field";
import { useProject } from "@/lib/project/useProject";
import { languageLabel } from "@/lib/project/language";
import { videoFormatLabel } from "@/lib/project/videoFormat";
import { videoLengthLabel } from "@/lib/project/videoLength";
import { getTemplateById } from "@/lib/templates/templates";
import { PanelCard, PanelField } from "./PanelCard";

/** A setting the project was created with, shown as the dropdown it was picked from. */
function FixedSetting({
	label,
	Icon,
	value,
}: {
	label: string;
	Icon: IconComponent;
	value: ReactNode;
}) {
	return (
		<PanelField label={label}>
			<SelectField
				ariaLabel={label}
				value="current"
				options={[{ value: "current", label: value, Icon }]}
				onChange={noop}
				tooltip="Set when the project was created"
				unavailable
			/>
		</PanelField>
	);
}

export function ProjectPanel() {
	const { language, length, format, template } = useProject(
		(state) => state.scriptSettings,
	);

	return (
		<PanelCard title="Project">
			<FixedSetting
				label="Language"
				Icon={Translate}
				value={languageLabel(language)}
			/>
			<FixedSetting
				label="Length"
				Icon={Hourglass}
				value={videoLengthLabel(length)}
			/>
			<FixedSetting
				label="Format"
				Icon={FilmSlate}
				value={videoFormatLabel(format)}
			/>
			<FixedSetting
				label="Template"
				Icon={Template}
				value={getTemplateById(template)?.name ?? "None"}
			/>
		</PanelCard>
	);
}
