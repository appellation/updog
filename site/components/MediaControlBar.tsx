import { observer } from "mobx-react-lite";
import { useContext } from "react";
import StateContext from "../src/state";
import Video from "./Video";
import MicControl from "./media/MicControl";
import ScreenControl from "./media/ScreenControl";
import VideoControl from "./media/VideoControl";

function MediaControlBar() {
	const state = useContext(StateContext);
	let ua: string;
	if (typeof window === "undefined") {
		ua = "";
	} else {
		ua = window.navigator.userAgent;
	}

	return (
		<div className='fixed bottom-0 bg-gray-900 w-full flex flex-row items-center flex-nowrap'>
			<div className='flex flex-grow content-center justify-center'>
				<MicControl />
				<VideoControl />
				<ScreenControl />
			</div>
			<Video
				className='h-24' id={ua}
				src={state.userMedia.camera.raw}
			/>
		</div>
	);
}

export default observer(MediaControlBar);
