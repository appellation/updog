import classNames from 'classnames';
import { motion, Transition } from 'framer-motion';
import { PropsWithChildren } from 'react';

export interface ControlButtonProps {
	onClick?: () => void;
	isSelected?: boolean;
}

const transition: Transition = {
	type: 'spring',
	stiffness: 700,
	damping: 30
};

export default function ControlButton({
	isSelected,
	onClick,
	children
}: PropsWithChildren<ControlButtonProps>) {
	const switchClassNames = classNames(
		'w-20',
		'h-6',
		'flex',
		isSelected ? 'justify-end' : 'justify-start',
		isSelected ? 'bg-green-500' : 'bg-red-500',
		'transition-colors',
		'place-items-center',
		'rounded-full',
		'shadow-md',
		'mx-2',
		'focus:outline-none',
	);

	return (
		<button className = {switchClassNames} onClick = {onClick}>
			<motion.div layout
				transition = {transition}
				className = "w-12 h-12 bg-white rounded-full flex place-items-center justify-center outline-none"
			>
				{children}
			</motion.div>
		</button>
	);
}
