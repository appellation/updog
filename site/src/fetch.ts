import axios from 'axios';
import { HTTP_API_BASE } from './constants';

const client = axios.create({
	baseURL: HTTP_API_BASE,
	withCredentials: true,
});

export async function fetcher(url: string) {
	const res = await client.get(url);
	return res.data;
}

export default client;
