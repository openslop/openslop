import fs from "fs";
import path from "path";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import OnboardingCard from "./components/OnboardingCard";
import AccessCodeInput from "./components/AccessCodeInput";
import GradientButton from "./components/GradientButton";
import ProjectsList from "./components/projects/ProjectsList";
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
				<div className="w-full flex items-center justify-center gap-3 sm:gap-5 rounded-full border border-glass-border bg-glass-fill px-4 sm:px-6 py-2.5 sm:py-3">
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
						className="text-white/70 underline underline-offset-2 hover:text-white transition-colors"
					>
						Login
					</Link>
				</>
			}
		>
			<p className="text-white/70 text-sm font-medium font-display">
				Have an access code?
			</p>

			<AccessCodeInput />

			<GradientButton type="button" className="mt-2">
				Get Started
			</GradientButton>
		</OnboardingCard>
	);
}
