type LogLevel = "info" | "warn" | "error";

const log = (level: LogLevel, source: string, context?: object) => {
	const timestamp = new Date().toISOString();
	const content = `[${level}] ${timestamp} ${source}: ${JSON.stringify(context, null, 2)}`;

	switch (level) {
		case "info":
			console.info(content);
			break;
		case "warn":
			console.warn(content);
			break;
		case "error":
			console.error(content);
			break;
	}
};

export const Logger = {
	info: (source: string, context?: object) => log("info", source, context),
	warn: (source: string, context?: object) => log("warn", source, context),
	error: (source: string, context?: object) => log("error", source, context),
};
