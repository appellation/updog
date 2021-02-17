import { AppProps } from 'next/dist/next-server/lib/router/router';
import 'tailwindcss/tailwind.css';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
	return <Component {...pageProps} />;
}
