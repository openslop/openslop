"use client";

import { Button } from "@/components/ui/button";
import { Settings } from "@/components/ui/icon";
import { ModelDefaultControl } from "@/app/components/models/ModelDefaultControl";
import { MODEL_GROUPS } from "@/lib/connectors/modelGroups";
import { useModelChain } from "@/lib/connectors/useDefaultModels";
import { useSlateStatic } from "slate-react";
import { setProjectModels } from "@/lib/canvas/assetOps";
import { useSettings } from "@/lib/settings/useSettings";
import { PanelCard } from "./PanelCard";

export function ModelsPanel() {
	const chain = useModelChain();
	const editor = useSlateStatic();
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
						onChange={(models) => setProjectModels(editor, models)}
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
