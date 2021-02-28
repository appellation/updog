import classnames from 'classnames';
import { useState } from 'react';

import UserMediaControl from './UserMediaControl';

export interface MicControlProps {
	onNewStream: (stream: MediaStream) => void;
}

export default function MicControl(props: MicControlProps) {
	const [enabled, setEnabled] = useState(false);
	const [loading, setLoading] = useState(false);

	return <UserMediaControl
		onNewStream={props.onNewStream}
		enabled={enabled}
		setEnabled={setEnabled}
		loading={loading}
		setLoading={setLoading}
		loadStream={async () => {
			return navigator.mediaDevices.getUserMedia({ audio: true });
		}}
	>
		<i className={classnames('fas', 'fa-desktop')} />
	</UserMediaControl>;
}
