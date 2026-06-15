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
			onClick={onClick}
			className="h-11 w-full gap-2.5"
		>
			<GoogleIcon />
			{children ?? "Continue with Google"}
		</Button>
	);
}
