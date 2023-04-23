/* eslint-disable react/prop-types */
import classnames from "classnames";
import type { ButtonHTMLAttributes, DetailedHTMLProps, FunctionComponent } from "react";
import React from "react";

type ButtonProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
	element?: FunctionComponent<this> | string;
	primary?: boolean;
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((
	{
		primary,
		element = "button",
		children,
		...rest
	},
	ref,
) => {
	const className = classnames(
		"block",
		"w-full",
		"p-3",
		"rounded",
		"focus:ring",
		"text-center",
		primary ?
			["bg-blue-600", "hover:bg-blue-700", "text-white"] :
			["border", "border-blue-600", "hover:bg-blue-500", "text-blue-600", "hover:text-white"],
	);

	return React.createElement(element, {
		...rest,
		ref,
		className,
	}, children);
});

Button.displayName = "Button";

export default Button;
