import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: number;
    name: string;
    email: string;
    image?: string;
    jwt?: string;
    confirmed?: boolean;
    blocked?: boolean;
    pemission?: string;
  }

  interface DefaultUser {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    pemission?: string | null;
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
    pemission?: string;
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
declare module 'next-auth' {
  interface User {
    confirmed?: boolean;
    blocked?: boolean;
    permission?: string;
  }
}
