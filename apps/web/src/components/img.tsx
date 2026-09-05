type ImgProps = {
	src: string;
	alt: string;
	width?: number | string;
	height?: number | string;
	priority?: boolean;
	className?: string;
	style?: React.CSSProperties;
	sizes?: string;
	onError?: React.ReactEventHandler<HTMLImageElement>;
};

export const Img = ({ src, alt, width, height, priority = false, ...rest }: ImgProps) => {
	return (
		<img
			src={src}
			alt={alt}
			width={width}
			height={height}
			loading={priority ? "eager" : "lazy"}
			decoding="async"
			{...(priority ? { fetchPriority: "high" as const } : {})}
			{...rest}
		/>
	);
};
