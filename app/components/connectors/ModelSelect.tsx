"use client";

import type { ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/components/ui/icon";
import { SelectMenuItem } from "@/components/ui/select-menu";
import { MODEL_CATALOGS } from "@/lib/connectors/models";
import { providerMeta } from "@/lib/connectors/providerCatalog";
import type { ConnectorType, ProviderKey } from "@/lib/connectors/types";
import { useSettings } from "@/lib/settings/useSettings";
import { cn } from "@/lib/utils";
import { ModelChips } from "./ModelChips";
import { ProviderIcon } from "./ProviderIcon";
import { useCanGenerateWith } from "./useConnectors";

/**
 * Every model a connector type offers, whether or not the account can run it.
 * A model on a provider with no key stays visible but unavailable, carrying the
 * one action that would change that, so the picker teaches what it costs to use.
 */
export function ModelSelect({
	type,
	value,
	onChange,
	side = "bottom",
	align = "start",
	children,
}: {
	type: ConnectorType;
	value: string;
	onChange: (model: string) => void;
	side?: "top" | "bottom";
	align?: "start" | "center" | "end";
	children: ReactNode;
}) {
	const catalog = MODEL_CATALOGS[type];
	const canGenerateWith = useCanGenerateWith();
	const settings = useSettings();

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
			<DropdownMenuContent
				side={side}
				align={align}
				// The raised popover surface, so a model picker reads the same as the
				// settings and history popovers it sits beside.
				className="max-h-80 min-w-72 overflow-y-auto bg-surface-elevated"
			>
				{catalog.names.map((name) => {
					const provider = catalog.providerFor(name);
					const available = canGenerateWith(provider);
					return (
						<SelectMenuItem
							key={name}
							selected={name === value}
							onSelect={() =>
								available
									? onChange(name)
									: settings.open("connectors", provider)
							}
							className="gap-2"
						>
							<ProviderIcon
								provider={provider}
								size={14}
								className={cn(!available && "opacity-40")}
							/>
							<span
								className={cn(
									"min-w-0 truncate",
									!available && "text-muted-foreground",
								)}
							>
								{name}
							</span>
							{available ? (
								<ModelChips model={name} className="ml-auto" />
							) : (
								<ConnectHint provider={provider} />
							)}
						</SelectMenuItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

/** Looks like the buttons it stands in for, without nesting one inside a menu row. */
function ConnectHint({ provider }: { provider: ProviderKey }) {
	const { name } = providerMeta(provider);
	return (
		<span
			className={cn(
				buttonVariants({ variant: "secondary", size: "xs" }),
				"ml-auto h-5 px-1.5 text-label-xs",
			)}
			title={`Add your ${name} API key to generate with this model`}
		>
			<Link aria-hidden="true" className="size-2.5" />
			Connect
		</span>
	);
}
