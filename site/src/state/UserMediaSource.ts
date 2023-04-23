import { action, computed, makeObservable, observable, runInAction } from 'mobx';

export default abstract class UserMediaSource {
	private _raw: MediaStream | null = null;
	public get raw(): MediaStream | null {
		return this._raw ? new MediaStream(this._raw) : null;
	}

	private _available: boolean = this._raw?.active ?? false;
	public get available(): boolean {
		return this._available;
	}

	private _trackCount = 0;

	constructor() {
		makeObservable(this, {
			// @ts-ignore
			_raw: observable,
			_available: observable,
			available: computed,
			raw: computed,
			end: action,
			_reset: action
		});
	}

	public async toggle() {
		if (this._available) {
			this.end();
		} else {
			try {
				await this.request();
			} catch (e) {
				console.error(e);
			}
		}
	}

	public end(): void {
		this._raw?.getTracks()?.forEach(t => t.stop());
		this._reset();
	}

	protected abstract getMedia(): Promise<MediaStream>;

	public async request(): Promise<MediaStream> {
		const stream = await this.getMedia();
		this._trackCount = stream.getTracks().length;

		stream.onaddtrack = () => {
			this._trackCount += 1;
		};

		stream.onremovetrack = () => {
			this._trackCount -= 1;
			if (this._trackCount <= 0) this._reset();
		};

		return runInAction(() => {
			this._raw = stream;
			this._available = true;
			return stream;
		});
	}

	private _reset() {
		this._raw = null;
		this._available = false;
	}
}