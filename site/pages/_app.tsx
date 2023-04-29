import { enableMapSet } from "immer";
import type { AppProps } from "next/app";
import Head from "next/head";
import { SWRConfig } from "swr";
import { fetcher } from "../src/fetch";

import "tailwindcss/tailwind.css";

enableMapSet();

export default function MyApp({ Component, pageProps }: AppProps) {
	return (
		<SWRConfig value={{ fetcher }}>
			<Head>
				<title>
					what&apos;s up dog?
				</title>
			</Head>
			<Component {...pageProps} />
		</SWRConfig>
	);
}
