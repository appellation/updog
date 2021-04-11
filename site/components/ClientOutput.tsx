import { useEffect, useRef, useState } from 'react';
import SimplePeer from 'simple-peer';

import Video from './Video';

export interface ClientProps {
	peer: SimplePeer.Instance;
}

export default function ClientOutput(props: ClientProps) {
	const [ready, setReady] = useState(false);
	const streamRef = useRef<MediaStream>(new MediaStream());

	useEffect(() => {
		const streamListener = (incoming: MediaStream) => {
			if (!ready) setReady(true);
			for (const track of incoming.getTracks()) streamRef.current.addTrack(track);
		};

		const connectListener = () => {
			if (!ready) setReady(true);
		};

		props.peer.on('stream', streamListener);
		props.peer.on('connect', connectListener);

		return () => {
			props.peer.off('stream', streamListener);
			props.peer.off('connect', connectListener);
		};
	}, [props.peer]);

	return <Video id={streamRef.current.id} src={streamRef.current} className="w-full" />;
}
