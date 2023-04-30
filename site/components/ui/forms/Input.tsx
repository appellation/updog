// eslint-disable-next-line no-use-before-define
import type { DetailedHTMLProps, InputHTMLAttributes } from "react";
import React from "react";

type InputProps = DetailedHTMLProps<
	InputHTMLAttributes<HTMLInputElement>,
	HTMLInputElement
>;

const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => (
	<input
		{...props}
		className="w-full p-3 mb-3 rounded border border-blue-400 focus:ring outline-none"
		ref={ref}
	/>
));

Input.displayName = "Input";

export default Input;
