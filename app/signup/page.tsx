"use client";

import { useState } from "react";
import Link from "next/link";
import AuthForm from "../components/AuthForm";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
	const [fullName, setFullName] = useState("");

	return (
		<AuthForm
			heading="Sign up"
			subtitle="Create your account to start using OpenSlop"
			submitLabel="Send signup link"
			sentKind="sign-up"
			otpData={{ full_name: fullName }}
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
			<Input
				type="text"
				name="fullName"
				autoComplete="name"
				aria-label="Full name"
				placeholder="Full Name"
				value={fullName}
				onChange={(e) => setFullName(e.target.value)}
				className="h-11 rounded-xl"
				required
			/>
		</AuthForm>
	);
}
