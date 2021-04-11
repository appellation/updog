import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';

import StateContext from '../src/state';

import MicControl from './media/MicControl';
import VideoControl from './media/VideoControl';
import Video from './Video';

function MediaControlBar() {
	const state = useContext(StateContext);
	let ua: string;
	if (typeof window === 'undefined') {
		ua = '';
	} else {
		ua = window.navigator.userAgent;
	}

	return (
		<div className="fixed bottom-0 bg-gray-900 w-full flex flex-row items-center flex-nowrap">
			<div className="flex flex-grow content-center justify-center">
				<MicControl />
				<VideoControl />
			</div>
			<Video id={ua} src={state.userMedia.camera} className="h-24" />
		</div>
	);
}

export default observer(MediaControlBar);
