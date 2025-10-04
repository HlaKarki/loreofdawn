export type fetch_type = "hero" | "matchup" | "meta" | "graph";

export type request_body_type = {
	pageSize: number;
	pageIndex?: number;
	filters?: { field: string; operator: string; value: string | number }[];
	sorts?: { data: { field: string; order: string } }[];
	fields?: string[];
};

export interface RawHeroTypeML {
	_id: string;
	id: number;
	caption: string;
	createdAt: number;
	createdUser: string;
	data: {
		head: string;
		head_big: string;
		hero: {
			_createdAt: number;
			_updatedAt: number;
			data: {
				difficulty: string;
				head: string;
				heroid: number;
				heroskilllist: {
					skilllist: {
						"skillcd&cost": string;
						skilldesc: string;
						skillicon: string;
						skillname: string;
						skillvideo: string;
						skilltag: {
							tagname: string;
						}[];
					}[];
				}[];
				name: string;
				roadsort: {
					caption: string;
					createdAt: number;
					createdUser: string;
					data: {
						road_sort_icon: string;
						road_sort_title: string;
					};
					updatedAt: number;
					updatedUser: string;
				}[];
				roadsorticon1: string;
				roadsorticon2: string;
				roadsortlabel: string[];
				smallmap: string; // hero card
				sorticon1: string; // mage icon
				sorticon2: string; // marksman icon
				sortid: {
					data: {
						sort_icon: string; // mage icon
						sort_title: string; // mage
					};
					updatedAt: number;
					updatedUser: string;
				}[];
				painting: string;
				sortlabel: string[]; // mage, marksman
				speciality: string[]; // damage, crowd control
				story: string; // short sympnosis of the hero's story
				tale: string;
				squarehead: string;
				squareheadbig: string;
			};
		};
		hero_id: number;
		relation: {
			assist: {
				desc: string;
				target_hero: {
					data: {
						head: string;
					};
				}[];
				target_hero_id: string[];
			};
			strong: {
				desc: string;
				target_hero: {
					data: {
						head: string;
					};
				}[];
				target_hero_id: string[];
			};
			weak: {
				desc: string;
				target_hero: {
					data: {
						head: string;
					};
				}[];
				target_hero_id: string[];
			};
		};
		url: string;
	};
	updatedAt: number;
	updatedUser: string;
}

export interface HeroTypeML {
	id: number;
	name: string;
	createdAt: number;
	updatedAt: number;
	images: {
		head: string;
		head_big: string;
		painting: string;
		smallmap: string;
		squarehead: string;
		squarehead_big: string;
	};
	difficulty: string;
	skills: {
		cd: number;
		mana: number;
		description: string;
		icon: string;
		name: string;
		tags: string[]; // buff, cc, etc..
	}[];
	lane: {
		icon: string;
		title: string;
	}[];
	roles: {
		icon: string;
		title: string;
	}[];
	speciality: string[];
	tagline: string;
	tale: string;
	relation: {
		compatible_with: {
			description: string;
			heroes: { id: number; name: string; image: string }[];
		}[];
		strong_against: {
			description: string;
			heroes: { id: number; name: string; image: string }[];
		}[];
		weak_against: {
			description: string;
			heroes: { id: number; name: string; image: string }[];
		}[];
	};
	source_link: string;
}

interface matchup_sub_hero_type {
	hero: {
		data: {
			head: string;
		};
	};
	hero_appearance_rate: number;
	hero_index: number;
	hero_win_rate: number;
	heroid: number;
	increase_win_rate: number;
	min_win_rate6: number;
	min_win_rate6_8: number;
	min_win_rate8_10: number;
	min_win_rate10_12: number;
	min_win_rate12_14: number;
	min_win_rate14_16: number;
	min_win_rate16_18: number;
	min_win_rate18_20: number;
	min_win_rate20: number;
}

export interface RawMatchupTypeML {
	_createdAt: number;
	_id: string;
	_updatedAt: number;
	data: {
		bigrank: string;
		camp_type: string;
		main_hero: {
			data: {
				head: string;
				name: string;
			};
		};
		main_hero_appearance_rate: number;
		main_hero_ban_rate: number;
		main_hero_channel: {
			id: number;
		};
		main_hero_win_rate: number;
		main_heroid: number;
		match_type: string;
		sub_hero: matchup_sub_hero_type[];
		sub_hero_last: matchup_sub_hero_type[];
	};
}

interface sub_hero_type {
	index: number;
	id: number;
	name: number;
	image: string;
	pick_rate: number;
	win_rate: number;
	increase_win_rate: number;
	min_win_rate6: number;
	min_win_rate6_8: number;
	min_win_rate8_10: number;
	min_win_rate10_12: number;
	min_win_rate12_14: number;
	min_win_rate14_16: number;
	min_win_rate16_18: number;
	min_win_rate18_20: number;
	min_win_rate20: number;
}

export interface MatchupTypeML {
	name: string;
	id: number;
	pick_rate: number;
	ban_rate: number;
	win_rate: number;
	most_compatible: sub_hero_type[];
	least_compatible: sub_hero_type[];
	best_counter: sub_hero_type[];
	worst_counter: sub_hero_type[];
}

export interface RawMetaTypeML {
	_createdAt: number;
	_id: string;
	_updatedAt: number;
	data: {
		bigrank: string;
		camp_type: string;
		main_hero: {
			data: {
				head: string;
				name: string;
			};
		};
		main_hero_appearance_rate: number;
		main_hero_ban_rate: number;
		main_hero_win_rate: number;
		main_heroid: number;
		match_type: number;
		sub_hero: matchup_sub_hero_type[];
		sub_hero_last: matchup_sub_hero_type[];
	};
	id: number;
	sourceId: number;
}

export interface RawGraphTypeML {
	_createdAt: number;
	_id: string;
	_updatedAt: string;
	data: {
		bigrank: number;
		camp_type: string;
		main_heroid: number;
		match_type: string;
		win_rate: {
			app_rate: number;
			ban_rate: number;
			date: string; // e.g. 2025-09-30
			win_rate: number;
		}[];
	};
	id: number;
	sourceId: number;
}
