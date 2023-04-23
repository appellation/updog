import UserMediaSource from '../UserMediaSource';

export default class CameraMediaSource extends UserMediaSource {
	protected getMedia(): Promise<MediaStream> {
		return navigator.mediaDevices.getUserMedia({ video: true });
	}
}