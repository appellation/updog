import type { AxiosError } from "axios";
import { useRouter } from "next/router";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import useWebSocket from "react-use-websocket";
import SimplePeer from "simple-peer";
import useSWR from "swr";
import ClientOutput from "../components/ClientOutput";
import ErrorSnackbar from "../components/ErrorSnackbar";
import JoinRoom from "../components/JoinRoom";
import MediaControlBar from "../components/MediaControlBar";
import CenterCard from "../components/ui/CenterCard";
import { WS_API_BASE } from "../src/constants";
import { useAvailableStreams, useCameraSource, useMicSource, useScreenSource } from "../src/hooks/useMediaSource";

/* eslint-disable no-unused-vars */
enum SignalOp {
	HELLO = "Hello",
	SIGNAL = "Signal",
}
/* eslint-enable no-unused-vars */

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

	const clients = useRef(new Map<string, SimplePeer.Instance>());
	const [mustJoin, setMustJoin] = useState<boolean>(true);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		if (roomId) {
			if (data || error) {
				setLoading(false);
			}

			if (data?.includes(roomId)) {
				setMustJoin(false);
			}
		}
	}, [data, error, roomId]);

	const addStream = useCallback((stream: MediaStream) => {
		for (const peer of clients.current.values()) {
			try {
				peer.addStream(stream);
			} catch (error_) {
				if (typeof error_ === "object" && (error_ as any)?.code === "ERR_SENDER_ALREADY_ADDED") {
					peer.removeStream(stream);
					addStream(stream);
				} else {
					console.warn("error adding stream", error_);
				}
			}
		}
	}, [clients]);

	const camera = useCameraSource();
	const screen = useScreenSource();
	const mic = useMicSource();
	const availableStreams = useAvailableStreams();

	useEffect(() => {
		if (camera.stream) {
			addStream(camera.stream);
		}
	}, [camera.stream, addStream]);

	useEffect(() => {
		if (screen.stream) {
			addStream(screen.stream);
		}
	}, [screen.stream, addStream]);

	useEffect(() => {
		if (mic.stream) {
			addStream(mic.stream);
		}
	}, [mic.stream, addStream]);

	const { lastJsonMessage: packet, sendJsonMessage } = useWebSocket<Packet>(
		`${WS_API_BASE}/rooms/${router.query.roomId}`,
		undefined,
		"roomId" in router.query && !mustJoin && !loading,
	);

	useEffect(() => {
		if (!packet) {
			return;
		}

		let peer = clients.current.get(packet.client_id);
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
					console.warn(`unknown op! ${packet.op.t}`);
					return;
			}

			peer.on("signal", (data) => {
				sendJsonMessage({
					client_id: packet.client_id,
					// @ts-expect-error everything here is serializable, despite type errors to the contrary
					op: {
						// eslint-disable-next-line id-length
						t: SignalOp.SIGNAL,
						// eslint-disable-next-line id-length
						d: data,
					},
				});
			});

			peer.on("close", () => {
				clients.current.delete(packet.client_id);
			});

			peer.on("error", (err) => {
				clients.current.delete(packet.client_id);
				console.error(err);
			});

			peer.on("connect", () => {
				console.log("connected!");
			});

			for (const { stream } of availableStreams) {
				if (stream) {
					peer.addStream(stream);
				}
			}

			clients.current.set(packet.client_id, peer!);
		}

		if (packet.op.t === SignalOp.SIGNAL) {
			peer.signal(packet.op.d);
		}
	}, [clients, packet, sendJsonMessage, availableStreams]);

	if (loading) {
		return (
			<CenterCard>
				<h1 className='text-3xl font-bold'>
					Loading&hellip;
				</h1>
			</CenterCard>
		);
	}

	if (mustJoin) {
		return <JoinRoom />;
	}

	const count = clients.current.size;
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
				{[...clients.current.entries()].map(([id, peer]) => <ClientOutput key={id} peer={peer} />)}
			</div>
			<MediaControlBar />
			<ErrorSnackbar message={error?.message} />
		</>
	);
}

export default RoomId;
