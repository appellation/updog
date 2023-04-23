import { Icon } from "@iconify/react";
import type { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import useSWR from "swr";
import ErrorSnackbar from "../components/ErrorSnackbar";
import CardTitle from "../components/ui/CardTitle";
import CenterCard from "../components/ui/CenterCard";
import Button from "../components/ui/forms/Button";
import Input from "../components/ui/forms/Input";
import fetch from "../src/fetch";

export default function Home() {
	const router = useRouter();
	const roomPassword = useRef<HTMLInputElement>(null);
	const [error, setError] = useState<Error>();
	const { data, error: requestError, mutate, isValidating } = useSWR<string[], AxiosError>("/rooms");

	return (
		<>
			<CenterCard>
				<CardTitle
					data={data} isValidating={isValidating}
					title="what's up dog?"
				>
					{
						(rooms: string[]) => rooms.length > 0 ?

							<Link className='text-lg text-gray-500 hover:text-gray-700 font-semibold flex flex-row items-center' href='/rooms'>
								your rooms
								<Icon icon='mdi:arrow-right-thick' inline />
							</Link> :
							null
					}
				</CardTitle>
				<form onSubmit={async (event) => {
					event.preventDefault();

					try {
						const res = await fetch.post("/rooms", { password: roomPassword.current?.value });
						await router.push(`/${res.data.id}`);
						await mutate();
					} catch (error_) {
						if (error_ instanceof Error) {
							setError(error_);
						}
					}
				}}
				>
					<label className='sr-only' htmlFor='password'>
						Password
					</label>
					<Input
						autoComplete='false' id='password'
						placeholder='password (optional)' ref={roomPassword}
						type='password'
					/>
					<Button primary type='submit'>
						create room
					</Button>
				</form>
				<div className='flex flex-row justify-end content-center mt-4 text-gray-400 space-x-3'>
					<a
						className='block hover:text-gray-700' href='https://github.com/appellation/updog'
						rel='noreferrer'
						target='_blank'
					>
						<Icon icon='mdi:github' />
					</a>
				</div>
			</CenterCard>
			<ErrorSnackbar message={error?.message ?? requestError?.message} />
		</>
	);
}
