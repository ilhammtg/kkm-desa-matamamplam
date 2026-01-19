import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db/prisma";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  // Removed PrismaAdapter because standard next-auth tables (Account, Session, etc.) were removed from schema
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "user@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.toLowerCase();

        // 1. Check Rate Limit
        const loginAttempt = await prisma.loginAttempt.findUnique({
          where: { identifier: email },
        });

        if (loginAttempt && loginAttempt.lockedUntil && loginAttempt.lockedUntil > new Date()) {
          throw new Error("Account is temporarily locked. Please try again later.");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: email,
          },
        });

        // Check if user exists and is active
        if (!user || !user.isActive || !user.passwordHash) {
          // Record failed attempt
          await recordFailedAttempt(email);
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          // Record failed attempt
          await recordFailedAttempt(email);
          return null;
        }

        // Reset failed attempts on success
        await prisma.loginAttempt.deleteMany({
          where: { identifier: email },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: null,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.role = token.role as Role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
};

async function recordFailedAttempt(identifier: string) {
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_MINUTES = 15;

  const attempt = await prisma.loginAttempt.findUnique({
    where: { identifier },
  });

  if (attempt) {
    const attempts = attempt.attempts + 1;
    let lockedUntil = null;

    if (attempts >= MAX_ATTEMPTS) {
      lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
    }

    await prisma.loginAttempt.update({
      where: { identifier },
      data: {
        attempts,
        lastFailed: new Date(),
        lockedUntil,
      },
    });
  } else {
    await prisma.loginAttempt.create({
      data: {
        identifier,
        attempts: 1,
        lastFailed: new Date(),
      },
    });
  }
}
