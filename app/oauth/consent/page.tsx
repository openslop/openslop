import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import OnboardingCard from "@/app/components/onboarding-card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

const SearchSchema = z.object({ authorization_id: z.string() });

async function decide(authorizationId: string, allow: boolean) {
	"use server";
	const { oauth } = (await createClient()).auth;
	const { data, error } = allow
		? await oauth.approveAuthorization(authorizationId)
		: await oauth.denyAuthorization(authorizationId);
	if (error) throw error;
	redirect(data.redirect_url);
}

/** Where Supabase's OAuth server asks the signed-in user to let an agent act as them. */
export default async function ConsentPage({
	searchParams,
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const search = SearchSchema.safeParse(await searchParams);
	if (!search.success) notFound();
	const authorizationId = search.data.authorization_id;

	const supabase = await createClient();
	const [{ data: auth }, { data, error }] = await Promise.all([
		supabase.auth.getUser(),
		supabase.auth.oauth.getAuthorizationDetails(authorizationId),
	]);
	const { user } = auth;
	if (!user) {
		const consent = `/oauth/consent?authorization_id=${encodeURIComponent(authorizationId)}`;
		redirect(`/login?next=${encodeURIComponent(consent)}`);
	}
	if (error) throw error;
	if ("redirect_url" in data) redirect(data.redirect_url);

	const agent = data.client.name;
	const returnsTo = new URL(data.redirect_uri).host;
	return (
		<OnboardingCard
			heading={`Connect ${agent}`}
			subtitle={`${agent} will work in OpenSlop as ${user.email}, on the project you have open. Allowing it sends you back to ${returnsTo}.`}
		>
			<form className="flex w-full flex-col gap-3">
				<Button
					formAction={decide.bind(null, authorizationId, true)}
					variant="accent"
					size="cta"
					className="w-full"
				>
					Allow
				</Button>
				<Button
					formAction={decide.bind(null, authorizationId, false)}
					variant="secondary"
					size="cta"
					className="w-full"
				>
					Deny
				</Button>
			</form>
		</OnboardingCard>
	);
}
