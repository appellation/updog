import { motion } from 'framer-motion';
import { PropsWithChildren } from 'react';
import { CENTER_CARD, CENTER_CARD_CONTENT } from '../../src/animations';

export default function CenterCard(props: PropsWithChildren<{}>) {
	return (
		<div className = "flex justify-center items-center h-screen">
			<motion.div layoutId = {CENTER_CARD}
				layout
				className = "bg-white rounded w-1/2 shadow-2xl h-auto p-12"
				transition = {{ type: 'spring', damping: 30, stiffness: 600 }}
			>
				<motion.div layoutId = {CENTER_CARD_CONTENT}
					layout
					initial = {{ zIndex: -1, scale: 0.7 }}
					animate = {{ zIndex: 0, scale: 1 }}
					exit = {{ zIndex: -1, scale: 1.3 }}
					transition = {{ type: 'spring', damping: 30, stiffness: 600 }}
				>
					{props.children}
				</motion.div>
			</motion.div>
		</div>
	);
}
