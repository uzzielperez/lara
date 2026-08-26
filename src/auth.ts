import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { isStaffEmail } from "@/lib/staff";

function staffLoginPassword(): string {
  const configured = process.env.STAFF_LOGIN_PASSWORD?.trim();
  return configured && configured.length > 0 ? configured : "LaraStaff2026!";
}

function credentialString(value: unknown): string {
  if (Array.isArray(value)) return String(value[0] ?? "").trim();
  return String(value ?? "").trim();
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
      id: "credentials",
      name: "Staff Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const email = credentialString(credentials?.email).toLowerCase();
          const password = credentialString(credentials?.password);

          if (!email || !password) return null;
          if (!isStaffEmail(email)) return null;
          if (password !== staffLoginPassword()) return null;

          let user = await findUserByEmail(email);
          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                name: email.split("@")[0],
              },
            });
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error("[staff-auth] authorize failed", error);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  basePath: "/api/auth",
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ account }) {
      return true;
    },
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
          const role = isAdminEmail ? "ADMIN" : "USER";
          userProfile = await prisma.userProfile.create({
            data: { userId, role },
          });
        } else if (isAdminEmail && userProfile.role !== "ADMIN") {
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
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/auth/post-login`;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
});
