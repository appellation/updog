import React, { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';

type ButtonProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
	return <button {...props} ref={ref} className="w-full p-3 rounded bg-blue-600 focus:ring hover:bg-blue-700 text-white">{props.children}</button>;
});
export default Button;
