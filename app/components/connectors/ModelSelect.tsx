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
import {
	SimpleTooltip,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { listModels, sameModel } from "@/lib/connectors/models";
import { providerMeta } from "@/lib/connectors/providerCatalog";
import type {
	ConnectorType,
	ModelRef,
	ProviderKey,
} from "@/lib/connectors/types";
import { useSettings } from "@/lib/settings/useSettings";
import { cn } from "@/lib/utils";
import { ModelChips } from "./ModelChips";
import { ProviderIcon } from "./ProviderIcon";
import { useMissingKey } from "./useConnectors";

/** Read aloud, the icon says nothing, so the provider is spelled out. */
export const modelLabel = ({ provider, model }: ModelRef): string =>
	`${model} (${providerMeta(provider).name})`;

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
	tooltip,
	children,
}: {
	type: ConnectorType;
	value: ModelRef;
	onChange: (model: ModelRef) => void;
	side?: "top" | "bottom";
	align?: "start" | "center" | "end";
	/** Shown over the trigger, typically where the current pick came from. */
	tooltip?: ReactNode;
	children: ReactNode;
}) {
	const missingKey = useMissingKey();
	const settings = useSettings();

	return (
		<Tooltip>
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger asChild>
					{tooltip ? (
						<TooltipTrigger asChild>{children}</TooltipTrigger>
					) : (
						children
					)}
				</DropdownMenuTrigger>
				<DropdownMenuContent
					side={side}
					align={align}
					// The raised popover surface, so a model picker reads the same as the
					// settings and history popovers it sits beside.
					className="max-h-80 min-w-72 overflow-y-auto bg-surface-elevated"
				>
					{listModels(type).map(({ provider, model, cost, speed }) => {
						const missing = missingKey(provider);
						return (
							<SelectMenuItem
								key={`${provider}/${model}`}
								aria-label={modelLabel({ provider, model })}
								selected={sameModel({ provider, model }, value)}
								onSelect={() =>
									missing
										? settings.open("connectors", missing)
										: onChange({ provider, model })
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
									{model}
								</span>
								{missing ? (
									<ConnectHint provider={missing} />
								) : (
									<ModelChips meta={{ cost, speed }} className="ml-auto" />
								)}
							</SelectMenuItem>
						);
					})}
				</DropdownMenuContent>
			</DropdownMenu>
			{tooltip && (
				<TooltipContent side={side === "bottom" ? "top" : "bottom"}>
					{tooltip}
				</TooltipContent>
			)}
		</Tooltip>
	);
}

/** Looks like the buttons it stands in for, without nesting one inside a menu row. */
function ConnectHint({ provider }: { provider: ProviderKey }) {
	const { name } = providerMeta(provider);
	return (
		<SimpleTooltip
			label={`Add your ${name} API key to generate with this model`}
		>
			<span
				className={cn(
					buttonVariants({ variant: "secondary", size: "xs" }),
					"ml-auto h-5 px-1.5 text-label-xs",
				)}
			>
				<Link aria-hidden="true" className="size-2.5" />
				Connect
			</span>
		</SimpleTooltip>
	);
}

export function ModelSelectTrigger({
	model,
	label,
	...props
}: ComponentProps<"button"> & {
	model: ModelRef;
	/** What this model is for, since one element can pick more than one. */
	label: string;
}) {
	return (
		<InlineMenuTrigger aria-label={`${label}: ${modelLabel(model)}`} {...props}>
			<ProviderIcon provider={model.provider} size={12} />
			<span className="min-w-0 truncate">{model.model}</span>
		</InlineMenuTrigger>
	);
}
