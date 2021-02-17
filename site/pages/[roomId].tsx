import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import SimplePeer from 'simple-peer';
import useSWR from 'swr';

import ClientOutput from '../components/ClientOutput';
import JoinRoom from '../components/JoinRoom';
import MicControl from '../components/media/MicControl';
import VideoControl from '../components/media/VideoControl';

import { API_URL } from '../src/constants';
import fetch, { fetcher } from '../src/fetch';
import CenterCard from '../components/ui/CenterCard';

enum SignalOp {
	HELLO = 'Hello',
	SIGNAL = 'Signal',
}

interface Payload {
	t: SignalOp;
	d: any;
}

interface Packet {
	src_id: string;
	dst_id?: string;
	op: Payload;
}

export default function RoomId() {
	const router = useRouter();
	const roomId = router.query.roomId as string | undefined;

	const { data: rooms } = useSWR<string[]>('/rooms', fetcher);

	const [clients, setClients] = useState<Map<string, SimplePeer.Instance>>(() => new Map());
	const [mustJoin, setMustJoin] = useState<boolean>(true);
	const [loading, setLoading] = useState<boolean>(true);
	const [streams, setStreams] = useState<MediaStream[]>([]);

	const onNewStream = (stream: MediaStream) => {
		for (const peer of clients.values()) (peer as any).addStream(stream);
		setStreams([...streams, stream]);
	};

	useEffect(() => {
		if (roomId && rooms?.includes(roomId)) setMustJoin(false);
		else setLoading(false);
	}, [rooms, roomId]);

	const { lastJsonMessage } = useWebSocket(`ws://${API_URL}/rooms/${router.query.roomId}`, {
		onOpen: () => setLoading(false),
	}, 'roomId' in router.query && !mustJoin && rooms !== undefined);

	useEffect(() => {
		console.log(lastJsonMessage);

		const packet: Packet | null = lastJsonMessage;
		if (!packet) return;

		let peer = clients.get(packet.src_id);
		if (peer) {
			// console.log(`client ${packet.client_id} already exists!`);
		} else {
			switch (packet.op.t) {
				case SignalOp.HELLO: {
					peer = new SimplePeer({ initiator: true });
					break;
				}
				case SignalOp.SIGNAL: {
					peer = new SimplePeer({ initiator: false });
					break;
				}
				default:
					console.warn(`unknown op! ${packet}`);
					return;
			}

			peer.on('signal', data => {
				fetch.put(`/rooms/${roomId}/clients/${encodeURIComponent(packet.src_id)}`, data);
			});

			peer.on('close', () => {
				clients.delete(packet.src_id);
				setClients(clients);
			});

			peer.on('error', (e) => {
				clients.delete(packet.src_id);
				setClients(clients);
				console.error(e);
			});

			peer.on('connect', () => {
				console.log('connected!');
			});

			for (const stream of streams) (peer as any).addStream(stream);

			clients.set(packet.src_id, peer);
			setClients(clients);
		}

		if (packet.op.t === SignalOp.SIGNAL) peer.signal(packet.op.d);
	}, [lastJsonMessage]);

	if (loading) {
		return <CenterCard><h1 className="text-3xl font-bold mb-6">Loading&hellip;</h1></CenterCard>;
	}

	if (mustJoin) return <JoinRoom />;

	const count = clients.size;
	let cols: number;
	if (count <= 1) cols = 1;
	else if (count <= 4) cols = 2;
	else cols = 3;

	return (
		<>
			<div className={`grid grid-cols-${cols}`}>{[...clients.entries()].map(([id, peer]) => <ClientOutput key={id} peer={peer} />)}</div>
			<div className="fixed bottom-0 flex py-6 bg-gray-900 w-full justify-center">
				<MicControl onNewStream={onNewStream} />
				<VideoControl onNewStream={onNewStream} />
			</div>
		</>
	);
}
