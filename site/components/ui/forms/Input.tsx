import React, { DetailedHTMLProps, InputHTMLAttributes } from 'react';

type InputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
	return <input {...props} ref={ref} className="w-full p-3 mb-3 rounded border border-blue-400 focus:ring outline-none" />;
});
export default Input;
