import { Icon } from '@iconify/react';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';

import UserMediaControl from './UserMediaControl';
import StateContext from '../../src/state';

function VideoControl() {
	const state = useContext(StateContext);

	return (
		<UserMediaControl src = {state.userMedia.camera}>
			<Icon icon = "mdi:video" />
		</UserMediaControl>
	);
}

export default observer(VideoControl);
