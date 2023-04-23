import { observer } from 'mobx-react-lite';
import { PropsWithChildren } from 'react';

import UserMediaSource from '../../src/state/UserMediaSource';
import ControlButton from '../ui/ControlButton';

export interface UserMediaControlProps {
	src: UserMediaSource;
}

function UserMediaControl({
	src,
	children
}: PropsWithChildren<UserMediaControlProps>) {
	return (
		<ControlButton onClick = {() => src.toggle()} isSelected = {src.available}>
			{children}
		</ControlButton>
	);
}

export default observer(UserMediaControl);
