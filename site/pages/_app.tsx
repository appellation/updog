import type { AppProps } from "next/app";
import Head from "next/head";
import { SWRConfig } from "swr";
import { UserMediaContextProvider } from "../src/context/UserMedia";
import { fetcher } from "../src/fetch";

import "tailwindcss/tailwind.css";

export default function MyApp({ Component, pageProps }: AppProps) {
	return (
		<SWRConfig value={{ fetcher }}>
			<Head>
				<title>
					what&apos;s up dog?
				</title>
			</Head>
			<UserMediaContextProvider>
				<Component {...pageProps} />
			</UserMediaContextProvider>
		</SWRConfig>
	);
}
