import classnames from 'classnames';
import { useContext, useState } from 'react';

import UserMediaControl from './UserMediaControl';
import StateContext from '../../src/state';

export default function MicControl() {
	const [enabled, setEnabled] = useState(false);
	const [loading, setLoading] = useState(false);
	const state = useContext(StateContext);

	return <UserMediaControl
		enabled={enabled}
		setEnabled={setEnabled}
		loading={loading}
		setLoading={setLoading}
		loadStream={() => state.userMedia.requestMic()}
	>
		<i className={classnames('fas', enabled ? 'fa-microphone' : 'fa-microphone-slash')} />
	</UserMediaControl>;
}
