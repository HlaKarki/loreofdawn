import React, { useEffect } from "react";

export const useMount = () => {
	const [isMounted, setIsMounted] = React.useState<boolean>(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	return {
		isMounted,
	};
};
