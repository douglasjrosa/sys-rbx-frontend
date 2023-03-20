/* eslint-disable no-undef */
/* eslint-disable no-unreachable */
/* eslint-disable no-undef */
import axios from 'axios';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

interface Credentials {
  email: string;
  password: string;
}

interface User {
  jwt: string;
  id: number;
  name: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
}

export default NextAuth({
  jwt: {
    secret: process.env.JWT_SIGNING_PRIVATE_KEY,
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 4 * 60 * 60, // 4 hours
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'test@test.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        const data = {
          identifier: credentials.email,
          password: credentials.password,
        };

        const res = await axios({
          url: process.env.NEXT_PUBLIC_STRAPI_API_URL + '/auth/local',
          method: 'POST',
          data: data,
          headers: { 'Content-Type': 'application/json' },
        });
        try {
          const { jwt, user } = await res.data;
          const { confirmed, blocked, username, id, email } = await user;
          const data = {
            jwt: jwt,
            id: id,
            name: username,
            email: email,
            confirmed: confirmed,
            blocked: blocked,
          };

          if (!jwt || !id || !username || !email) {
            throw new Error('Usuario e senha incorreto');
            return null;
          }
          return data;
        } catch (e) {
          console.log(e);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    // signOut: '/auth/signout',
    // error: '/auth/error', // Error code passed in query string as ?error=
    // verifyRequest: '/auth/verify-request', // (used for check email message)
    // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      const isSignIn = !!user;
      const actualDateInSeconds = Math.floor(Date.now() / 1000);
      const tokenExpirationInSeconds = Math.floor(4 * 60 * 60); // 4 hours

      if (isSignIn) {
        if (!user?.jwt || !user?.id || !user?.name || !user?.email) {
          return null;
        }

        token.jwt = user.jwt;
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.confirmed = user.confirmed;
        token.blocked = user.blocked;

        token.expiration = actualDateInSeconds + tokenExpirationInSeconds;
      } else {
        if (!token?.expiration || actualDateInSeconds > token.expiration) {
          return null;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (
        !token?.jwt ||
        !token?.id ||
        !token?.name ||
        !token?.email ||
        !token?.expiration
      ) {
        return null;
      }

      session.user = {
        id: token.id as string,
        name: token.name as string,
        email: token.email as string,
        confirmed: token.confirmed as boolean,
        blocked: token.blocked as boolean,
      };

      session.token = token.jwt as string;
      return session;
    },
  },
});
