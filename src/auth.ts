import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;

        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(
          password,
          user.passwordHash
        );
        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          agencyId: user.agencyId,
          role: user.role,
          theme: user.theme,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.agencyId = user.agencyId;
        token.role = user.role;
        token.theme = user.theme;
      } else if (token.id) {
        // Not the initial sign-in: refresh theme from the DB on every request
        // so a change on /profile applies without signing out and back in.
        // (Deliberately NOT doing this for avatarUrl - that can be a large
        // base64 string and must never end up inside the JWT session cookie.)
        const fresh = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { theme: true },
        });
        if (fresh) token.theme = fresh.theme;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.agencyId = token.agencyId as string;
        session.user.role = token.role as "ADMIN" | "AGENT";
        session.user.theme = token.theme as "LIGHT" | "DARK" | "SYSTEM";
      }
      return session;
    },
  },
});
