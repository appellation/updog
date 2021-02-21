import { AxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useRef, useState } from 'react';
import useSWR from 'swr';

import fetch from '../src/fetch';

import ErrorSnackbar from '../components/ErrorSnackbar';
import CenterCard from '../components/ui/CenterCard';
import Button from '../components/ui/forms/Button';
import Input from '../components/ui/forms/Input';
import CardTitle from '../components/ui/CardTitle';

export default function Home() {
  const router = useRouter();
  const roomPassword = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<Error>();
  const { data, error: requestError, mutate, isValidating } = useSWR<string[], AxiosError>('/rooms');

  return (
    <>
      <CenterCard>
        <CardTitle isValidating={isValidating} title="what's up dog?" data={data}>{
          (data: string[]) => data.length ? <Link href="/rooms">
            <a className="text-lg text-gray-500 hover:text-gray-700 font-semibold">
              your rooms <i className="fas fa-arrow-right"></i>
            </a>
          </Link> : <></>
        }</CardTitle>
        <form onSubmit={async event => {
          event.preventDefault();

          try {
            const res = await fetch.post('/rooms', { password: roomPassword.current?.value });
            router.push(`/${res.data.id}`);
            mutate();
          } catch (e) {
            setError(e);
          }
        }}>
          <label htmlFor="password" className="sr-only">Password</label>
          <Input id="password" type="password" placeholder="password" ref={roomPassword} />
          <Button primary type="submit">create room</Button>
        </form>
      </CenterCard>
      <ErrorSnackbar message={error?.message || requestError?.message} />
    </>
  )
}
