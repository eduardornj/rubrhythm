import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import type { User } from "next-auth"

interface ExtendedUser extends User {
  verified?: boolean;
  role?: string;
  isBanned?: boolean;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      verified?: boolean;
      role?: string;
      isBanned?: boolean;
    }
  }

  interface JWT {
    verified?: boolean;
    role?: string;
    isBanned?: boolean;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<ExtendedUser | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) {
          throw new Error("Invalid credentials")
        }

        const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password)

        if (!isPasswordValid) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          verified: user.verified,
          role: user.role,
          isBanned: user.isBanned
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signOut: "/",
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        if (token.sub) {
          session.user.id = token.sub;
        }
        if (token.picture) {
          session.user.image = token.picture as string;
        }
        session.user.verified = token.verified as boolean | undefined;
        session.user.role = token.role as string | undefined;
        session.user.isBanned = token.isBanned as boolean | undefined;
      }
      return session
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as ExtendedUser;
        token.verified = u.verified;
        token.role = u.role;
        token.isBanned = u.isBanned;
        if (u.image) token.picture = u.image;
      }

      // Always keep session in sync with DB (since NextAuth JWT is stateless)
      if (token.sub) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { verified: true, role: true, isBanned: true, image: true }
          });
          if (dbUser) {
            token.verified = dbUser.verified;
            token.role = dbUser.role;
            token.isBanned = dbUser.isBanned;
            if (dbUser.image) {
              token.picture = dbUser.image;
            }
          }
        } catch (e) {
          console.error("Error refreshing JWT from DB:", e);
        }
      }

      if (trigger === "update" && session?.image) {
        token.picture = session.image;
      }
      return token
    },
  },
})