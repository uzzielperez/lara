import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import prisma from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  basePath: "/api/auth",
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).userProfileId = userProfile.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role = userProfile.role;
      }
      return session;
    },
    async signIn({ user }) {
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
    error: "/auth/error",
  },
});
