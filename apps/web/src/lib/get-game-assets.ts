const ROLE_ICON_MAP: Record<string, string> = {
	fighter: "/images/fighter-role.png",
	mage: "/images/mage-role.png",
	assassin: "/images/assassin-role.png",
	marksman: "/images/marksman-role.png",
	tank: "/images/tank-role.png",
	support: "/images/support-role.png",
};

const LANE_ICON_MAP: Record<string, string> = {
	"Gold Lane": "/images/gold-lane.svg",
	"Mid Lane": "/images/mid-lane.svg",
	"Exp Lane": "/images/exp-lane.svg",
	Jungle: "/images/jungle-lane.svg",
	Roam: "/images/roam-role.svg",
};

export function getRoleIcon(r: string): string {
	const role = r.trim().toLowerCase();
	return ROLE_ICON_MAP[role] || "/placeholder.svg";
}

export function getLaneIcon(lane: string): string {
	return LANE_ICON_MAP[lane] || "/placeholder.svg";
}
