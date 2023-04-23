import UserMediaSource from "../UserMediaSource";

export default class ScreenMediaSource extends UserMediaSource {
	protected async getMedia(): Promise<MediaStream> {
		return navigator.mediaDevices.getDisplayMedia({
			// @ts-expect-error cursor isn't defined in typings
			cursor: "always",
			logicalSurface: true,
			audio: true,
		});
	}
}
