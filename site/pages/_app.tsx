import { AnimateSharedLayout } from 'framer-motion';
import { enableStaticRendering } from 'mobx-react-lite';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { SWRConfig } from 'swr';

import { fetcher } from '../src/fetch';

import 'tailwindcss/tailwind.css';

enableStaticRendering(typeof window === 'undefined');

export default function MyApp({ Component, pageProps }: AppProps) {
	return (
		<SWRConfig value = {{ fetcher }}>
			<AnimateSharedLayout>
				<Head>
					<title>
						what&apos;s up dog?
					</title>
				</Head>
				<Component {...pageProps} />
			</AnimateSharedLayout>
		</SWRConfig>
	);
}
