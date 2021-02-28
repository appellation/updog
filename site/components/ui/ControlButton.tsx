import { ButtonHTMLAttributes, DetailedHTMLProps, PropsWithChildren } from 'react';
import { motion } from "framer-motion";

export interface ControlButtonProps {
	onClick?: () => void;
	isSelected?: boolean;
}

export default function ControlButton(props: PropsWithChildren<ControlButtonProps>) {
	return (
		<div className="switch" onClick={props.onClick} data-isOn={props.isSelected}>
			<motion.div layout transition={spring}>
				<button className="handle">{props.children}</button>
			</motion.div>
		</div>
	);
}

const spring = {
  type: "spring",
  stiffness: 700,
  damping: 30
};
