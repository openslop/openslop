"use client";

import { useState, type ReactNode } from "react";
import {
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
	MountedDialog,
} from "@/components/ui/dialog";
import { CloseButton } from "@/components/ui/close-button";
import { IconButton } from "@/components/ui/icon-button";
import { ArrowLeft } from "@/components/ui/icon";
import { SectionTitle } from "@/components/ui/section-title";
import type { Provider } from "@/lib/connectors/types";
import { useSettings, type SettingsTab } from "@/lib/settings/use-settings";
import { AddProvidersView } from "./add-providers-view";
import { McpTab } from "./mcp-tab";
import { ModelsTab } from "./models-tab";
import { SettingsNav } from "./settings-nav";

function ModelsPanel({ selected }: { selected: Provider | null }) {
	const settings = useSettings();
	const [browsing, setBrowsing] = useState(false);

	if (!browsing)
		return (
			<ModelsTab selected={selected} onAddProviders={() => setBrowsing(true)} />
		);

	const pick = (provider: Provider) => {
		setBrowsing(false);
		settings.open("models", provider);
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-2">
				<IconButton
					ariaLabel="Back to settings"
					onClick={() => setBrowsing(false)}
				>
					<ArrowLeft />
				</IconButton>
				<SectionTitle>Add providers</SectionTitle>
			</div>
			<AddProvidersView onPick={pick} />
		</div>
	);
}

export function SettingsDialog() {
	const settings = useSettings();
	const tab = settings.tab ?? "models";

	const panels = {
		models: <ModelsPanel selected={settings.provider} />,
		mcp: <McpTab />,
	} satisfies Record<SettingsTab, ReactNode>;

	return (
		<MountedDialog
			open={settings.tab !== null}
			onOpenChange={(open) => !open && settings.close()}
		>
			<DialogContent
				glow={false}
				showCloseButton={false}
				className="h-[min(46rem,calc(100dvh-2rem))] max-w-4xl gap-3 bg-surface-recessed p-4"
			>
				<div className="flex items-center justify-between gap-3">
					<DialogTitle className="text-label font-semibold">
						Settings
					</DialogTitle>
					<DialogClose asChild>
						<CloseButton />
					</DialogClose>
				</div>
				<DialogDescription className="sr-only">
					Choose the models your work runs on, the keys behind them, and the
					agents that can work in OpenSlop.
				</DialogDescription>

				<div className="flex min-h-0 flex-1 gap-3">
					<SettingsNav active={tab} onSelect={(next) => settings.open(next)} />
					<div className="min-h-0 flex-1 overflow-y-auto rounded-xl bg-card p-4">
						{panels[tab]}
					</div>
				</div>
			</DialogContent>
		</MountedDialog>
	);
}
