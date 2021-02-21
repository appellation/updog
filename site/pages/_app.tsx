import { AnimateSharedLayout } from 'framer-motion';
import Head from 'next/head';
import { AppProps } from 'next/dist/next-server/lib/router/router';
import { SWRConfig } from 'swr';

import { fetcher } from '../src/fetch';

import 'tailwindcss/tailwind.css';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
	return (
		<SWRConfig value={{ fetcher }}>
			<AnimateSharedLayout>
				<Head>
					<title>what's up dog?</title>
				</Head>
				<Component {...pageProps} />
			</AnimateSharedLayout>
		</SWRConfig>
	);
}
