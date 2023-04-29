import { Icon } from "@iconify/react";
import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import uniqolor from "uniqolor";

export type VideoProps = {
	className?: string;
	id: string;
	isVisible: boolean;
	src?: MediaStream;
};

function Video({ className, id, src, isVisible }: VideoProps) {
	const output = useRef<HTMLVideoElement>(null);
	const [isExpanded, setIsExpanded] = useState(false);
	const [ready, setReady] = useState(false);
	const [color, setColor] = useState(uniqolor(id));

	useEffect(() => {
		const color = uniqolor(id);
		setColor(color);
	}, [id]);

	useEffect(() => {
		const el = output.current;
		if (!el) {
			return;
		}

		el.oncanplay = () => {
			setReady(true);
		};

		if ("srcObject" in el) {
			el.srcObject = src ?? null;
		} else if (src) {
			// @ts-expect-error apparently URL.createObjectURL expects a MediaSource, but documentation
			// suggests MediaStream also works
			(el as HTMLMediaElement).src = URL.createObjectURL(src);
		}
	}, [src]);

	const onClick = () => {
		setIsExpanded(!isExpanded);
	};

	const backgroundClasses = classNames(
		"w-full",
		"h-full",
		"row-start-1",
		"col-start-1",
		"flex",
		"justify-center",
		"items-center",
		{ "text-white": !color.isLight },
	);

	const videoClasses = classNames(
		"row-start-1",
		"col-start-1",
		{ invisible: !isVisible },
		className,
	);

	return (
		<div className='grid'>
			<div className={backgroundClasses} style={{ backgroundColor: color.color }}>
				{ready ? null : <Icon icon='mdi:video-off' />}
			</div>
			<video
				autoPlay
				className={videoClasses}
				onClick={onClick}
				ref={output}
			/>
		</div>
	);
}

export default Video;
