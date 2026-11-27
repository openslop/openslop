"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { InfoTip } from "@/components/ui/info-tip";
import { Settings } from "@/components/ui/icon";
import {
	ModelDefaultControl,
	type DefaultsTier,
} from "@/app/components/models/model-default-control";
import { MODEL_GROUPS } from "@/lib/connectors/model-groups";
import type { ConnectorModels, ModelDefaults } from "@/lib/connectors/models";
import { useModelChain } from "@/lib/connectors/use-default-models";
import { useProject } from "@/lib/project/use-project";
import { useSettings } from "@/lib/settings/use-settings";
import { toastError } from "@/lib/toast-error";
import { useAccount } from "@/lib/user/use-account";
import { PanelCard, PanelField } from "./panel-card";

function DefaultsCard({
	title,
	info,
	tier,
	chain,
	onChange,
	children,
}: {
	title: string;
	info: string;
	tier: DefaultsTier;
	chain: ModelDefaults;
	onChange: (models: ConnectorModels) => void;
	children?: ReactNode;
}) {
	return (
		<PanelCard title={title} action={<InfoTip label={info} />}>
			{MODEL_GROUPS.map(({ key, label, types }) => (
				<PanelField key={key} label={label}>
					<ModelDefaultControl
						types={types}
						tier={tier}
						chain={chain}
						label={`${title}: ${label}`}
						onChange={onChange}
					/>
				</PanelField>
			))}
			{children}
		</PanelCard>
	);
}

export function ModelsPanel() {
	const chain = useModelChain();
	const updateModels = useProject((state) => state.updateModels);
	const setAccountModels = useAccount((state) => state.setModels);
	const settings = useSettings();

	return (
		<>
			<DefaultsCard
				title="Project defaults"
				info="New elements in this project use these models. Any left unset follow your account defaults."
				tier="project"
				chain={chain}
				onChange={updateModels}
			/>
			<DefaultsCard
				title="Account defaults"
				info="Every project falls back to these models. Changing them doesn't touch models a project sets."
				tier="account"
				chain={{ account: chain.account }}
				onChange={(next) => void setAccountModels(next).catch(toastError)}
			>
				<Button
					size="sm"
					variant="panel"
					className="w-full"
					onClick={() => settings.open("models")}
				>
					<Settings />
					Manage
				</Button>
			</DefaultsCard>
		</>
	);
}
