import Image from "next/image";
import { providerMeta } from "@/lib/connectors/providerCatalog";
import type { ProviderKey } from "@/lib/connectors/types";
import { cn } from "@/lib/utils";

/**
 * A provider's brand mark. Marks drawn in a single flat color are painted
 * through the icon set's mask, so they take the current text color and stay
 * legible in either theme; marks with their own palette are drawn as they are.
 */
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
			<span
				aria-hidden="true"
				className={cn("icon", className)}
				style={{
					fontSize: `${size}px`,
					["--icon-mask" as string]: `url("${mark.src}")`,
				}}
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
