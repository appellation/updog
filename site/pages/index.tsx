import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useRef } from 'react';
import useSWR, { mutate } from 'swr';
import CenterCard from '../components/ui/CenterCard';
import fetch, { fetcher } from '../src/fetch';

export default function Home() {
  const router = useRouter();
  const roomPassword = useRef<HTMLInputElement>(null);
  const { data, error } = useSWR('/rooms', fetcher);

  return (
    <CenterCard>
      {error && <p>{error.toString()}</p>}
      {data && Array.isArray(data) ? <ol>{data.map((id: string) => <li key={id}><Link href={`/${id}`}><a>{id}</a></Link></li>)}</ol> : <p>Loading...</p>}
      <h1 className="text-3xl font-bold mb-6">My Chat</h1>
      <form onSubmit={async event => {
        event.preventDefault();

        try {
          const res = await fetch.post('/rooms', { password: roomPassword.current?.value });
          router.push(`/${res.data.id}`);
          mutate('/rooms');
        } catch (e) {
          console.error(e);
        }
      }}>
        <label htmlFor="password">Password</label>
        <input className="w-full p-3 mb-3 rounded border border-blue-400 focus:ring outline-none" id="password" type="password" placeholder="Password" ref={roomPassword} />
        <button className="w-full p-3 rounded bg-blue-600 focus:ring hover:bg-blue-700 text-white" type="submit">Create room</button>
      </form>
    </CenterCard>
  )
}
