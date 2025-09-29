import z from "zod";

export interface WikiHTMLResponse {
	parse: {
		title: string;
		pageid: number;
		text: {
			"*": string;
		};
	};
}

export interface WikiResponseComplete {
	batchcomplete: boolean;
	query: {
		pages: {
			pageid: number;
			ns: number;
			title: string;
			revisions: {
				slots: {
					main: {
						contentmodel: string;
						contentformat: string;
						content: string;
					};
				};
			}[];
		}[];
	};
}

export const WikiJSONSchema = z.object({
	title: z.string().optional(),
	categories: z.array(z.string()).optional(),
	sections: z
		.array(
			z
				.object({
					title: z.string().optional(),
					depth: z.number().optional(),
					paragraphs: z
						.array(
							z
								.object({
									sentences: z
										.array(
											z
												.object({
													text: z.string().optional(),
												})
												.optional(),
										)
										.optional(),
								})
								.optional(),
						)
						.optional(),
					infoboxes: z
						.array(
							z
								.object({
									chinese_name: z.object({ text: z.string().optional() }).optional(),
									alias: z.object({ text: z.string().optional() }).optional(),
									born: z
										.object({
											text: z.string().optional(),
											link: z
												.array(
													z
														.object({
															text: z.string().optional(),
															links: z
																.array(
																	z
																		.object({
																			type: z.string().optional(),
																			page: z.string().optional(),
																		})
																		.optional(),
																)
																.optional(),
														})
														.optional(),
												)
												.optional(),
										})
										.optional(),
									species: z.object({ text: z.string().optional() }).optional(),
									gender: z.object({ text: z.string().optional() }).optional(),
									occupation: z.object({ text: z.string().optional() }).optional(),
									affiliation: z
										.object({
											text: z.string().optional(),
											links: z
												.array(
													z
														.object({
															type: z.string().optional(),
															page: z.string().optional(),
														})
														.optional(),
												)
												.optional(),
										})
										.optional(),
									weapons: z.object({ text: z.string().optional() }).optional(),
									abilities: z
										.object({
											text: z.string().optional(),
											links: z
												.array(
													z
														.object({
															text: z.string().optional(),
															type: z.string().optional(),
															page: z.string().optional(),
															anchor: z.string().optional(),
														})
														.optional(),
												)
												.optional(),
										})
										.optional(),
									religion: z.object({ text: z.string().optional() }).optional(),
									battles_fought: z.object({ text: z.string().optional() }).optional(),
									relationships: z.object({ text: z.string().optional() }).optional(),
									en_va: z
										.object({
											text: z.string().optional(),
											links: z
												.array(
													z
														.object({
															text: z.string().optional(),
															type: z.string().optional(),
															page: z.string().optional(),
														})
														.optional(),
												)
												.optional(),
										})
										.optional(),
									in_va: z
										.object({
											text: z.string().optional(),
											links: z
												.array(
													z
														.object({
															text: z.string().optional(),
															type: z.string().optional(),
															page: z.string().optional(),
														})
														.optional(),
												)
												.optional(),
										})
										.optional(),
									jp_va: z
										.object({
											text: z.string().optional(),
											links: z
												.array(
													z
														.object({
															text: z.string().optional(),
															type: z.string().optional(),
															page: z.string().optional(),
														})
														.optional(),
												)
												.optional(),
										})
										.optional(),
									ar_va: z
										.object({
											text: z.string().optional(),
											links: z
												.array(
													z
														.object({
															text: z.string().optional(),
															type: z.string().optional(),
															page: z.string().optional(),
														})
														.optional(),
												)
												.optional(),
										})
										.optional(),
									pt_va: z
										.object({
											text: z.string().optional(),
											links: z
												.array(
													z
														.object({
															text: z.string().optional(),
															type: z.string().optional(),
															page: z.string().optional(),
														})
														.optional(),
												)
												.optional(),
										})
										.optional(),
									ru_va: z
										.object({
											text: z.string().optional(),
											links: z
												.array(
													z
														.object({
															text: z.string().optional(),
															type: z.string().optional(),
															page: z.string().optional(),
														})
														.optional(),
												)
												.optional(),
										})
										.optional(),
									tk_va: z
										.object({
											text: z.string().optional(),
											links: z
												.array(
													z
														.object({
															text: z.string().optional(),
															type: z.string().optional(),
															page: z.string().optional(),
														})
														.optional(),
												)
												.optional(),
										})
										.optional(),
									es_va: z
										.object({
											text: z.string().optional(),
											links: z
												.array(
													z
														.object({
															text: z.string().optional(),
															type: z.string().optional(),
															page: z.string().optional(),
														})
														.optional(),
												)
												.optional(),
										})
										.optional(),
									zh_va: z
										.object({
											text: z.string().optional(),
											links: z
												.array(
													z
														.object({
															text: z.string().optional(),
															type: z.string().optional(),
															page: z.string().optional(),
														})
														.optional(),
												)
												.optional(),
										})
										.optional(),
								})
								.optional(),
						)
						.optional(),
					templates: z
						.array(
							z
								.object({
									base: z.string().optional(),
									"total-pa": z.string().optional(),
									list: z.array(z.string()).optional(),
									template: z.string().optional(),
									"variations-1": z.string().optional(),
									name: z.string().optional(),
									"skill-effect-1": z.string().optional(),
									"skill-effect-2": z.string().optional(),
									"skill-type-1": z.string().optional(),
									description: z.string().optional(),
									"atk-effects": z.string().optional(),
									"lifesteal-ratio": z.string().optional(),
									"spell-vamp-ratio": z.string().optional(),
									"level-scaling": z.string().optional(),
									"stack-scaling": z.string().optional(),
									"term-1": z.string().optional(),
									"term-2": z.string().optional(),
									"term-3": z.string().optional(),
									notes: z.string().optional(),
									cooldown: z.string().optional(),
									"mana-cost": z.string().optional(),
								})
								.optional(),
						)
						.optional(),
					lists: z
						.array(
							z
								.array(
									z
										.object({
											text: z.string().optional(),
											formatting: z
												.object({
													bold: z.array(z.string()).optional(),
													italic: z.array(z.string()).optional(),
												})
												.optional(),
											links: z
												.array(
													z
														.object({
															text: z.string().optional(),
															type: z.string().optional(),
															site: z.string().optional(),
															page: z.string().optional(),
														})
														.optional(),
												)
												.optional(),
										})
										.optional(),
								)
								.optional(),
						)
						.optional(),
				})
				.optional(),
		)
		.optional(),
});
export type WikiJSON = z.infer<typeof WikiJSONSchema>;
export type WikiSection = NonNullable<NonNullable<WikiJSON["sections"]>[number]>;

export interface RawHeroTypeMLBB {
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
				sortlabel: string[]; // mage, marksman
				speciality: string[]; // damage, crowd control
				story: string; // short sympnosis of the hero's story
				tale: string;
				squarehead: string;
				squareheadbig: string;
			};
		};
		hero_id: number;
		painting: string;
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
		};
	};
	updatedAt: number;
	updatedUser: string;
}
