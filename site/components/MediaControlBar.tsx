import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect, useRef } from 'react';

import StateContext from '../src/state';

import MicControl from './media/MicControl';
import VideoControl from './media/VideoControl';

function MediaControlBar() {
	const state = useContext(StateContext);
	const userVideoOutput = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		console.log(state.userMedia.camera);
		const output = userVideoOutput.current;
		if (!output) return;

		output.srcObject = state.userMedia.camera;
		output.play();
	}, [state.userMedia.camera]);

	return (
		<div className="fixed bottom-0 bg-gray-900 w-full flex flex-row items-center flex-nowrap">
			<div className="flex flex-grow content-center justify-center">
				<MicControl />
				<VideoControl />
			</div>
			<video className="h-24" ref={userVideoOutput} />
		</div>
	);
}

export default observer(MediaControlBar);
