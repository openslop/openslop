"use client";

import type { ComponentProps, ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, Settings } from "@/components/ui/icon";
import { ICON_SIZES } from "@/components/ui/icon-button";
import { InfoTip } from "@/components/ui/info-tip";
import {
	InlineMenuTrigger,
	SelectMenuItem,
	SelectMenuTrigger,
} from "@/components/ui/select-menu";
import {
	SimpleTooltip,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { listModels, sameModel } from "@/lib/connectors/models";
import { PROVIDER_CATALOG } from "@/lib/connectors/provider-catalog";
import type { ConnectorType, ModelRef, Provider } from "@/lib/connectors/types";
import { useSettings } from "@/lib/settings/use-settings";
import { cn } from "@/lib/utils";
import { ModelChips } from "./model-chips";
import { ProviderIcon } from "./provider-icon";
import { useProviderKeyLookup } from "./use-provider-keys";

/** Read aloud, the icon says nothing, so the provider is spelled out. */
export const modelLabel = ({ provider, model }: ModelRef): string =>
	`${model} (${PROVIDER_CATALOG[provider].name})`;

type ModelSelectProps = {
	type: ConnectorType;
	value: ModelRef;
	onChange: (model: ModelRef) => void;
};

export function ModelSelect({
	side = "bottom",
	align = "start",
	tooltip,
	footer,
	children,
	...menu
}: ModelSelectProps & {
	side?: "top" | "bottom";
	align?: "start" | "center" | "end";
	tooltip?: ReactNode;
	/** Rows after the models, such as a `ConfigureModelsItem`. */
	footer?: ReactNode;
	children: ReactNode;
}) {
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
					className="max-h-80 min-w-72 overflow-y-auto"
				>
					<ModelMenuItems {...menu} />
					{footer}
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

/** Mounted only while the menu is open, so a closed picker subscribes to nothing. */
function ModelMenuItems({ type, value, onChange }: ModelSelectProps) {
	const keyFor = useProviderKeyLookup();
	const settings = useSettings();

	return listModels(type).map((entry) => {
		const { provider, model, description } = entry;
		const missing = keyFor(provider) === null;
		return (
			<SelectMenuItem
				key={`${provider}/${model}`}
				aria-label={modelLabel({ provider, model })}
				selected={sameModel({ provider, model }, value)}
				onSelect={() =>
					missing
						? settings.open("models", provider)
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
					className={cn("min-w-0 truncate", missing && "text-muted-foreground")}
				>
					{model}
				</span>
				{description && <InfoTip label={description} />}
				{missing ? (
					<ConnectHint provider={provider} />
				) : (
					<ModelChips meta={entry} className="ml-auto" />
				)}
			</SelectMenuItem>
		);
	});
}

/** A way into the models settings from a picker that stands far from them. */
export function ConfigureModelsItem() {
	const settings = useSettings();
	return (
		<>
			<DropdownMenuSeparator />
			<DropdownMenuItem
				onSelect={() => settings.open("models")}
				className="py-1"
			>
				<Settings />
				Configure models
			</DropdownMenuItem>
		</>
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
				className={buttonVariants({
					variant: "secondary",
					size: "2xs",
					className: "ml-auto",
				})}
			>
				<Link aria-hidden="true" className="size-2.5" />
				Connect
			</span>
		</SimpleTooltip>
	);
}

/** The side panel's face for a model menu: the Select look, muted while the model is only inherited. */
export function ModelPanelTrigger({
	model,
	label,
	inherited = false,
	className,
	...props
}: ComponentProps<"button"> & {
	model: ModelRef;
	label: string;
	inherited?: boolean;
}) {
	return (
		<SelectMenuTrigger
			aria-label={`${label}: ${modelLabel(model)}`}
			className={cn("min-w-0", className)}
			{...props}
		>
			<ProviderIcon
				provider={model.provider}
				size={ICON_SIZES.header}
				className={cn(inherited && "opacity-70")}
			/>
			<span
				className={cn("min-w-0 truncate", inherited && "text-muted-foreground")}
			>
				{model.model}
			</span>
		</SelectMenuTrigger>
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
