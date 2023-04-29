import { Icon } from "@iconify/react";
import { useMic } from "../../src/context/UserMedia";
import ControlButton from "../ui/ControlButton";

function MicControl() {
	const isEnabled = useMic((state) => state.isEnabled);
	const toggle = useMic((state) => state.toggle);

	return (
		<ControlButton isSelected={isEnabled()} onClick={toggle}>
			<Icon icon='mdi:microphone' />
		</ControlButton>
	);
}

export default MicControl;
