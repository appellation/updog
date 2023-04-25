import { Icon } from "@iconify/react";
import { useUserMedia } from "../../src/context/UserMedia";
import UserMediaControl from "./UserMediaControl";

function ScreenControl() {
	const { screen } = useUserMedia();

	if (!screen) {
		return null;
	}

	return (
		<UserMediaControl src={screen}>
			<Icon icon='mdi:monitor' />
		</UserMediaControl>
	);
}

export default ScreenControl;
