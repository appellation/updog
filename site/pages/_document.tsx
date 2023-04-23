import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

class MyDocument extends Document {
	static async getInitialProps(ctx: DocumentContext) {
		return Document.getInitialProps(ctx);
	}

	render() {
		return (
			<Html>
				<Head />
				<body className = "bg-gray-700">
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default MyDocument;
