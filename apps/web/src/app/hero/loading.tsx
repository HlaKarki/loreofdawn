"use client";
import { motion } from "motion/react";

export default function Loading() {
	return (
		<div className="flex items-center justify-center min-h-[60vh]">
			<div className="relative">
				{/* Outer rotating ring */}
				<motion.div
					className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500"
					animate={{ rotate: 360 }}
					transition={{
						duration: 1.5,
						repeat: Infinity,
						ease: "linear",
					}}
					style={{ width: 80, height: 80 }}
				/>

				{/* Inner pulsing circle */}
				<motion.div
					className="absolute inset-0 m-auto rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20"
					animate={{
						scale: [1, 1.2, 1],
						opacity: [0.5, 0.8, 0.5],
					}}
					transition={{
						duration: 2,
						repeat: Infinity,
						ease: "easeInOut",
					}}
					style={{ width: 40, height: 40 }}
				/>

				{/* Center dot */}
				<motion.div
					className="absolute inset-0 m-auto rounded-full bg-gradient-to-br from-blue-600 to-purple-600"
					animate={{
						scale: [1, 0.8, 1],
					}}
					transition={{
						duration: 2,
						repeat: Infinity,
						ease: "easeInOut",
					}}
					style={{ width: 12, height: 12 }}
				/>
			</div>
		</div>
	);
}
