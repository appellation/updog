import { makeAutoObservable } from 'mobx';
import CameraMediaSource from './media/CameraMediaSource';
import MicMediaSource from './media/MicMediaSource';
import ScreenMediaSource from './media/ScreenMediaSource';
import UserMediaSource from './UserMediaSource';

export default class UserMedia {
	public readonly camera: UserMediaSource = new CameraMediaSource();
	public readonly screen: UserMediaSource = new ScreenMediaSource();
	public readonly mic: UserMediaSource = new MicMediaSource();

	constructor() {
		makeAutoObservable(this);
	}

	public get availableStreams(): UserMediaSource[] {
		return [
			this.camera,
			this.screen,
			this.mic
		].filter(media => media.available);
	}
}
