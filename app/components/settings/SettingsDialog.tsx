"use client";

import { useState } from "react";
import {
	DialogContent,
	DialogDescription,
	DialogTitle,
	MountedDialog,
} from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { ArrowLeft } from "@/components/ui/icon";
import { type BYOKProvider } from "@/lib/connectors/providerCatalog";
import { useSettings } from "@/lib/settings/useSettings";
import { AddProvidersView } from "./AddProvidersView";
import { ModelsTab } from "./ModelsTab";
import { SettingsNav } from "./SettingsNav";

export function SettingsDialog() {
	const settings = useSettings();
	const [browsing, setBrowsing] = useState(false);
	// Providers whose key form the user already finished with (saved or
	// cancelled) this dialog session. Lives here so it survives the
	// ModelsTab unmount/remount driven by the Add→Back toggle, which is what
	// made the `?provider`-driven form reopen.
	const [dismissed, setDismissed] = useState<Set<BYOKProvider>>(new Set());

	const dismissForm = (provider: BYOKProvider) =>
		setDismissed((prev) => new Set(prev).add(provider));

	const close = () => {
		setBrowsing(false);
		setDismissed(new Set());
		settings.close();
	};

	// Track the last provider we saw so we can re-arm on change during render.
	const [lastProvider, setLastProvider] = useState(settings.provider);

	// Re-arm a provider's key form when settings.provider changes externally
	// (e.g. ModelDefaultControl calling settings.open directly, bypassing pick).
	// We do this during render rather than in an effect to avoid cascading renders.
	let effectiveDismissed = dismissed;
	if (settings.provider !== lastProvider) {
		setLastProvider(settings.provider);
		if (settings.provider && dismissed.has(settings.provider as BYOKProvider)) {
			const next = new Set(dismissed);
			next.delete(settings.provider as BYOKProvider);
			setDismissed(next);
			effectiveDismissed = next;
		}
	}

	const pick = (provider: BYOKProvider) => {
		setBrowsing(false);
		// A fresh "Connect" is a new landing, so its key form is allowed to
		// open again even if it was dismissed earlier this session. The
		// Add→Back toggle does not go through here, so it stays dismissed.
		setDismissed((prev) => {
			if (!prev.has(provider)) return prev;
			const next = new Set(prev);
			next.delete(provider);
			return next;
		});
		settings.open("models", provider);
	};

	return (
		<MountedDialog
			open={settings.tab !== null}
			onOpenChange={(open) => !open && close()}
		>
			<DialogContent
				glow={false}
				className="h-[min(46rem,calc(100dvh-2rem))] max-w-4xl gap-3 bg-surface-recessed p-4"
			>
				<DialogTitle className="text-label font-semibold">Settings</DialogTitle>
				<DialogDescription className="sr-only">
					Choose the models your work runs on and the keys behind them.
				</DialogDescription>

				<div className="flex min-h-0 flex-1 gap-3">
					<SettingsNav
						active={settings.tab ?? "models"}
						onSelect={(tab) => {
							setBrowsing(false);
							setDismissed(new Set());
							settings.open(tab);
						}}
					/>
					<div className="min-h-0 flex-1 overflow-y-auto rounded-xl bg-card p-4">
						{browsing ? (
							<div className="flex flex-col gap-4">
								<div className="flex items-center gap-2">
									<IconButton
										ariaLabel="Back to settings"
										size="sm"
										onClick={() => setBrowsing(false)}
									>
										<ArrowLeft />
									</IconButton>
									<h3 className="text-label font-semibold text-foreground">
										Add providers
									</h3>
								</div>
								<AddProvidersView onPick={pick} />
							</div>
						) : (
							<ModelsTab
								selected={settings.provider}
								dismissed={effectiveDismissed}
								onDismissForm={dismissForm}
								onAddProviders={() => setBrowsing(true)}
							/>
						)}
					</div>
				</div>
			</DialogContent>
		</MountedDialog>
	);
}
