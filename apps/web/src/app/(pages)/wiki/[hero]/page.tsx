import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import GithubSlugger from "github-slugger";
import { compileMDX } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import { TableOfContents } from "../_components/table_of_content";
import { makeUrl } from "@/lib/utils.api";
import type { WikiType } from "@repo/database";
import { HeaderWiki } from "@/app/(pages)/wiki/_components/header.wiki";
import { tidyLabel } from "@/lib/utils";

type WikiPageProps = {
	params: Promise<{
		hero: string;
	}>;
};

export default async function WikiPage({ params }: WikiPageProps) {
	const resolvedParams = await params;
	const hero_name = resolvedParams.hero.toLowerCase();

	if (!hero_name) {
		notFound();
	}

	const response = await fetch(makeUrl(`/v1/wikis/${hero_name}`));

	if (response.status === 404) {
		notFound();
	}

	if (!response.ok) {
		throw new Error("Failed to load wiki data");
	}

	const wikiRecord = (await response.json()) as WikiType;

	let markdown = `<Header hero_name="${hero_name}" />\n\n`;
	markdown += wikiRecord.markdown.replaceAll('"', "");

	const titles = extractHeadings(markdown, hero_name);

	const { content } = await compileMDX({
		source: markdown,
		components: {
			Header: HeaderWiki,
		},
		options: {
			mdxOptions: {
				remarkPlugins: [remarkGfm],
				rehypePlugins: [rehypeSlug],
			},
			parseFrontmatter: true,
		},
	});

	return (
		<div className="relative">
			<div className="mx-auto flex justify-between max-w-5xl gap-10 px-4 pb-16 sm:px-6 lg:px-8">
				<article id="mdx-content" className={prose_styling}>
					{content}
				</article>
				<TableOfContents titles={titles} />
			</div>
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
	prose-img:my-0 prose-img:rounded-md
	prose-table:my-6 prose-th:font-semibold prose-thead:border-b prose-tr:border-b
	hover:prose-tr:bg-slate-50 dark:hover:prose-tr:bg-slate-800/40
	prose-pre:leading-6 prose-pre:bg-slate-100 dark:prose-pre:bg-slate-800/70
	prose-pre:border prose-pre:border-slate-200 dark:prose-pre:border-slate-700
	prose-pre:rounded-lg prose-pre:p-4
	prose-code:bg-slate-100 dark:prose-code:bg-slate-800/70
	prose-code:before:content-[none] prose-code:after:content-[none]
	prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
	`;

const extractHeadings = (markdown: string, hero_name: string) => {
	const slugger = new GithubSlugger();

	const titles = [
		{
			slug: "intro",
			label: tidyLabel(hero_name),
		},
	];

	titles.push(
		...markdown
			.split("\n")
			.map((line) => line.trim())
			.filter((line) => /^#+\s+/.test(line))
			.map((line) => ({
				slug: slugger.slug(line.replace(/^#+\s*/, "")),
				label: line,
			})),
	);

	return titles;
};
