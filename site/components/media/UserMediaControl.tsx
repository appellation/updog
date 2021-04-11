import { PropsWithChildren, useState } from 'react';

import ControlButton from '../ui/ControlButton';

export interface UserMediaControlProps {
	loadStream: () => Promise<MediaStream>;
}

export default function UserMediaControl({
	loadStream,
	children
}: PropsWithChildren<UserMediaControlProps>) {
	const [enabled, setEnabled] = useState(false);
	const [loading, setLoading] = useState(false);
	const [tracks, setTracks] = useState<MediaStreamTrack[]>();

	return (
		<ControlButton
			onClick={async () => {
				if (enabled) {
					if (tracks) for (const track of tracks) track.enabled = false;
					setEnabled(false);
				} else {
					if (tracks) {
						for (const track of tracks) track.enabled = true;
					} else {
						try {
							setLoading?.(true);

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
