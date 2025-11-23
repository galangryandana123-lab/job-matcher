import { NextAuthOptions, getServerSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { db } from "./db"

// Set NEXTAUTH_URL from VERCEL_URL if not set (for Vercel deployments)
if (!process.env.NEXTAUTH_URL) {
  if (process.env.VERCEL_URL) {
    process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`
  } else {
    process.env.NEXTAUTH_URL = 'http://localhost:3000'
  }
}

// Lazy initialization to avoid URL construction at module load time
function getAuthOptions(): NextAuthOptions {
  return {
    adapter: PrismaAdapter(db) as NextAuthOptions["adapter"],
    session: {
      strategy: "jwt",
    },
    pages: {
      signIn: "/login",
      signOut: "/",
      error: "/login",
    },
    providers: [
      CredentialsProvider({
        name: "credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email dan password diperlukan")
          }

          const user = await db.user.findUnique({
            where: { email: credentials.email },
          })

          if (!user || !user.password) {
            throw new Error("Email atau password salah")
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            throw new Error("Email atau password salah")
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          }
        },
      }),
    ],
    callbacks: {
      async session({ session, token }) {
        if (token) {
          session.user.id = token.id as string
          session.user.name = token.name
          session.user.email = token.email
          session.user.image = token.picture
        }
        return session
      },
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id
        }
        return token
      },
    },
  }
}

// Export as getter to ensure lazy initialization
export const authOptions: NextAuthOptions = getAuthOptions()

export const getAuthSession = () => getServerSession(authOptions)
