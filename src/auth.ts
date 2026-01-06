import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import prisma from "@/lib/prisma";

// Log configuration at startup
console.log("[Auth] Initializing NextAuth with config:", {
  hasGoogleId: !!process.env.GOOGLE_CLIENT_ID,
  hasGoogleSecret: !!process.env.GOOGLE_CLIENT_SECRET,
  hasSecret: !!(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET),
  basePath: "/api/auth",
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  basePath: "/api/auth",
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "database",
  },
  callbacks: {
    async session({ session, user }) {
      console.log("[Auth] Session callback called", { userId: user?.id });
      try {
        if (session.user && user) {
          let userProfile = await prisma.userProfile.findUnique({
            where: { userId: user.id },
          });

          if (!userProfile) {
            console.log("[Auth] Creating UserProfile for user:", user.id);
            userProfile = await prisma.userProfile.create({
              data: {
                userId: user.id,
                email: session.user.email || undefined,
                name: session.user.name || undefined,
              },
            });
          }

          session.user.id = user.id;
          (session.user as any).userProfileId = userProfile.id;
          (session.user as any).role = userProfile.role;
        }
      } catch (error) {
        console.error("[Auth] Session callback error:", error);
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      console.log("[Auth] SignIn callback called", { 
        provider: account?.provider,
        email: user?.email,
      });
      return true; // Always allow sign in, UserProfile created in session callback
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  debug: true, // Enable debug logging
});
