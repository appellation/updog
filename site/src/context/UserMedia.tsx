import type { PropsWithChildren } from "react";
import { useContext, createContext, useMemo } from "react";
import type { UserMediaSource } from "../hooks/useMediaSource";
import { useCameraSource, useMicSource, useScreenSource } from "../hooks/useMediaSource";

export type UserMedia = {
	camera: UserMediaSource | null;
	mic: UserMediaSource | null;
	screen: UserMediaSource | null;
};

const UserMediaContext = createContext({
	camera: null,
	screen: null,
	mic: null,
} as UserMedia);

export function useUserMedia() {
	return useContext(UserMediaContext);
}

export function UserMediaContextProvider({ children }: PropsWithChildren) {
	const [camera, screen, mic] = [useCameraSource(), useScreenSource(), useMicSource()];
	const value = useMemo(() => ({
		camera,
		screen,
		mic,
	}), [camera, screen, mic]);

	return (
		<UserMediaContext.Provider value={value}>
			{children}
		</UserMediaContext.Provider>
	);
}
