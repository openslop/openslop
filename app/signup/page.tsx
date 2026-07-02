"use client";

import { useState } from "react";
import AuthForm from "../components/AuthForm";
import { AuthFooterLink } from "../components/AuthFooterLink";
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
				<AuthFooterLink
					prompt="Already have an account?"
					href="/login"
					label="Login"
				/>
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
