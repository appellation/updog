import { Icon } from '@iconify/react';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';

import UserMediaControl from './UserMediaControl';
import StateContext from '../../src/state';

function ScreenControl() {
	const state = useContext(StateContext);

	return (
		<UserMediaControl src = {state.userMedia.screen}>
			<Icon icon = "mdi:monitor" />
		</UserMediaControl>
	);
}

export default observer(ScreenControl);
