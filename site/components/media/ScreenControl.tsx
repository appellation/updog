import { observer } from 'mobx-react-lite';
import { useContext } from 'react';

import UserMediaControl from './UserMediaControl';
import StateContext from '../../src/state';

function ScreenControl() {
	const state = useContext(StateContext);

	return (
		<UserMediaControl src = {state.userMedia.screen}>
			<i className = "fas fa-desktop" aria-label = "Screen Share"
				aria-hidden = "false" />
		</UserMediaControl>
	);
}

export default observer(ScreenControl);
