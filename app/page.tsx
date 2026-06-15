import fs from "fs";
import path from "path";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import OnboardingCard from "./components/OnboardingCard";
import AccessCodeInput from "./components/AccessCodeInput";
import ProjectsList from "./components/projects/ProjectsList";
import { Button } from "@/components/ui/button";
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
		const { data: projects } = await supabase
			.from("projects")
			.select("id, name, thumbnail_url, updated_at")
			.order("updated_at", { ascending: false });
		return (
			<UserProvider user={user}>
				<ProjectsList initialProjects={projects ?? []} />
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
				<>
					Already have an account?{" "}
					<Link
						href="/login"
						className="text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
					>
						Login
					</Link>
				</>
			}
		>
			<p className="text-sm font-medium text-muted-foreground">
				Have an access code?
			</p>

			<AccessCodeInput />

			<Button type="button" variant="accent" className="mt-2 h-11 w-full">
				Get Started
			</Button>
		</OnboardingCard>
	);
}
