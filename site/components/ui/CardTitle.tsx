import { ReactNode } from 'react';

export interface CardTitleProps<T> {
	isValidating: boolean;
	title: ReactNode;
	data?: T;
	children?: (data: T) => ReactNode;
}

export default function CardTitle<T>({ title, isValidating, data, children }: CardTitleProps<T>) {
	return (
		<div className="flex items-center mb-6">
			<h1 className="flex-grow text-3xl font-bold">{title}</h1>
			{isValidating ?
				<i className="text-gray-500 fas fa-circle-notch fa-spin"></i> :
				data && children?.(data)
			}
		</div>
	)
}
