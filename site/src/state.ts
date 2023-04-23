import { makeAutoObservable } from "mobx";
import { createContext } from "react";
import UserMedia from "./state/UserMedia";

export class State {
	public readonly userMedia = new UserMedia();

	public constructor() {
		makeAutoObservable(this);
	}
}

const StateContext = createContext(new State());

export default StateContext;
