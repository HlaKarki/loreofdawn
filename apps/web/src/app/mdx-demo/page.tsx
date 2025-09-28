import remarkGfm from "remark-gfm";
import { compileMDX } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import { serverTrpc } from "@/server/trpc";

const components = {
	Callout: ({ children }: { children: React.ReactNode }) => {
		return (
			<div className={"rounded-md border-l-4 border-sky-500 p-4 text-sky-900"}>{children}</div>
		);
	},
	Stat: ({ value, label }: { value: string; label: string }) => {
		return (
			<div className={"inline-flex flex-col items-center rounded-md border px-3 py-2 text-sm"}>
				<span className={"text-lg font-semibold"}>{value}</span>
				<span className={"text-xs uppercase tracking-wide text-muted-foreground"}>{label}</span>
			</div>
		);
	},
};

export default async function MdxDemoPage() {
	const response = await serverTrpc.dbRouter.fetchMarkdown.query({ hero: "miya" });

	if (!response[0]) {
		notFound();
	}
	const { content } = await compileMDX({
		source: response[0].markdown,
		components,
		options: {
			mdxOptions: { remarkPlugins: [remarkGfm] },
			parseFrontmatter: true,
		},
	});

	return (
		<div>
			<header></header>

			<article className={prose_styling}>{content}</article>
		</div>
	);
}

const prose_styling = `
	prose prose-slate dark:prose-invert mx-auto max-w-[820px]
	prose-h1:mb-3 prose-h1:text-3xl md:prose-h1:text-4xl
	prose-h2:mt-10 prose-h2:mb-3 prose-h2:text-2xl
	prose-h3:mt-8 prose-h3:mb-2
	prose-p:my-3 prose-li:my-1 prose-ul:my-3 prose-ol:my-3
	prose-a:no-underline hover:prose-a:underline prose-a:underline-offset-2
	prose-hr:my-8
	prose-blockquote:italic prose-blockquote:border-l-4
	prose-blockquote:border-slate-300 dark:prose-blockquote:border-slate-700
	prose-img:rounded-md
	prose-table:my-6 prose-th:font-semibold prose-thead:border-b prose-tr:border-b
	hover:prose-tr:bg-slate-50 dark:hover:prose-tr:bg-slate-800/40
	prose-pre:leading-6 prose-pre:bg-slate-100 dark:prose-pre:bg-slate-800/70
	prose-pre:border prose-pre:border-slate-200 dark:prose-pre:border-slate-700
	prose-pre:rounded-lg prose-pre:p-4
	prose-code:bg-slate-100 dark:prose-code:bg-slate-800/70
	prose-code:before:content-[none] prose-code:after:content-[none]
	prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
	`;
