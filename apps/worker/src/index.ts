/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	// This runs on the cron schedule
	async scheduled(event, env, ctx) {
		try {
			const response = await fetch('https://api.loreofdawn.com/trpc/mlSync.updateDb', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${env.SECRET_TOKEN}`,
				},
				body: JSON.stringify({ input: {} }),
			});

			const responseText = await response.text();
			console.log('Response status:', response.status);
			console.log('Response body:', responseText);

			if (!response.ok) {
				console.error(`HTTP error! status: ${response.status}, body: ${responseText}`);
				throw new Error(`HTTP ${response.status}: ${responseText}`);
			}

			console.log('✓ mlSync.updateDb completed successfully');
		} catch (error) {
			console.error('Error calling mlSync.updateDb:', error);
			throw error;
		}
	},

	async fetch(request, env, ctx): Promise<Response> {
		return new Response('Cron worker is running!');
	},
} satisfies ExportedHandler<Env>;
