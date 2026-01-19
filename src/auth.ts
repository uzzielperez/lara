import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true, // Allow linking OAuth accounts to existing users with same email
    }),
    Credentials({
      name: "Staff Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const ADMIN_EMAILS = [
          "isabella@filipinas-abroad.com",
          "uzzielperez25@gmail.com",
          "lauren@filipinas-abroad.com"
        ];
        
        const email = credentials.email as string;
        const password = credentials.password as string;

        // Check if it's one of the admin emails and the password matches
        if (ADMIN_EMAILS.includes(email) && password === "LaraStaff2026!") {
          // Find or create the user in the database
          let user = await prisma.user.findUnique({
            where: { email }
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                name: email.split('@')[0],
              }
            });
          }

          return user;
        }
        
        return null;
      }
    }),
  ],
  session: { strategy: "jwt" }, // Required for Credentials provider
  basePath: "/api/auth",
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      const ADMIN_EMAILS = [
        "isabella@filipinas-abroad.com",
        "uzzielperez25@gmail.com",
        "lauren@filipinas-abroad.com"
      ];

      if (session.user && token.id) {
        const userId = token.id as string;
        
        // Ensure UserProfile exists for authenticated user
        let userProfile = await prisma.userProfile.findUnique({
          where: { userId },
        });

        if (!userProfile) {
          userProfile = await prisma.userProfile.create({
            data: {
              userId,
              role: session.user.email && ADMIN_EMAILS.includes(session.user.email) ? "ADMIN" : "USER",
            },
          });
        } else if (session.user.email && ADMIN_EMAILS.includes(session.user.email) && userProfile.role !== "ADMIN") {
          userProfile = await prisma.userProfile.update({
            where: { id: userProfile.id },
            data: { role: "ADMIN" },
          });
        }

        session.user.id = userId;
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
