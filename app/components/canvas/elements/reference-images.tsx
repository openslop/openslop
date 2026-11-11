import { EmptyState } from "@/components/ui/empty-state";
import { Search } from "@/components/ui/icon";

export const NoReferenceImages = () => (
	<EmptyState
		icon={Search}
		title="No reference images yet"
		description="Reference images you add show up here"
	/>
);
