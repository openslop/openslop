import AuthForm from "../components/auth-form";

export default function LoginPage() {
	return (
		<AuthForm
			heading="Login"
			subtitle="Welcome back to OpenSlop"
			submitLabel="Send login link"
			shouldCreateUser={false}
		/>
	);
}
