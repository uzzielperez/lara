import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }

        // Find user by email
        const user = await prisma.userProfile.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) {
          return null;
        }

        // TODO: Implement proper password verification
        // For MVP, allow login if user exists
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        // Ensure UserProfile exists for authenticated user
        let userProfile = await prisma.userProfile.findUnique({
          where: { userId: user.id },
        });

        if (!userProfile) {
          userProfile = await prisma.userProfile.create({
            data: {
              userId: user.id,
              email: session.user.email || undefined,
              name: session.user.name || undefined,
            },
          });
        }

        session.user.id = user.id;
        // Add custom fields to session
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).userProfileId = userProfile.id;
      }
      return session;
    },
    async signIn({ user }) {
      // After sign in, ensure UserProfile exists
      if (user.id) {
        const userProfile = await prisma.userProfile.findUnique({
          where: { userId: user.id },
        });

        if (!userProfile) {
          await prisma.userProfile.create({
            data: {
              userId: user.id,
              email: user.email || undefined,
              name: user.name || undefined,
            },
          });
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  session: {
    strategy: "database",
  },
});

