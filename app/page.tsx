import fs from "fs";
import path from "path";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import OnboardingCard from "./components/OnboardingCard";
import { AuthFooterLink } from "./components/AuthFooterLink";
import AccessCodeInput from "./components/AccessCodeInput";
import ProjectsList from "./components/projects/ProjectsList";
import { Button } from "@/components/ui/button";
import { listProviderKeys } from "@/lib/api/providerKeys";
import { PROJECT_ROW_COLUMNS, ProjectRowSchema } from "@/lib/project/api";
import { UserProvider } from "@/lib/user/UserProvider";

const icons = fs
	.readdirSync(path.join(process.cwd(), "public/icons"))
	.filter((file) => file.endsWith(".svg"))
	.sort();

export default async function Home() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (user) {
		const [{ data: projects, error }, providerKeys] = await Promise.all([
			supabase
				.from("projects")
				.select(PROJECT_ROW_COLUMNS)
				.order("updated_at", { ascending: false }),
			listProviderKeys(user),
		]);
		if (error) throw error;
		return (
			<UserProvider user={user} providerKeys={providerKeys}>
				<ProjectsList
					initialProjects={ProjectRowSchema.array().parse(projects)}
				/>
			</UserProvider>
		);
	}

	return (
		<OnboardingCard
			heading="Welcome to the OpenSlop Beta"
			subtitle="OpenSlop is your free, open-source video creator that brings together all your favorite AI tools, helping you get more done with less effort."
			extra={
				<div className="flex w-full items-center justify-center gap-3 rounded-full border border-border bg-secondary px-4 py-2.5 sm:gap-5 sm:px-6 sm:py-3">
					{icons.map((icon) => (
						<Image
							key={icon}
							src={`/icons/${icon}`}
							alt={icon.replace(".svg", "")}
							width={28}
							height={28}
							className="w-7 h-7 sm:w-8 sm:h-8"
						/>
					))}
				</div>
			}
			footer={
				<AuthFooterLink
					prompt="Already have an account?"
					href="/login"
					label="Login"
				/>
			}
		>
			<p className="text-body font-medium text-muted-foreground">
				Have an access code?
			</p>

			<AccessCodeInput />

			<Button type="button" variant="accent" size="cta" className="mt-2 w-full">
				Get Started
			</Button>
		</OnboardingCard>
	);
}
