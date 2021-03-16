import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document'

class MyDocument extends Document {
	static async getInitialProps(ctx: DocumentContext) {
		return Document.getInitialProps(ctx);
	}

	render() {
		return (
			<Html>
				<Head>
					<title>what's up dog?</title>
					<script src="https://kit.fontawesome.com/d4e5270bca.js" crossOrigin="anonymous"></script>
				</Head>
				<body className="bg-gray-700">
					<Main />
					<NextScript />
				</body>
			</Html>
		)
	}
}

export default MyDocument
