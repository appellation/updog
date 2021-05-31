import { useContext } from 'react';

import UserMediaControl from './UserMediaControl';
import StateContext from '../../src/state';

export default function MicControl() {
	const state = useContext(StateContext);

	return (
		<UserMediaControl loadStream = {() => state.userMedia.requestMic()}>
			<i className = "fas fa-microphone" aria-label = "Microphone"
				aria-hidden = "false" />
		</UserMediaControl>
	);
}
