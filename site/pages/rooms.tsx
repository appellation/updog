import { Icon } from "@iconify/react";
import type { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import useSWR from "swr";
import ErrorSnackbar from "../components/ErrorSnackbar";
import CardTitle from "../components/ui/CardTitle";
import CenterCard from "../components/ui/CenterCard";

function ListLink({ id }: { id: string; }) {
	return (
		<li key={id}>
			<Link href={`/${id}`}>
				{id}
			</Link>
		</li>
	);
}

export default function RoomsList() {
	const router = useRouter();
	const { data, error, isValidating } = useSWR<string[], AxiosError>("/rooms");
	return (
		<>
			<CenterCard>
				<CardTitle
					isValidating={isValidating}
					title={(
						<div className='flex items-center'>
							<button
								className='text-gray-500 mr-6 hover:text-gray-700 font-semibold' onClick={() => router.back()}
								type='button'
							>
								<Icon icon='mdi:arrow-left-thick' />
							</button>
							<p>
								your rooms
							</p>
						</div>
					)}
				/>
				{
					!error && data && Array.isArray(data) &&
					<ul className='mt-6 list-disc list-inside ml-3'>
						{data.map((id: string) => <ListLink id={id} key={id} />)}
					</ul>
				}
			</CenterCard>
			<ErrorSnackbar message={error?.message} />
		</>
	);
}
