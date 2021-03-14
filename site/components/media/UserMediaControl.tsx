import { PropsWithChildren, useState } from 'react';

import ControlButton from '../ui/ControlButton';

export interface UserMediaControlProps {
	enabled: boolean;
	setEnabled: (enabled: boolean) => void;
	loading?: boolean;
	setLoading?: (loading: boolean) => void;
	loadStream: () => Promise<MediaStream>;
}

export default function UserMediaControl({
	enabled,
	setEnabled,
	setLoading,
	loadStream,
	children
}: PropsWithChildren<UserMediaControlProps>) {
	const [tracks, setTracks] = useState<MediaStreamTrack[]>();

	return (
		<ControlButton
			onClick={async () => {
				if (enabled) {
					if (tracks) for (const track of tracks) track.enabled = false;
					setEnabled(false);
				} else {
					setLoading?.(true);

					if (tracks) {
						for (const track of tracks) track.enabled = true;
					} else {
						try {
							const newStream = await loadStream();
							setTracks(newStream.getTracks());
						} catch (e) {
							console.error(e);
							return;
						} finally {
							setLoading?.(false);
						}
					}

					setEnabled(true);
				}
			}}
			isSelected={enabled}
		>
			{children}
		</ControlButton>
	);
}
