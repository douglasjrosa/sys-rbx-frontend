import { useSession } from 'next-auth/react';

export default function Painel() {
  const { data: session, status } = useSession();
  localStorage.setItem('token', JSON.stringify(session.token))
  localStorage.setItem('email', JSON.stringify(session.user.email))
  const Token = localStorage.getItem('token')
  return (
    <>
      <h1>Painel</h1>
      <pre>{session && JSON.stringify(session, null, 2)}</pre>
      <pre>{JSON.stringify(status, null, 2)}</pre>
      <pre>{JSON.stringify(JSON.parse(Token), null, 2)}</pre>
    </>
  );
}
