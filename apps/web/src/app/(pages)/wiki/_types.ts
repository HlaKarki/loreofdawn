/**
 * Wiki-specific types
 */

export type WikiHeroProfile = {
	id: number;
	name: string;
	url_name: string;
	images: {
		painting: string;
		squarehead_big: string;
		head_big: string;
		[key: string]: string;
	};
	roles: Array<{ icon: string; title: string }>;
	lanes: Array<{ icon: string; title: string }>;
	speciality: string[];
	tagline: string;
	tale: string;
	difficulty: string | null;
	relation: {
		strong_against: Array<{
			description: string;
			heroes: Array<{ id: number; name: string; url_name: string; image: string }>;
		}>;
		weak_against: Array<{
			description: string;
			heroes: Array<{ id: number; name: string; url_name: string; image: string }>;
		}>;
		compatible_with: Array<{
			description: string;
			heroes: Array<{ id: number; name: string; url_name: string; image: string }>;
		}>;
	};
};
