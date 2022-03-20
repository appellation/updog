import UserMediaSource from '../UserMediaSource';

export default class MicMediaSource extends UserMediaSource {
	protected getMedia(): Promise<MediaStream> {
		return navigator.mediaDevices.getUserMedia({
			audio: {
				noiseSuppression: { ideal: true },
				echoCancellation: { ideal: true },
				autoGainControl: { ideal: true }
			}
		});
	}
}
