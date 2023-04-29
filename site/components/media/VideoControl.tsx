import { Icon } from "@iconify/react";
import { useCamera } from "../../src/context/UserMedia";
import ControlButton from "../ui/ControlButton";

function VideoControl() {
	const isEnabled = useCamera((state) => state.isEnabled);
	const toggle = useCamera((state) => state.toggle);

	return (
		<ControlButton isSelected={isEnabled()} onClick={toggle}>
			<Icon icon='mdi:video' />
		</ControlButton>
	);
}

export default VideoControl;
