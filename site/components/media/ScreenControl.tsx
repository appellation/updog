import { useContext } from 'react';

import UserMediaControl from './UserMediaControl';
import StateContext from '../../src/state';

export default function ScreenControl() {
	const state = useContext(StateContext);

	return <UserMediaControl
		loadStream={() => state.userMedia.requestScreen()}
	>
		<i className="fas fa-desktop" aria-label="Screen Share" aria-hidden="false" />
	</UserMediaControl>;
}
