import { useEffect, useRef } from "react";
import type SimplePeer from "simple-peer";
import Video from "./Video";

export type ClientProps = {
	peer: SimplePeer.Instance;
};

export default function ClientOutput({ peer }: ClientProps) {
	const streamRef = useRef<MediaStream>(new MediaStream());

	useEffect(() => {
		const streamListener = (incoming: MediaStream) => {
			for (const track of incoming.getTracks()) {
				streamRef.current.addTrack(track);
			}
		};

		const connectListener = () => {};

		peer.on("stream", streamListener);
		peer.on("connect", connectListener);

		return () => {
			peer.off("stream", streamListener);
			peer.off("connect", connectListener);
		};
	}, [peer]);

	return (
		<Video
			className="w-full"
			id={streamRef.current.id}
			isVisible
			src={streamRef.current}
		/>
	);
}
