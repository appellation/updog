import { makeAutoObservable, runInAction } from 'mobx';

export default class UserMedia {
	public camera: MediaStream | null = null;

	public screen: MediaStream | null = null;

	public mic: MediaStream | null = null;

	constructor() {
		makeAutoObservable(this);
	}

	public get availableStreams(): MediaStream[] {
		return [
			this.camera,
			this.screen,
			this.mic
		].filter((media): media is MediaStream => media !== null);
	}

	public async requestCamera(): Promise<MediaStream> {
		const stream = await navigator.mediaDevices.getUserMedia({ video: true });
		return runInAction(() => {
			this.camera = stream;
			return stream;
		});
	}

	public async requestScreen(): Promise<MediaStream> {
		// getDisplayMedia is not defined in DOM typings
		// @ts-ignore
		const stream: MediaStream = await navigator.mediaDevices.getDisplayMedia({
			cursor: 'always',
			logicalSurface: true,
			audio: true
		});

		return runInAction(() => {
			this.screen = stream;
			return stream;
		});
	}

	public async requestMic(): Promise<MediaStream> {
		const stream = await navigator.mediaDevices.getUserMedia({
			audio: {
				noiseSuppression: { ideal: true },
				echoCancellation: { ideal: true },
				autoGainControl: { ideal: true }
			}
		});

		return runInAction(() => {
			this.mic = stream;
			return stream;
		});
	}
}
