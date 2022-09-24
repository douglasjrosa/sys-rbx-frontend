import { useSession } from 'next-auth/react';

export default function Painel() {
  const { data: session,status } = useSession();
  return (
    <>
      <h1>Painel</h1>
      <pre>{session && JSON.stringify(session, null, 2)}</pre>
      <pre>{JSON.stringify(status, null, 2)}</pre>
    </>
  );
}
