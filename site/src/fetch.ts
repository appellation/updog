import axios from 'axios';
import { API_URL } from './constants';

const client = axios.create({
	baseURL: `http://${API_URL}`,
	withCredentials: true,
});

export async function fetcher(url: string) {
	const res = await client.get(url);
	return res.data;
}

export default client;
