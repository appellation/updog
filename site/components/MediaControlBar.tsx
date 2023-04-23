import { observer } from 'mobx-react-lite';
import { useContext } from 'react';

import Video from './Video';
import MicControl from './media/MicControl';

import ScreenControl from './media/ScreenControl';
import VideoControl from './media/VideoControl';
import StateContext from '../src/state';

function MediaControlBar() {
	const state = useContext(StateContext);
	let ua: string;
	if (typeof window === 'undefined') {
		ua = '';
	} else {
		ua = window.navigator.userAgent;
	}

	return (
		<div className = "fixed bottom-0 bg-gray-900 w-full flex flex-row items-center flex-nowrap">
			<div className = "flex flex-grow content-center justify-center">
				<MicControl />
				<VideoControl />
				<ScreenControl />
			</div>
			<Video id = {ua} src = {state.userMedia.camera.raw}
				className = "h-24" />
		</div>
	);
}

export default observer(MediaControlBar);
