import { useCamera } from "../src/context/UserMedia";
import Video from "./Video";
import MicControl from "./media/MicControl";
import ScreenControl from "./media/ScreenControl";
import VideoControl from "./media/VideoControl";

function MediaControlBar() {
	let ua: string;
	if (typeof window === "undefined") {
		ua = "";
	} else {
		ua = window.navigator.userAgent;
	}

	const isCameraEnabled = useCamera((state) => state.isEnabled);
	const cameraStream = useCamera((state) => state.stream);

	return (
		<div className='fixed bottom-0 bg-gray-900 w-full flex flex-row items-center flex-nowrap'>
			<div className='flex flex-grow content-center justify-center'>
				<MicControl />
				<VideoControl />
				<ScreenControl />
			</div>
			<Video
				className='h-24' id={ua}
				isVisible={isCameraEnabled()}
				src={cameraStream}
			/>
		</div>
	);
}

export default MediaControlBar;
