"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InfoTip } from "@/components/ui/info-tip";
import { Settings } from "@/components/ui/icon";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
	ModelDefaultControl,
	type DefaultsTier,
} from "@/app/components/models/model-default-control";
import { MODEL_GROUPS } from "@/lib/connectors/model-groups";
import type { ConnectorModels } from "@/lib/connectors/models";
import { useModelChain } from "@/lib/connectors/use-default-models";
import { useProject } from "@/lib/project/use-project";
import { useSettings } from "@/lib/settings/use-settings";
import { toastError } from "@/lib/toast-error";
import { useAccount } from "@/lib/user/use-account";
import { PanelCard, PanelField } from "./panel-card";

const TIERS = {
	project: {
		label: "Project",
		info: "New elements in this project use these models. Any left unset follow your account defaults.",
	},
	account: {
		label: "Account",
		info: "Every project falls back to these models. Changing them doesn't touch models a project sets.",
	},
} as const satisfies Record<DefaultsTier, { label: string; info: string }>;

const TIER_OPTIONS = (["project", "account"] as const).map((value) => ({
	value,
	label: TIERS[value].label,
}));

export function ModelsPanel() {
	const [tier, setTier] = useState<DefaultsTier>("project");
	const chain = useModelChain();
	const updateProjectModels = useProject((state) => state.updateModels);
	const setAccountModels = useAccount((state) => state.setModels);
	const settings = useSettings();

	const { label, info } = TIERS[tier];
	const editing =
		tier === "project"
			? { chain, onChange: updateProjectModels }
			: {
					chain: { account: chain.account },
					onChange: (next: ConnectorModels) =>
						void setAccountModels(next).catch(toastError),
				};

	return (
		<PanelCard title="Default models" action={<InfoTip label={info} />}>
			<SegmentedControl
				value={tier}
				options={TIER_OPTIONS}
				onChange={setTier}
				ariaLabel="Defaults for"
				width="fill"
			/>
			{MODEL_GROUPS.map(({ key, label: group, types }) => (
				<PanelField key={key} label={group}>
					<ModelDefaultControl
						types={types}
						tier={tier}
						chain={editing.chain}
						label={`${label} ${group}`}
						onChange={editing.onChange}
					/>
				</PanelField>
			))}
			<Button
				size="sm"
				variant="panel"
				className="w-full"
				onClick={() => settings.open("models")}
			>
				<Settings />
				Manage
			</Button>
		</PanelCard>
	);
}
