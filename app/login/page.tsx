import AuthForm from "../components/AuthForm";

const ERRORS: Record<string, string> = {
	auth_callback_failed:
		"That login link is no longer valid. Request a new one below.",
};

export default async function LoginPage({
	searchParams,
}: {
	searchParams: Promise<{ error?: string }>;
}) {
	const { error } = await searchParams;

	return (
		<AuthForm
			heading="Login"
			subtitle="Welcome back to OpenSlop"
			submitLabel="Send login link"
			shouldCreateUser={false}
			initialError={error ? ERRORS[error] : undefined}
		/>
	);
}
