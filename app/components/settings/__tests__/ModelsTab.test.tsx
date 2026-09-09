import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { BYOKProvider } from "@/lib/connectors/providerCatalog";
import type { ProviderKeyRecord } from "@/lib/connectors/providerKey";

// --- shared, hoisted so the vi.mock factories can reach them -----------------

const account = vi.hoisted(() => ({ current: {} as Record<string, unknown> }));
const keyFor = vi.hoisted(() => ({ current: {} as Record<string, unknown> }));
const settingsOpen = vi.hoisted(() => ({ current: vi.fn() }));

vi.mock("@/lib/user/useAccount", () => ({
	useAccount: <T,>(selector: (state: Record<string, unknown>) => T): T =>
		selector(account.current),
}));

vi.mock("@/lib/settings/useSettings", () => ({
	useSettings: () => ({
		tab: null as null,
		provider: null as null,
		open: (...args: unknown[]) => settingsOpen.current(...args),
		close: vi.fn(),
	}),
}));

vi.mock("@/app/components/models/useProviderKeys", () => ({
	useProviderKey: (provider: BYOKProvider) => keyFor.current[provider] ?? null,
	useProviderKeyLookup: () => (provider: BYOKProvider) =>
		keyFor.current[provider] ?? null,
}));

vi.mock("@/app/components/settings/ProviderKeyForm", () => ({
	ProviderKeyForm: (props: {
		provider: BYOKProvider;
		onSaved: () => void;
		onCancel: () => void;
	}) => <div data-provider-key-form data-provider={props.provider} />,
}));

vi.mock("@/components/ui/confirm-delete-dialog", () => ({
	ConfirmDeleteDialog: () => null,
}));

vi.mock("@/app/components/models/ProviderIcon", () => ({
	ProviderIcon: ({ provider }: { provider: BYOKProvider }) => (
		<span data-provider-icon data-provider={provider} />
	),
}));

vi.mock("@/app/components/models/ModelChips", () => ({
	ModelChips: () => null,
}));
vi.mock("@/app/components/models/ModelDefaultControl", () => ({
	ModelDefaultControl: () => null,
}));
vi.mock("@/lib/connectors/modelGroups", () => ({ MODEL_GROUPS: [] }));

// -----------------------------------------------------------------------------

import { ModelsTab } from "../ModelsTab";

const KEY: ProviderKeyRecord = {
	provider: "anthropic",
	last4: "1234",
	status: "valid",
	verifiedAt: null,
	createdAt: "2026-01-01",
};

function renderTab({
	selected,
	dismissed,
}: {
	selected: BYOKProvider | null;
	dismissed: Set<BYOKProvider>;
}) {
	return renderToStaticMarkup(
		<ModelsTab
			selected={selected}
			dismissed={dismissed}
			onDismissForm={() => {}}
			onAddProviders={() => {}}
		/>,
	);
}

describe("ModelsTab forwards the dismissed set into ProviderCard", () => {
	beforeEach(() => {
		keyFor.current = { anthropic: KEY };
		account.current = {
			models: {},
			setModels: vi.fn(),
			resetModels: vi.fn(),
			providerKeys: [KEY],
			testKey: vi.fn(),
			removeKey: vi.fn(),
		};
		settingsOpen.current = vi.fn();
	});

	it("opens the form for a selected keyed provider that has not been dismissed (the bug's remount condition)", () => {
		const html = renderTab({ selected: "anthropic", dismissed: new Set() });
		expect(html).toContain("data-provider-key-form");
		expect(html).toContain('data-provider="anthropic"');
	});

	it("does not reopen the form on a remount once the provider was dismissed", () => {
		// This is exactly the Add→Back state after Save/Cancel: `?provider`
		// is still set (selected=anthropic) and anthropic is keyed, but the
		// per-session dismissed set now contains anthropic.
		const html = renderTab({
			selected: "anthropic",
			dismissed: new Set<BYOKProvider>(["anthropic"]),
		});
		expect(html).not.toContain("data-provider-key-form");
		// the passive view aids still apply, and the explicit "Replace key"
		// affordance remains available.
		expect(html).toContain("ring-1 ring-accent");
		expect(html).toContain("Replace key");
	});

	it("dismisses only the named provider, leaving a selected sibling's form open", () => {
		const SIBLING: ProviderKeyRecord = {
			provider: "runware",
			last4: "4321",
			status: "valid",
			verifiedAt: null,
			createdAt: "2026-01-02",
		};
		account.current = {
			...account.current,
			providerKeys: [KEY, SIBLING],
		};
		keyFor.current = { anthropic: KEY, runware: SIBLING };
		// anthropic dismissed, runware selected and not dismissed.
		const html = renderTab({
			selected: "runware",
			dismissed: new Set<BYOKProvider>(["anthropic"]),
		});
		// runware (selected, not dismissed) opens its form...
		expect(html).toContain('data-provider="runware"');
		expect(html).toContain("data-provider-key-form");
	});
});
