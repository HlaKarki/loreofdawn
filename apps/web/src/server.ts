import handler from "@tanstack/react-start/server-entry";
import { setClerkSecretKey } from "./clerk-secret";

// Clerk's middleware reads CLERK_SECRET_KEY from process.env, which stayed empty on the
// deployed Worker; the binding is handed over explicitly instead.
export default {
	fetch(request: Request, env: Cloudflare.Env) {
		const url = new URL(request.url);
		if (url.hostname === "www.loreofdawn.com") {
			url.protocol = "https:";
			url.hostname = "loreofdawn.com";
			url.port = "";
			return Response.redirect(url.toString(), 301);
		}
		setClerkSecretKey(env.CLERK_SECRET_KEY);
		return handler.fetch(request);
	},
} satisfies ExportedHandler<Cloudflare.Env>;
