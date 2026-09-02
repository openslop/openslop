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
import { PROVIDER_CATALOG } from "@/lib/connectors/providerCatalog";
import type { ConnectorType, ModelRef, Provider } from "@/lib/connectors/types";
import { useSettings } from "@/lib/settings/useSettings";
import { cn } from "@/lib/utils";
import { ModelChips } from "./ModelChips";
import { ProviderIcon } from "./ProviderIcon";
import { useMissingKey } from "./useProviderKeys";

/** Read aloud, the icon says nothing, so the provider is spelled out. */
export const modelLabel = ({ provider, model }: ModelRef): string =>
	`${model} (${PROVIDER_CATALOG[provider].name})`;

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
										? settings.open("models", missing)
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
function ConnectHint({ provider }: { provider: Provider }) {
	const { name } = PROVIDER_CATALOG[provider];
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
	label: string;
}) {
	return (
		<InlineMenuTrigger aria-label={`${label}: ${modelLabel(model)}`} {...props}>
			<ProviderIcon provider={model.provider} size={12} />
			<span className="min-w-0 truncate">{model.model}</span>
		</InlineMenuTrigger>
	);
}
