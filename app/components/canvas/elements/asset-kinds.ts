import {
	MapPin,
	Package,
	User,
	type IconComponent,
} from "@/components/ui/icon";
import type { AssetKind } from "@/lib/canvas/assets";

export const ASSET_KIND_ICONS: Record<AssetKind, IconComponent> = {
	character: User,
	location: MapPin,
	prop: Package,
};
