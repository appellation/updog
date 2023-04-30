import { useRouter } from "next/router";
import type { RefObject, FormEvent } from "react";
import { useRef, useState } from "react";
import { mutate } from "swr";
import fetch from "../src/fetch";
import ErrorSnackbar from "./ErrorSnackbar";
import CenterCard from "./ui/CenterCard";
import Button from "./ui/forms/Button";
import Input from "./ui/forms/Input";

async function joinRoom(
	event: FormEvent<HTMLFormElement>,
	id: string,
	password: RefObject<HTMLInputElement>,
	setError: (err?: string) => void
) {
	event.preventDefault();

	try {
		await fetch.put(`/rooms/${id}`, { password: password.current?.value });
		await mutate("/rooms");
		setError();
	} catch (error) {
		setError(error?.toString());
	}
}

export default function JoinRoom() {
	const router = useRouter();
	const roomId = router.query.roomId as string;

	const password = useRef<HTMLInputElement>(null);
	const [error, setError] = useState<string>();

	return (
		<>
			<CenterCard>
				<h1 className="text-3xl font-bold mb-2">join room</h1>
				<p className="mb-6">
					By clicking &ldquo;join&rdquo;, you will be exposing your IP address
					to other members of this room.
				</p>
				<form
					onSubmit={async (event) =>
						joinRoom(event, roomId, password, setError)
					}
				>
					<label className="sr-only" htmlFor="password">
						Password
					</label>
					<Input
						autoComplete="false"
						id="password"
						placeholder="password"
						ref={password}
						type="password"
					/>
					<Button primary type="submit">
						join
					</Button>
				</form>
			</CenterCard>
			<ErrorSnackbar message={error} />
		</>
	);
}
