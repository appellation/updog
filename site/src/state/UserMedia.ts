import { makeAutoObservable } from "mobx";
import type UserMediaSource from "./UserMediaSource";
import CameraMediaSource from "./media/CameraMediaSource";
import MicMediaSource from "./media/MicMediaSource";
import ScreenMediaSource from "./media/ScreenMediaSource";

export default class UserMedia {
	public readonly camera: UserMediaSource = new CameraMediaSource();

	public readonly screen: UserMediaSource = new ScreenMediaSource();

	public readonly mic: UserMediaSource = new MicMediaSource();

	public constructor() {
		makeAutoObservable(this);
	}

	public get availableStreams(): UserMediaSource[] {
		return [this.camera, this.screen, this.mic].filter((media) => media.available);
	}
}
