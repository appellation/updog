import { useRouter } from 'next/router';
import { useRef, RefObject, useState, FormEvent } from 'react'
import { mutate } from 'swr';

import fetch from '../src/fetch';
import CenterCard from './ui/CenterCard';
import Button from './ui/forms/Button';
import Input from './ui/forms/Input';

async function joinRoom(
	event: FormEvent<HTMLFormElement>,
	id: string,
	password: RefObject<HTMLInputElement>,
	setError: (err?: string) => void
) {
	event.preventDefault();

	try {
		await fetch.put(`/rooms/${id}`, { password: password.current?.value });
		mutate('/rooms');
		setError();
	} catch (e) {
		setError(e?.toString());
	}
}

export default function JoinRoom() {
	const router = useRouter();
	const roomId = router.query.roomId as string;

	const password = useRef<HTMLInputElement>(null);
	const [error, setError] = useState<string>();

	return (
		<CenterCard>
			{error && <div>{error}</div>}
			<h1 className="text-3xl font-bold mb-6">Join Room</h1>
			<form onSubmit={event => joinRoom(event, roomId, password, setError)}>
				<label htmlFor="password">Password</label>
				<Input type="password" id="password" placeholder="Password" ref={password} />
				<Button primary type="submit">Join</Button>
			</form>
		</CenterCard>
	)
}
