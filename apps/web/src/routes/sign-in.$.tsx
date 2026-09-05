import { SignIn } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sign-in/$")({
	component: SignInPage,
});

function SignInPage() {
	return (
		<div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
			<SignIn fallbackRedirectUrl="/" signUpUrl="/sign-up" />
		</div>
	);
}
