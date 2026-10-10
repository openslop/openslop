"use client";

import { Button } from "@/components/ui/button";
import { Settings } from "@/components/ui/icon";
import { ModelDefaultControl } from "@/app/components/models/model-default-control";
import { MODEL_GROUPS } from "@/lib/connectors/model-groups";
import { useModelChain } from "@/lib/connectors/use-default-models";
import { useProject } from "@/lib/project/use-project";
import { useSettings } from "@/lib/settings/use-settings";
import { PanelCard } from "./panel-card";

export function ModelsPanel() {
	const chain = useModelChain();
	const updateModels = useProject((state) => state.updateModels);
	const settings = useSettings();

	return (
		<>
			{MODEL_GROUPS.map(({ key, label, types }) => (
				<PanelCard key={key} title={label}>
					<ModelDefaultControl
						types={types}
						tier="project"
						chain={chain}
						label={label}
						onChange={updateModels}
						className="w-full"
					/>
				</PanelCard>
			))}
			<Button
				size="sm"
				variant="panel"
				className="w-full shrink-0"
				onClick={() => settings.open("models")}
			>
				<Settings />
				Manage models
			</Button>
		</>
	);
}
