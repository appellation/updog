import { Icon } from "@iconify/react";
import { useUserMedia } from "../../src/context/UserMedia";
import UserMediaControl from "./UserMediaControl";

function VideoControl() {
	const { camera } = useUserMedia();

	if (!camera) {
		return null;
	}

	return (
		<UserMediaControl src={camera}>
			<Icon icon='mdi:video' />
		</UserMediaControl>
	);
}

export default VideoControl;
