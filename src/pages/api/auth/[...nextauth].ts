import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';


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

        const res = await fetch(
          process.env.NEXT_PUBLIC_STRAPI_API_URL + '/auth/local',
          {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
          },
        );
        try {
          const { jwt, user } = await res.json();
          const { confirmed, blocked, username, _id, email } = await user;
          const data = {
            jwt: jwt,
            id: _id,
            name: username,
            email: email,
            confirmed: confirmed,
            blocked: blocked,
          };

          if (!jwt || !_id || !username || !email) {
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
    async jwt({ token, user }) {
      const isSignIn = !!user;
      const actualDateInSeconds = Math.floor(Date.now() / 1000);
      const tokenExpirationInSeconds = Math.floor(4 * 60 * 60); // 4 hours

      // se for login
      if (isSignIn) {
        // se nao tiver user ou não ter jwt ou não ter nome ou não ter email
        if (!user || !user.jwt || !user.name || !user.email) {
          //  mate o prosseso e desconsidere tudo
          return Promise.resolve({});
        }
        token.jwt = user.jwt;
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.confirmed = user.confirmed;
        token.blocked = user.blocked;

        token.expiration = Math.floor(
          //expiração do tokem
          actualDateInSeconds + tokenExpirationInSeconds,
        );
      } else {
        if (!token?.expiration) return Promise.resolve({}); //se não exixtir o tmpo de expiração mate a navegação
        if (actualDateInSeconds > token.expiration) return Promise.resolve({}); // se se a data atual for maior que o tmpo de expiração mate a navegação
      }
      return Promise.resolve(token);
    },
    async session({ session, token }) {
      if (
        !token?.jwt ||
        !token?.id ||
        !token?.name ||
        !token?.email ||
        !token?.expiration
      ) {
        //se não exixtir o mate a navegação
        return null;
      }

      session.token = token.twt;
      session.user = {
        id: token.id,
        name: token.name,
        email: token.email,
      };

      return session;
    },
  },
});
