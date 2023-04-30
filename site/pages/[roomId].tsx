import type { AxiosError } from "axios";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import useWebSocket from "react-use-websocket";
import useSWR from "swr";
import ClientOutput from "../components/ClientOutput";
import ErrorSnackbar from "../components/ErrorSnackbar";
import JoinRoom from "../components/JoinRoom";
import MediaControlBar from "../components/MediaControlBar";
import CenterCard from "../components/ui/CenterCard";
import { WS_API_BASE } from "../src/constants";
import { useAvailableStreams } from "../src/context/UserMedia";
import usePeers from "../src/hooks/usePeers";

enum SignalOp {
	HELLO = "Hello",
	SIGNAL = "Signal",
}

type Payload = {
	d: any;
	t: SignalOp;
};

type Packet = {
	client_id: string;
	op: Payload;
};

function RoomId() {
	const router = useRouter();
	const roomId = router.query.roomId?.toString();

	const { data, error } = useSWR<string[], AxiosError>("/rooms");

	const [mustJoin, setMustJoin] = useState<boolean>(true);
	const [loading, setLoading] = useState<boolean>(true);

	useMemo(() => {
		if (roomId) {
			if (data || error) {
				setLoading(false);
			}

			if (data?.includes(roomId)) {
				setMustJoin(false);
			}
		}
	}, [data, error, roomId]);

	const { lastJsonMessage: packet, sendJsonMessage } =
		useWebSocket<Packet | null>(
			`${WS_API_BASE}/rooms/${router.query.roomId}`,
			undefined,
			"roomId" in router.query && !mustJoin && !loading
		);

	const streams = useAvailableStreams();
	const clients = usePeers({
		signal: sendJsonMessage,
		packet,
		streams,
	});

	if (loading) {
		return (
			<CenterCard>
				<h1 className="text-3xl font-bold">Loading&hellip;</h1>
			</CenterCard>
		);
	}

	if (mustJoin) {
		return <JoinRoom />;
	}

	const count = clients.size;
	let cols: number;
	if (count <= 1) {
		cols = 1;
	} else if (count <= 4) {
		cols = 2;
	} else {
		cols = 3;
	}

	return (
		<>
			<div className={`grid grid-cols-${cols}`}>
				{[...clients.entries()].map(([id, peer]) => (
					<ClientOutput key={id} peer={peer} />
				))}
			</div>
			<MediaControlBar />
			<ErrorSnackbar message={error?.message} />
		</>
	);
}

export default RoomId;
