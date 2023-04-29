import { Icon } from "@iconify/react";
import { useScreen } from "../../src/context/UserMedia";
import ControlButton from "../ui/ControlButton";

function ScreenControl() {
	const isEnabled = useScreen((state) => state.isEnabled);
	const toggle = useScreen((state) => state.toggle);

	return (
		<ControlButton isSelected={isEnabled()} onClick={toggle}>
			<Icon icon='mdi:monitor' />
		</ControlButton>
	);
}

export default ScreenControl;
