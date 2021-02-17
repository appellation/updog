import { PropsWithChildren } from 'react';

export default function CenterCard(props: PropsWithChildren<{}>) {
	return (
		<div className="flex justify-center items-center h-screen">
			<div className="bg-white rounded w-1/2 shadow-2xl h-auto p-12">
				{props.children}
			</div>
		</div>
	)
}
