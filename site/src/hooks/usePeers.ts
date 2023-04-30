import { useEffect, useMemo } from "react";
import SimplePeer from "simple-peer";
import { useImmer } from "use-immer";

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

export type UsePeersOptions = {
	packet: Packet | null;
	signal(packet: Packet): void;
	streams: MediaStream[];
};

export default function usePeers({ signal, packet, streams }: UsePeersOptions) {
	const [clients, updateClients] = useImmer(
		() => new Map<string, SimplePeer.Instance>()
	);

	useEffect(() => {
		for (const peer of clients.values()) {
			for (const stream of streams) {
				try {
					if (!peer.streams.includes(stream)) {
						console.log("adding stream", stream);
						peer.addStream(stream);
					}
				} catch (error_) {
					if (
						typeof error_ === "object" &&
						(error_ as any)?.code === "ERR_SENDER_ALREADY_ADDED"
					) {
					} else {
						console.warn("error adding stream", error_);
					}
				}
			}
		}
	}, [clients, streams]);

	const peer = useMemo(() => {
		if (!packet) {
			return;
		}

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
					console.warn(`unknown op! ${packet.op.t}`);
					return;
			}

			peer.on("signal", (data) => {
				signal({
					client_id: packet.client_id,
					op: {
						// eslint-disable-next-line id-length
						t: SignalOp.SIGNAL,
						// eslint-disable-next-line id-length
						d: data,
					},
				});
			});

			peer.on("close", () => {
				updateClients((clients) => void clients.delete(packet.client_id));
			});

			peer.on("error", (err) => {
				updateClients((clients) => void clients.delete(packet.client_id));
				console.error(err);
			});

			peer.on("connect", () => {
				console.log("connected!");
			});

			updateClients((clients) => void clients.set(packet.client_id, peer!));
		}

		if (peer.destroyed) {
			updateClients((clients) => void clients.delete(packet.client_id));
			return;
		}

		return peer;
	}, [clients, updateClients, signal, packet]);

	useEffect(() => {
		if (!packet) {
			return;
		}

		console.log(packet);
		if (packet.op.t === SignalOp.SIGNAL) {
			peer?.signal(packet.op.d);
		}
	}, [peer, packet]);

	return clients;
}
