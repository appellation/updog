import { observer } from 'mobx-react-lite';
import { useContext } from 'react';

import UserMediaControl from './UserMediaControl';
import StateContext from '../../src/state';

function VideoControl() {
	const state = useContext(StateContext);

	return (
		<UserMediaControl src = {state.userMedia.camera}>
			<i className = "fas fa-video" aria-label = "Camera"
				aria-hidden = "false" />
		</UserMediaControl>
	);
}

export default observer(VideoControl);
