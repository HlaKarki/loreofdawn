let secretKey = "";

export const setClerkSecretKey = (value: string) => {
	secretKey = value;
};

export const getClerkSecretKey = () => secretKey;
