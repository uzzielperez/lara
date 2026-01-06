import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import prisma from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  basePath: "/api/auth",
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, user }) {
      const ADMIN_EMAILS = [
        "isabella@filipinas-abroad.com",
        "uzzielperez25@gmail.com",
        "lauren@filipinas-abroad.com"
      ];

      if (session.user && user) {
        // Ensure UserProfile exists for authenticated user
        let userProfile = await prisma.userProfile.findUnique({
          where: { userId: user.id },
        });

        if (!userProfile) {
          userProfile = await prisma.userProfile.create({
            data: {
              userId: user.id,
              role: user.email && ADMIN_EMAILS.includes(user.email) ? "ADMIN" : "USER",
            },
          });
        } else if (user.email && ADMIN_EMAILS.includes(user.email) && userProfile.role !== "ADMIN") {
          // Auto-promote to admin if email matches and not already admin
          userProfile = await prisma.userProfile.update({
            where: { id: userProfile.id },
            data: { role: "ADMIN" },
          });
        }

        session.user.id = user.id;
        (session.user as any).userProfileId = userProfile.id;
        (session.user as any).role = userProfile.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
});
