import { useContext } from 'react';

import UserMediaControl from './UserMediaControl';
import StateContext from '../../src/state';

export default function VideoControl() {
	const state = useContext(StateContext);

	return <UserMediaControl
		loadStream={() => state.userMedia.requestCamera()}
	>
		<i className="fas fa-video" aria-label="Camera" aria-hidden="false" />
	</UserMediaControl>;
}
