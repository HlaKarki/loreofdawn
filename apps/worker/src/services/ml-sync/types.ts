import type { Bindings } from "@/types";

export type MlSyncEnv = Pick<
	Bindings,
	| "ML_BASE_URL"
	| "ML_FIRST_ID"
	| "ML_SECOND_ID_HERO"
	| "ML_SECOND_ID_MATCHUP"
	| "ML_SECOND_ID_META"
	| "ML_SECOND_ID_GRAPH"
>;

export type MlSyncStage = {
	name: string;
	rows: number;
	error?: string;
};

export type MlSyncSummary = {
	startedAt: string;
	durationMs: number;
	ok: boolean;
	stages: MlSyncStage[];
};

export class MlApiError extends Error {
	constructor(
		public readonly endpoint: string,
		public readonly status: number,
		public readonly apiCode?: number,
	) {
		super(`ML API ${endpoint} failed: http ${status}${apiCode !== undefined ? `, code ${apiCode}` : ""}`);
		this.name = "MlApiError";
	}
}
