"use client";

import type { ComponentProps, ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/components/ui/icon";
import { InlineMenuTrigger, SelectMenuItem } from "@/components/ui/select-menu";
import { MODEL_CATALOGS } from "@/lib/connectors/models";
import {
	providerMeta,
	type BYOKProvider,
} from "@/lib/connectors/providerCatalog";
import { providerForModel } from "@/lib/connectors/models";
import type { ConnectorType } from "@/lib/connectors/types";
import { useSettings } from "@/lib/settings/useSettings";
import { cn } from "@/lib/utils";
import { ModelChips } from "./ModelChips";
import { ProviderIcon } from "./ProviderIcon";
import { useMissingKey } from "./useConnectors";

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
	const missingKey = useMissingKey();
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
					const missing = missingKey(provider);
					return (
						<SelectMenuItem
							key={name}
							selected={name === value}
							onSelect={() =>
								missing ? settings.open("connectors", missing) : onChange(name)
							}
							className="gap-2"
						>
							<ProviderIcon
								provider={provider}
								size={14}
								className={cn(missing && "opacity-40")}
							/>
							<span
								className={cn(
									"min-w-0 truncate",
									missing && "text-muted-foreground",
								)}
							>
								{name}
							</span>
							{missing ? (
								<ConnectHint provider={missing} />
							) : (
								<ModelChips meta={catalog.metaFor(name)} className="ml-auto" />
							)}
						</SelectMenuItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

/** Looks like the buttons it stands in for, without nesting one inside a menu row. */
function ConnectHint({ provider }: { provider: BYOKProvider }) {
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

/**
 * The face a model picker hangs off where the trigger is part of the surface
 * rather than a form field: the provider's mark, the model, and the chevron
 * that says it opens.
 */
export function ModelSelectTrigger({
	connector,
	model,
	label,
	...props
}: ComponentProps<"button"> & {
	connector: ConnectorType;
	model: string;
	/** What this model is for, since one element can pick more than one. */
	label: string;
}) {
	return (
		<InlineMenuTrigger aria-label={`${label}: ${model}`} {...props}>
			<ProviderIcon provider={providerForModel(connector, model)} size={12} />
			<span className="min-w-0 truncate">{model}</span>
		</InlineMenuTrigger>
	);
}
