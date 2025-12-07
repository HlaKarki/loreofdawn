type JsonLdProps = {
	data: Record<string, unknown>;
};

export function JsonLd({ data }: JsonLdProps) {
	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
		/>
	);
}

export function WebsiteJsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: "Lore of Dawn",
		url: "https://loreofdawn.com",
		description:
			"Master Mobile Legends: Bang Bang with live meta stats, hero lore, matchup insights, and tier lists.",
		potentialAction: {
			"@type": "SearchAction",
			target: {
				"@type": "EntryPoint",
				urlTemplate: "https://loreofdawn.com/heroes?search={search_term_string}",
			},
			"query-input": "required name=search_term_string",
		},
	};

	return <JsonLd data={data} />;
}

type ArticleJsonLdProps = {
	title: string;
	description: string;
	url: string;
	datePublished?: string;
	dateModified?: string;
};

export function ArticleJsonLd({
	title,
	description,
	url,
	datePublished,
	dateModified,
}: ArticleJsonLdProps) {
	const data = {
		"@context": "https://schema.org",
		"@type": "Article",
		headline: title,
		description,
		url,
		author: {
			"@type": "Organization",
			name: "Lore of Dawn",
			url: "https://loreofdawn.com",
		},
		publisher: {
			"@type": "Organization",
			name: "Lore of Dawn",
			url: "https://loreofdawn.com",
		},
		...(datePublished && { datePublished }),
		...(dateModified && { dateModified }),
	};

	return <JsonLd data={data} />;
}

type BreadcrumbJsonLdProps = {
	items: Array<{
		name: string;
		url: string;
	}>;
};

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
	const data = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			item: item.url,
		})),
	};

	return <JsonLd data={data} />;
}

type FAQJsonLdProps = {
	questions: Array<{
		question: string;
		answer: string;
	}>;
};

export function FAQJsonLd({ questions }: FAQJsonLdProps) {
	const data = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: questions.map((q) => ({
			"@type": "Question",
			name: q.question,
			acceptedAnswer: {
				"@type": "Answer",
				text: q.answer,
			},
		})),
	};

	return <JsonLd data={data} />;
}
