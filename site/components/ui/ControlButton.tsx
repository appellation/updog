import classNames from "classnames";
import type { Transition } from "framer-motion";
import { motion } from "framer-motion";
import type { PropsWithChildren } from "react";

export type ControlButtonProps = {
	isSelected?: boolean;
	onClick?(): void;
};

const transition: Transition = {
	type: "spring",
	stiffness: 700,
	damping: 30,
};

export default function ControlButton({
	isSelected,
	onClick,
	children,
}: PropsWithChildren<ControlButtonProps>) {
	const switchClassNames = classNames(
		"w-20",
		"h-6",
		"flex",
		isSelected ? "justify-end" : "justify-start",
		isSelected ? "bg-green-500" : "bg-red-500",
		"transition-colors",
		"place-items-center",
		"rounded-full",
		"shadow-md",
		"mx-2",
		"focus:outline-none"
	);

	return (
		<button className={switchClassNames} onClick={onClick} type="button">
			<motion.div
				className="w-12 h-12 bg-white rounded-full flex place-items-center justify-center outline-none"
				layout
				transition={transition}
			>
				{children}
			</motion.div>
		</button>
	);
}
