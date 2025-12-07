import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
	return (
		<div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
			<SignUp fallbackRedirectUrl="/" signInUrl="/sign-in" />
		</div>
	);
}
