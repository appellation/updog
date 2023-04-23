import type { DocumentContext } from "next/document";
import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
	public static async getInitialProps(ctx: DocumentContext) {
		return Document.getInitialProps(ctx);
	}

	public render() {
		return (
			<Html>
				<Head />
				<body className='bg-gray-700'>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default MyDocument;
