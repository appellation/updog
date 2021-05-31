import { AnimateSharedLayout } from 'framer-motion';
import Head from 'next/head';
import { AppProps } from 'next/dist/next-server/lib/router/router';
import { enableStaticRendering } from 'mobx-react-lite';
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
