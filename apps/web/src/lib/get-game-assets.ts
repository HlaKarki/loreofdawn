/**
 * Utility functions to get game asset paths (role icons, lane icons, etc.)
 * Icons are stored in /public/images/
 */

/**
 * Maps role names to their icon paths
 */
const ROLE_ICON_MAP: Record<string, string> = {
	fighter: "/images/fighter-role.png",
	mage: "/images/mage-role.png",
	assassin: "/images/assassin-role.png",
	marksman: "/images/marksman-role.png",
	tank: "/images/tank-role.png",
	support: "/images/support-role.png",
};

/**
 * Maps lane names to their icon paths
 */
const LANE_ICON_MAP: Record<string, string> = {
	"Gold Lane": "/images/gold-lane.svg",
	"Mid Lane": "/images/mid-lane.svg",
	"Exp Lane": "/images/exp-lane.svg",
	Jungle: "/images/jungle-lane.svg",
	Roam: "/images/roam-role.svg",
};

/**
 * Get the icon path for a given role
 * @param role - The role name (e.g., "Fighter", "Mage")
 * @returns The path to the role icon, or a placeholder if not found
 */
export function getRoleIcon(r: string): string {
	const role = r.trim().toLowerCase();
	return ROLE_ICON_MAP[role] || "/placeholder.svg";
}

/**
 * Get the icon path for a given lane
 * @param lane - The lane name (e.g., "Gold Lane", "Jungle")
 * @returns The path to the lane icon, or a placeholder if not found
 */
export function getLaneIcon(lane: string): string {
	return LANE_ICON_MAP[lane] || "/placeholder.svg";
}
