import Image from "next/image";
import { MaskedIcon } from "@/components/ui/icon";
import { providerMeta } from "@/lib/connectors/providerCatalog";
import type { ProviderKey } from "@/lib/connectors/types";
import { cn } from "@/lib/utils";

export function ProviderIcon({
	provider,
	size = 16,
	className,
}: {
	provider: ProviderKey;
	size?: number;
	className?: string;
}) {
	const { name, mark } = providerMeta(provider);

	if (mark.masked) {
		return (
			<MaskedIcon
				mask={`url("${mark.src}")`}
				size={size}
				className={className}
			/>
		);
	}

	return (
		<Image
			src={mark.src}
			alt=""
			aria-hidden="true"
			width={size}
			height={size}
			// A vector mark at icon size: the optimizer has nothing to shrink, and
			// refuses SVG without `dangerouslyAllowSVG` anyway.
			unoptimized
			className={cn("shrink-0 rounded-[3px] object-contain", className)}
			style={{ width: size, height: size }}
			title={name}
		/>
	);
}
