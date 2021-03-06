import { AxiosError } from 'axios';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/router';
import { useCallback, useContext, useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import SimplePeer from 'simple-peer';
import useSWR from 'swr';

import CenterCard from '../components/ui/CenterCard';
import ClientOutput from '../components/ClientOutput';
import ErrorSnackbar from '../components/ErrorSnackbar';
import JoinRoom from '../components/JoinRoom';

import { WS_API_BASE } from '../src/constants';
import StateContext from '../src/state';
import MediaControlBar from '../components/MediaControlBar';

enum SignalOp {
	HELLO = 'Hello',
	SIGNAL = 'Signal',
}

interface Payload {
	t: SignalOp;
	d: any;
}

interface Packet {
	client_id: string;
	op: Payload;
}

function RoomId() {
	const router = useRouter();
	const roomId = router.query.roomId as string | undefined;

	const { data, error } = useSWR<string[], AxiosError>('/rooms');

	const [clients, setClients] = useState<Map<string, SimplePeer.Instance>>(() => new Map());
	const [mustJoin, setMustJoin] = useState<boolean>(true);
	const [loading, setLoading] = useState<boolean>(true);
	const state = useContext(StateContext);

	useEffect(() => {
		if (roomId) {
			if (data || error) setLoading(false);
			if (data?.includes(roomId)) setMustJoin(false);
		}
	}, [data, error, roomId]);

	const addStream = useCallback((stream: MediaStream) => {
		for (const peer of clients.values()) {
			try {
				(peer as any).addStream(stream);
			} catch (e) {
				if (e.code === 'ERR_SENDER_ALREADY_ADDED') {
					(peer as any).removeStream(stream);
					addStream(stream);
				} else {
					console.warn('error adding stream', e);
				}
			}
		}
	}, [clients]);

	useEffect(() => {
		const { camera } = state.userMedia;
		if (camera) addStream(camera);
	}, [addStream, state.userMedia, state.userMedia.camera]);

	useEffect(() => {
		const { screen } = state.userMedia;
		if (screen) addStream(screen);
	}, [addStream, state.userMedia, state.userMedia.screen]);

	useEffect(() => {
		const { mic } = state.userMedia;
		if (mic) addStream(mic);
	}, [addStream, state.userMedia, state.userMedia.mic]);

	const { lastJsonMessage, sendJsonMessage } = useWebSocket(
		`${WS_API_BASE}/rooms/${router.query.roomId}`,
		{},
		'roomId' in router.query && !mustJoin && !loading,
	);

	useEffect(() => {
		console.log(lastJsonMessage);

		const packet: Packet | null = lastJsonMessage;
		if (!packet) return;

		let peer = clients.get(packet.client_id);
		if (!peer) {
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

			peer.on('signal', d => {
				sendJsonMessage({ client_id: packet.client_id, op: { t: 'Signal', d } });
			});

			peer.on('close', () => {
				clients.delete(packet.client_id);
				setClients(clients);
			});

			peer.on('error', e => {
				clients.delete(packet.client_id);
				setClients(clients);
				console.error(e);
			});

			peer.on('connect', () => {
				console.log('connected!');
			});

			for (const stream of state.userMedia.availableStreams) (peer as any).addStream(stream);

			clients.set(packet.client_id, peer);
			setClients(clients);
		}

		if (packet.op.t === SignalOp.SIGNAL) peer.signal(packet.op.d);
	}, [clients, lastJsonMessage, sendJsonMessage, state.userMedia.availableStreams]);

	if (loading) {
		return (
			<CenterCard>
				<h1 className = "text-3xl font-bold">
					Loading&hellip;
				</h1>
			</CenterCard>
		);
	}

	if (mustJoin) return <JoinRoom />;

	const count = clients.size;
	let cols: number;
	if (count <= 1) cols = 1;
	else if (count <= 4) cols = 2;
	else cols = 3;

	return (
		<>
			<div className = {`grid grid-cols-${cols}`}>
				{[...clients.entries()].map(([id, peer]) => <ClientOutput key = {id} peer = {peer} />)}
			</div>
			<MediaControlBar />
			<ErrorSnackbar message = {error?.message} />
		</>
	);
}

export default observer(RoomId);
