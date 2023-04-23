import { Icon } from "@iconify/react";
import { observer } from "mobx-react-lite";
import { useContext } from "react";
import StateContext from "../../src/state";
import UserMediaControl from "./UserMediaControl";

function MicControl() {
	const state = useContext(StateContext);

	return (
		<UserMediaControl src={state.userMedia.mic}>
			<Icon icon='mdi:microphone' />
		</UserMediaControl>
	);
}

export default observer(MicControl);
