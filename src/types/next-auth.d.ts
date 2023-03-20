import NextAuth, { User, JWT } from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: number;
    name: string;
    email: string;
    image?: string;
    jwt?: string;
    confirmed?: boolean;
    blocked?: boolean;
  }

  /**
   * Add additional types for your custom properties
   * in the JWT token.
   */
  interface JWT {
    id: number;
    name: string;
    email: string;
    jwt?: string;
    confirmed?: boolean;
    blocked?: boolean;
    expiration?: number;
  }

  /**
   * You can define own custom types for the session object
   * that are returned by getSession().
   */
  interface Session {
    user: User;
    token: string;
  }
}
