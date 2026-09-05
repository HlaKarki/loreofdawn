import { SignUp } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sign-up/$")({
	component: SignUpPage,
});

function SignUpPage() {
	return (
		<div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
			<SignUp fallbackRedirectUrl="/" signInUrl="/sign-in" />
		</div>
	);
}
