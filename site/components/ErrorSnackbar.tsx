import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';

interface ErrorProps {
	message?: string;
	autoDismissTimeout?: number;
}

export default function ErrorSnackbar(props: ErrorProps) {
	const [dismissed, setDismissed] = useState(false);
	const shown = props.message !== undefined;

	useEffect(() => {
		if (props.autoDismissTimeout && shown) {
			const timer = setTimeout(() => setDismissed(true), props.autoDismissTimeout);
			return () => clearTimeout(timer);
		}
	}, [props.autoDismissTimeout, shown]);

	if (dismissed || !shown) return <></>;

	return (
		<div className = "absolute bottom-0 left-0 mb-5 ml-5 p-6 bg-red-500 flex justify-start items-baseline rounded shadow-lg text-white">
			<Icon icon = "bi:exclamation-circle-fill" />
			<p className = "block">
				{props.message}
			</p>
		</div>
	);
}
