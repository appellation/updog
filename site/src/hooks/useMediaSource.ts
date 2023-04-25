import { useRef, useState } from "react";

export type UserMediaSource = {
	available: boolean;
	end(): void;
	request(): void;
	stream?: MediaStream;
	toggle(): void;
};

function useMediaSource(getMedia: () => Promise<MediaStream>): UserMediaSource {
	const [stream, setStream] = useState<MediaStream>();
	const [available, setAvailable] = useState(false);
	const tracks = useRef<Set<MediaStreamTrack>>(new Set());

	function reset() {
		setStream(undefined);
		setAvailable(false);
	}

	async function request() {
		const stream = await getMedia();
		setAvailable(true);

		stream.onaddtrack = (ev) => {
			tracks.current.add(ev.track);
		};

		stream.onremovetrack = (ev) => {
			tracks.current.delete(ev.track);
			if (tracks.current.size === 0) {
				reset();
			}
		};

		setStream(stream);
	}

	function end() {
		const tracks = stream?.getTracks();
		if (tracks) {
			for (const track of tracks) {
				track.stop();
			}
		}

		reset();
	}

	async function toggle() {
		if (available) {
			end();
		} else {
			try {
				await request();
			} catch (error) {
				console.error(error);
			}
		}
	}

	return {
		available,
		stream,
		request,
		end,
		toggle,
	};
}

export function useCameraSource() {
	return useMediaSource(async () => navigator.mediaDevices.getUserMedia({ video: true }));
}

export function useScreenSource() {
	return useMediaSource(async () => navigator.mediaDevices.getDisplayMedia({
		// @ts-expect-error cursor isn't defined in typings
		cursor: "always",
		logicalSurface: true,
		audio: true,
	}));
}

export function useMicSource() {
	return useMediaSource(async () => navigator.mediaDevices.getUserMedia({
		audio: {
			noiseSuppression: { ideal: true },
			echoCancellation: { ideal: true },
			autoGainControl: { ideal: true },
		},
	}));
}

export function useAvailableStreams() {
	const camera = useCameraSource();
	const screen = useScreenSource();
	const mic = useMicSource();

	return [camera, screen, mic].filter((source) => source.available);
}
