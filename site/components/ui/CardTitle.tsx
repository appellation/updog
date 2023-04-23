import { Icon } from "@iconify/react";
import type { ReactNode } from "react";

export type CardTitleProps<T> = {
	children?(data: T): ReactNode;
	data?: T;
	isValidating: boolean;
	title: ReactNode;
};

export default function CardTitle<T>({ title, isValidating, data, children }: CardTitleProps<T>) {
	return (
		<div className='flex items-center mb-6'>
			<h1 className='flex-grow text-3xl font-bold'>
				{title}
			</h1>
			{isValidating ?
				<Icon icon='eos-icons:loading' /> :
				data && children?.(data)}
		</div>
	);
}
