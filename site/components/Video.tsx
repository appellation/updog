import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import uniqolor from 'uniqolor';

export interface VideoProps {
	id: string;
	src?: MediaStream | null;
	className?: string;
}

function Video(props: VideoProps) {
	const output = useRef<HTMLVideoElement>(null);
	const streamRef = useRef(new MediaStream());
	const [isExpanded, setIsExpanded] = useState(false);
	const [ready, setReady] = useState(false);
	const [color, setColor] = useState(uniqolor(props.id));
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const color = uniqolor(props.id);
		setColor(color);
	}, [props.id]);

	useEffect(() => {
		const el = output.current;
		if (!el) return;

		el.oncanplay = () => {
			setReady(true);
		};

		for (const track of props.src?.getTracks() ?? []) streamRef.current.addTrack(track.clone());

		if ('srcObject' in el) {
			el.srcObject = props.src ?? null;
		} else if (props.src) {
			// @ts-expect-error apparently URL.createObjectURL expects a MediaSource, but documentation
			// suggests MediaStream also works
			(el as HTMLMediaElement).src = URL.createObjectURL(props.src);
		}

		el.play();
	}, [props.src]);

	useEffect(() => {
		setIsVisible(props.src?.active === true);
	}, [props.src?.active]);

	const onClick = () => {
		setIsExpanded(!isExpanded);
	};

	const backgroundClasses = classNames(
		'w-full',
		'h-full',
		'row-start-1',
		'col-start-1',
		'flex',
		'justify-center',
		'items-center',
		{ 'text-white': !color.isLight },
	);

	const videoClasses = classNames(
		'row-start-1',
		'col-start-1',
		{ invisible: !isVisible },
		props.className,
	);

	return (
		<div className = "grid">
			{
				<div className = {backgroundClasses} style = {{ backgroundColor: color.color }}>
					{ready ? <></> : <i className = "fas fa-video-slash fa-3x"></i>}
				</div>
			}
			<video className = {videoClasses} ref = {output}
				onClick = {onClick} />
		</div>
	);
}

export default observer(Video);
