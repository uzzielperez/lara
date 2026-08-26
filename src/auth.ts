import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { isStaffEmail } from "@/lib/staff";
import { getPostSignInPath } from "@/lib/post-sign-in";

function staffLoginPassword(): string {
  return process.env.STAFF_LOGIN_PASSWORD ?? "LaraStaff2026!";
}

async function findUserByEmail(email: string) {
  return prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "Staff Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password).trim();

        if (!isStaffEmail(email) || password !== staffLoginPassword()) {
          return null;
        }

        let user = await findUserByEmail(email);

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: email.split("@")[0],
            },
          });
        }

        return user;
      },
    }),
  ],
  session: { strategy: "jwt" },
  basePath: "/api/auth",
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        if (user.email) token.email = user.email.toLowerCase();
      }
      if (account) {
        token.provider = account.provider;
        if (account.provider === "credentials") {
          token.isStaffSession = true;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        const userId = token.id as string;
        const provider = token.provider as string | undefined;
        const isStaffSignIn =
          provider === "credentials" || token.isStaffSession === true;
        const email = session.user.email?.toLowerCase();
        const isAdminEmail = isStaffEmail(email);

        let userProfile = await prisma.userProfile.findUnique({
          where: { userId },
        });

        if (!userProfile) {
          const role = isStaffSignIn && isAdminEmail ? "ADMIN" : "USER";
          userProfile = await prisma.userProfile.create({
            data: { userId, role },
          });
        } else if (isStaffSignIn && isAdminEmail && userProfile.role !== "ADMIN") {
          userProfile = await prisma.userProfile.update({
            where: { id: userProfile.id },
            data: { role: "ADMIN" },
          });
        }

        session.user.id = userId;
        (session.user as any).userProfileId = userProfile.id;
        (session.user as any).role = userProfile.role;
        token.role = userProfile.role;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
});
