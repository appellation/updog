import { useMemo } from "react";
import { create } from "zustand";

export type MediaState = Readonly<{
	disable(): void;
	enable(): Promise<void>;
	isEnabled(): boolean;
	stream?: MediaStream;
	toggle(): void;
}>;

const createMediaStore = (getMedia: () => Promise<MediaStream>) => create<MediaState>((set, get) => ({
	isEnabled() {
		return Boolean(get().stream);
	},
	toggle() {
		if (get().stream) {
			get().disable();
		} else {
			void get().enable();
		}
	},
	async enable() {
		const stream = await getMedia();

		stream.addEventListener("addtrack", console.log);
		stream.onaddtrack = console.log;

		set({ stream });
	},
	disable() {
		const stream = get().stream;
		const tracks = stream?.getTracks() ?? [];
		for (const track of tracks) {
			track.stop();
			stream?.removeTrack(track);
		}

		set({ stream: undefined });
	},
}));

export const useCamera = createMediaStore(async () => navigator.mediaDevices.getUserMedia({ video: true }));

export const useScreen = createMediaStore(async () => navigator.mediaDevices.getDisplayMedia({
	// @ts-expect-error cursor isn't defined in typings
	cursor: "always",
	logicalSurface: true,
	audio: true,
}));

export const useMic = createMediaStore(async () => navigator.mediaDevices.getUserMedia({
	audio: {
		noiseSuppression: { ideal: true },
		echoCancellation: { ideal: true },
		autoGainControl: { ideal: true },
	},
}));

export function useAvailableStreams() {
	const camera = useCamera((state) => state.stream);
	const screen = useScreen((state) => state.stream);
	const mic = useMic((state) => state.stream);

	return useMemo(() => [camera, screen, mic]
		// eslint-disable-next-line unicorn/prefer-native-coercion-functions
		.filter((stream): stream is MediaStream => Boolean(stream))
	, [camera, screen, mic]);
}
