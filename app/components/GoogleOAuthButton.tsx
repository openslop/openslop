import GoogleIcon from "./GoogleIcon";
import { Button } from "@/components/ui/button";

interface GoogleOAuthButtonProps {
	onClick: () => void;
	children?: React.ReactNode;
}

export default function GoogleOAuthButton({
	onClick,
	children,
}: GoogleOAuthButtonProps) {
	return (
		<Button
			type="button"
			variant="outline"
			size="cta"
			onClick={onClick}
			className="w-full gap-2.5"
		>
			<GoogleIcon />
			{children ?? "Continue with Google"}
		</Button>
	);
}
