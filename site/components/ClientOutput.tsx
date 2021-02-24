import { useEffect, useRef, useState } from 'react';
import SimplePeer from 'simple-peer';

export interface ClientProps {
	peer: SimplePeer.Instance;
}

export default function ClientOutput(props: ClientProps) {
	const [ready, setReady] = useState(false);
	const [hasVideo, setHasVideo] = useState(false);
	const output = useRef<HTMLVideoElement>(null);
	const streamRef = useRef<MediaStream>();

	useEffect(() => {
		props.peer.on('stream', (incoming: MediaStream) => {
			if (!ready) setReady(true);
			setHasVideo(true);

			const video = output.current;
			if (!video) return;

			const stream = streamRef.current;
			if (stream) {
				for (const track of incoming.getTracks()) stream.addTrack(track.clone());
			} else {
				const newStream = new MediaStream();
				for (const track of incoming.getTracks()) newStream.addTrack(track.clone());
				streamRef.current = newStream;
				video.srcObject = newStream;
			}

			video.play().catch(e => {
				console.error(e);
				// show error
			});
		});

		props.peer.on('connect', () => {
			if (!ready) setReady(true);
		});
	}, [props.peer]);

	return (
		<div className="grid">
			{hasVideo ? <></> : <div className="w-full row-start-1 col-start-1 h-full flex justify-center items-center bg-gray-300">{ready ? <></> : <i className="fas fa-circle-notch fa-spin fa-3x"></i>}</div>}
			<video className="w-full row-start-1 col-start-1" ref={output} />
		</div>
	);

}
