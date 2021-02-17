import React from 'react';

interface ErrorProps {
	message: string;
}

export default function ErrorComponent(props: ErrorProps) {
	return (
		<div className="absolute bottom-0 left-0 mb-5 ml-5 bg-red-600 rounded shadow-lg text-white">{props.message}</div>
	);
}
