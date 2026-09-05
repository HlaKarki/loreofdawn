export const resolveImageSrc = (...values: Array<string | null | undefined>) => {
	for (const value of values) {
		if (value && value.trim().length > 0) {
			return value;
		}
	}
	return "/placeholder.svg";
};
