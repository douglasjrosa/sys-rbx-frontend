import axios from "axios"
import NextAuth, { DefaultUser, JWT } from "next-auth"
import { Session } from "next-auth/core/types"
import CredentialsProvider from "next-auth/providers/credentials"

type ExtendedDefaultUser = DefaultUser & {
	id: number
	confirmed: boolean
	blocked: boolean
	pemission: string
}

export default NextAuth( {
	jwt: {
		secret: process.env.JWT_SIGNING_PRIVATE_KEY,
	},
	secret: process.env.NEXTAUTH_SECRET,
	session: {
		strategy: "jwt",
		maxAge: 4 * 60 * 60,
	},
	providers: [
		CredentialsProvider( {
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "text", placeholder: "test@test.com" },
				password: { label: "Password", type: "password" },
			},
			async authorize ( credentials: any ) {
				try {
					const data = {
						identifier: credentials.email,
						password: credentials.password,
					}
					const res = await axios( {
						url: process.env.NEXT_PUBLIC_STRAPI_API_URL + "/auth/local",
						method: "POST",
						data: data,
					} )

					const { jwt, user } = await res.data

					const { confirmed, blocked, username, id, email, pemission, primeiro_acesso } =
						await user
					const response = {
						jwt: jwt,
						id: id,
						name: username,
						email: email,
						confirmed: confirmed,
						blocked: blocked,
						pemission: pemission,
						primeiro_acesso,
					}

					if ( !jwt || !id || !username || !email ) {
						throw new Error( "Usuário e senha incorreto" )
						return null
					}
					return response
				} catch ( error ) {
					console.error( error )
					return null
				}

			},
		} ),
	],
	pages: {
		signIn: "/auth/signin",


		verifyRequest: '/auth/verify-request',

	},

	callbacks: {
		jwt: async ( { token, user } ): Promise<any> => {
			const isSignIn = !!user
			const actualDateInSeconds = Math.floor( Date.now() / 1000 )
			const tokenExpirationInSeconds = Math.floor( 4 * 60 * 60 )

			if ( isSignIn ) {
				if ( !user?.jwt || !user?.id || !user?.name || !user?.email ) {
					return null
				}

				token.jwt = user.jwt
				token.id = user.id
				token.name = user.name
				token.email = user.email
				token.confirmed = user.confirmed
				token.blocked = user.blocked
				token.pemission = user.pemission

				token.expiration = actualDateInSeconds + tokenExpirationInSeconds
			} else {
				if ( !token?.expiration ) {
					return null
				}
			}

			return token as unknown as JWT
		},
		session: async ( { session, token } ): Promise<Session | any> => {
			if (
				!token?.jwt ||
				!token?.id ||
				!token?.name ||
				!token?.email ||
				!token?.expiration ||
				!token?.pemission
			) {
				return null
			}

			session.user = {
				id: token.id as number,
				name: token.name as string,
				email: token.email as string,
				pemission: token.pemission as string,
				confirmed: token.confirmed as boolean,
				blocked: token.blocked as boolean,
			}

			session.token = token.jwt as string
			return session
		},
	},
} )
