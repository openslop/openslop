"use client";

import { useState } from "react";
import Link from "next/link";
import AuthForm from "../components/AuthForm";
import authStyles from "@/app/styles/auth.module.css";

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
						className="text-white/70 underline underline-offset-2 hover:text-white transition-colors"
					>
						Login
					</Link>
				</>
			}
		>
			<input
				type="text"
				name="fullName"
				autoComplete="name"
				placeholder="Full Name"
				value={fullName}
				onChange={(e) => setFullName(e.target.value)}
				className={authStyles.input}
				required
			/>
		</AuthForm>
	);
}
