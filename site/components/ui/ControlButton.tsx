import { ButtonHTMLAttributes, DetailedHTMLProps, PropsWithChildren } from 'react';

export interface ControlButtonProps {
	onClick?: () => void;
	isSelected?: boolean;
}

export default function ControlButton(props: PropsWithChildren<ControlButtonProps>) {
	let styles: string;
	if (props.isSelected ?? true) {
		styles = "rounded-full mx-2 h-12 w-12 flex items-center justify-center bg-white text-black";
	} else {
		styles = "rounded-full mx-2 h-12 w-12 flex items-center justify-center border border-white text-white";
	}

	return (
		<button onClick={props.onClick} className={styles}>{props.children}</button>
	);
}
