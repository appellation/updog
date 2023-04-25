import { Icon } from "@iconify/react";
import { useUserMedia } from "../../src/context/UserMedia";
import { useMicSource } from "../../src/hooks/useMediaSource";
import UserMediaControl from "./UserMediaControl";

function MicControl() {
	const { mic } = useUserMedia();

	if (!mic) {
		return null;
	}

	return (
		<UserMediaControl src={mic}>
			<Icon icon='mdi:microphone' />
		</UserMediaControl>
	);
}

export default MicControl;
