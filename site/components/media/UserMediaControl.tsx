import { observer } from "mobx-react-lite";
import type { PropsWithChildren } from "react";
import type UserMediaSource from "../../src/state/UserMediaSource";
import ControlButton from "../ui/ControlButton";

export type UserMediaControlProps = {
	src: UserMediaSource;
};

function UserMediaControl({
	src,
	children,
}: PropsWithChildren<UserMediaControlProps>) {
	return (
		<ControlButton isSelected={src.available} onClick={async () => src.toggle()}>
			{children}
		</ControlButton>
	);
}

export default observer(UserMediaControl);
