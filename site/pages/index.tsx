import { AxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import useSWR from 'swr';

import fetch from '../src/fetch';

import ErrorSnackbar from '../components/ErrorSnackbar';
import CenterCard from '../components/ui/CenterCard';
import Button from '../components/ui/forms/Button';
import Input from '../components/ui/forms/Input';
import CardTitle from '../components/ui/CardTitle';

export default function Home() {
	const router = useRouter();
	const roomPassword = useRef<HTMLInputElement>(null);
	const [error, setError] = useState<Error>();
	const {
		data, error: requestError, mutate, isValidating
	} = useSWR<string[], AxiosError>('/rooms');

	return (
		<>
			<CenterCard>
				<CardTitle isValidating = {isValidating} title = "what's up dog?"
					data = {data}>
					{
						(rooms: string[]) => (rooms.length > 0
							? (
								<Link href = "/rooms">
									<a className = "text-lg text-gray-500 hover:text-gray-700 font-semibold">
										your rooms
										<i className = "fas fa-arrow-right" />
									</a>
								</Link>
							)
							: <></>)
					}
				</CardTitle>
				<form onSubmit = {async event => {
					event.preventDefault();

					try {
						const res = await fetch.post('/rooms', { password: roomPassword.current?.value });
						router.push(`/${res.data.id}`);
						mutate();
					} catch (e) {
						setError(e);
					}
				}}
				>
					<label htmlFor = "password" className = "sr-only">
						Password
					</label>
					<Input id = "password" type = "password"
						placeholder = "password (optional)" ref = {roomPassword}
						autoComplete = "false" />
					<Button primary type = "submit">
						create room
					</Button>
				</form>
				<div className = "flex flex-row justify-end content-center mt-4 text-gray-400 space-x-3">
					<a className = "block hover:text-gray-700" href = "https://github.com/appellation/updog"
						target = "_blank"
						rel = "noreferrer">
						<i className = "fab fa-github" />
					</a>
				</div>
			</CenterCard>
			<ErrorSnackbar message = {error?.message || requestError?.message} />
		</>
	);
}
