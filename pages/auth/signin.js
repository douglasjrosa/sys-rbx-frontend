import { getCsrfToken } from 'next-auth/client'

export default function SignIn({ csrfToken }) {
  return (
    <form method='post' action='/api/auth/callback/credentials'>
      <input name='csrfToken' type='hidden' defaultValue={csrfToken}/>
      <label>
        Username
        <input name='email' type='text'/>
      </label>
      <label>
        Password
        <input name='password' type='password'/>
      </label>
      <button type='submit'>Sign in</button>
    </form>
  )
}

// This is the recommended way for Next.js 9.3 or newer
export async function getServerSideProps(context) {
  return {
    props: {
      csrfToken: await getCsrfToken(context)
    }
  }
}