import UserMediaSource from '../UserMediaSource';

export default class ScreenMediaSource extends UserMediaSource {
	protected getMedia(): Promise<MediaStream> {
		// @ts-ignore getDisplayMedia is not defined in DOM typings
		return navigator.mediaDevices.getDisplayMedia({
			cursor: 'always',
			logicalSurface: true,
			audio: true
		});
	}
}
